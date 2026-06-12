// ============================================================
// LUZ FRACA — render.js : motor raycasting + mão com lanterna
// ============================================================
'use strict';

const RW = 960, RH = 540;
const NUM_RAYS = 320;            // colunas de 3px
const COL_W = RW / NUM_RAYS;
const FOV = Math.PI / 3;         // 60°

const Renderer = {
  cv: null, cx: null, ov: null, ox: null, mm: null, mx: null,
  zbuf: new Float32Array(NUM_RAYS),
  shake: 0,

  init() {
    this.cv = document.getElementById('game-canvas');
    this.cx = this.cv.getContext('2d');
    this.ov = document.getElementById('overlay-canvas');
    this.ox = this.ov.getContext('2d');
    this.mm = document.getElementById('minimap');
    this.mx = this.mm.getContext('2d');
  },

  // luz total num ponto da tela: ambiente + cone da lanterna
  lightAt(dist, colFrac, G) {
    const L = G.level;
    let amb = L.ambientLight;
    if (G.blackoutActive) amb = 0.015;
    if (G.darkRoomAt) amb = 0.02;
    let lum = amb * Math.max(0.15, 1 - dist / 30);
    if (G.player.lanternOn && !G.lanternKilled) {
      const range = G.lanternRange() * (G.player.focusing ? 1.5 : 1);
      const cone = G.player.focusing ? 0.18 : 0.42;        // largura do cone (fração da tela)
      const off = Math.abs(colFrac - 0.5);
      const coneF = Math.max(0, 1 - (off / cone) ** 2);
      const distF = Math.max(0, 1 - dist / range);
      let intensity = coneF * distF * G.lanternFlicker;
      lum += intensity * 0.95;
    }
    return Math.min(1, lum) * (SAVE.settings.brightness / 100);
  },

  shadeColor(hex, lum, tint) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    let rr = r * lum, gg = g * lum, bb = b * lum;
    if (tint) { rr = rr * 0.7 + tint[0] * lum * 0.3; gg = gg * 0.7 + tint[1] * lum * 0.3; bb = bb * 0.7 + tint[2] * lum * 0.3; }
    return `rgb(${rr | 0},${gg | 0},${bb | 0})`;
  },

  frame(G, dt) {
    const cx = this.cx, p = G.player, m = G.map, pal = G.level.palette;
    cx.save();
    // tremor da mão / tela
    if (this.shake > 0) {
      cx.translate((Math.random() - 0.5) * this.shake * 8, (Math.random() - 0.5) * this.shake * 8);
      this.shake = Math.max(0, this.shake - dt * 2);
    }

    // ---------- céu e chão ----------
    cx.fillStyle = pal.ceil; cx.fillRect(-10, -10, RW + 20, RH / 2 + 10);
    cx.fillStyle = pal.floor; cx.fillRect(-10, RH / 2, RW + 20, RH / 2 + 10);
    // poça de luz da lanterna no chão
    if (p.lanternOn && !G.lanternKilled) {
      const gr = cx.createRadialGradient(RW / 2, RH * 0.86, 10, RW / 2, RH * 0.86, RW * 0.4);
      const a = 0.16 * G.lanternFlicker * (SAVE.settings.brightness / 100);
      gr.addColorStop(0, `rgba(255,235,180,${a})`);
      gr.addColorStop(1, 'rgba(255,235,180,0)');
      cx.fillStyle = gr; cx.fillRect(0, RH / 2, RW, RH / 2);
    }
    // luar/ambiente no teto e chão (fases claras)
    if (G.level.ambientLight > 0.2) {
      cx.fillStyle = `rgba(255,250,210,${(G.level.ambientLight - 0.2) * 0.5})`;
      cx.fillRect(0, 0, RW, RH);
    }

    // ---------- paredes (DDA) ----------
    const dirA = p.angle;
    for (let r = 0; r < NUM_RAYS; r++) {
      const colFrac = r / NUM_RAYS;
      const rayA = dirA - FOV / 2 + FOV * colFrac;
      const cos = Math.cos(rayA), sin = Math.sin(rayA);
      let mapX = Math.floor(p.x), mapY = Math.floor(p.y);
      const dX = Math.abs(1 / (cos || 1e-9)), dY = Math.abs(1 / (sin || 1e-9));
      let stepX, stepY, sideX, sideY;
      if (cos < 0) { stepX = -1; sideX = (p.x - mapX) * dX; } else { stepX = 1; sideX = (mapX + 1 - p.x) * dX; }
      if (sin < 0) { stepY = -1; sideY = (p.y - mapY) * dY; } else { stepY = 1; sideY = (mapY + 1 - p.y) * dY; }
      let side = 0, tile = TILE.WALL, dist = 30;
      for (let i = 0; i < 64; i++) {
        if (sideX < sideY) { sideX += dX; mapX += stepX; side = 0; } else { sideY += dY; mapY += stepY; side = 1; }
        if (mapX < 0 || mapY < 0 || mapX >= MAP_W || mapY >= MAP_H) { dist = 30; break; }
        const v = m.t[mapY * MAP_W + mapX];
        if (v === TILE.WALL || v === TILE.WALL2 || (v === TILE.EXIT && !G.exitOpen) || (v === TILE.EXIT && G.exitOpen)) {
          tile = v;
          dist = side === 0 ? sideX - dX : sideY - dY;
          break;
        }
      }
      dist = Math.max(0.05, dist) * Math.cos(rayA - dirA); // anti fisheye
      this.zbuf[r] = dist;
      const hgt = Math.min(RH * 3, RH / dist);
      const top = RH / 2 - hgt / 2 + (p.crouching ? hgt * 0.08 : 0);
      let color = tile === TILE.WALL2 ? pal.wall2 : pal.wall;
      if (tile === TILE.EXIT) color = G.exitOpen ? '#5a8a4a' : '#1c1814';
      let lum = this.lightAt(dist, colFrac, G);
      if (side === 1) lum *= 0.78;
      cx.fillStyle = this.shadeColor(color, lum);
      cx.fillRect(r * COL_W, top, COL_W + 1, hgt);
      // brilho da saída aberta
      if (tile === TILE.EXIT && G.exitOpen) {
        cx.fillStyle = `rgba(120,220,120,${0.25 * Math.max(0, 1 - dist / 20)})`;
        cx.fillRect(r * COL_W, top, COL_W + 1, hgt);
      }
    }

    // ---------- sprites ----------
    const sprites = [];
    const push = (x, y, img, scale, glow, glowColor, always, yOff) => {
      const dx = x - p.x, dy = y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 30 || dist < 0.2) return;
      let ang = Math.atan2(dy, dx) - dirA;
      while (ang > Math.PI) ang -= Math.PI * 2;
      while (ang < -Math.PI) ang += Math.PI * 2;
      if (Math.abs(ang) > FOV / 2 + 0.4) return;
      sprites.push({ x, y, img, scale, glow, glowColor, dist, ang, always, yOff: yOff || 0 });
    };

    // moedas
    const pulse = 0.6 + 0.4 * Math.sin(G.time * 2.4);
    for (const c of m.coins) {
      if (c.taken) continue;
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      const glowVis = d < 8;  // brilho visível mesmo no escuro a 8m
      push(c.x, c.y, itemSprite(c.v > 1 ? 'coin2' : 'coin', SAVE.settings.colorblind), 0.22, glowVis ? pulse : 0, '255,200,80', glowVis);
    }
    // papel de lore
    if (!G.paperTaken) {
      push(m.paper.x, m.paper.y, itemSprite('paper', SAVE.settings.colorblind), 0.3, 0.5 + 0.5 * Math.sin(G.time * 3.2), '160,210,255', true);
    }
    // pilhas
    for (const b of m.batteries) if (!b.taken) push(b.x, b.y, itemSprite('battery'), 0.2, 0.3, '120,255,120', true);
    // props
    for (const pr of m.props) {
      if (pr.type === 'cana' && pr.taken) continue;
      const img = pr.type === 'cana' ? itemSprite('cana') : propSprite(pr.type);
      const sc = { lighthouse: 3.2, baobab: 1.6, tree: 1.4, rocket: 2.4, well: 1.0, goal: 1.2, idol: 2.0, wreck: 1.3 }[pr.type] || 0.8;
      const glow = pr.type === 'candle' ? 0.5 + 0.3 * Math.sin(G.time * 7 + pr.x) : pr.type === 'blackcandle' ? 0.3 : 0;
      push(pr.x, pr.y, img, sc, glow, pr.type === 'candle' ? '255,170,60' : '140,80,255', glow > 0);
    }
    // monstros
    for (const mo of G.monsters) {
      if (mo.key === 'deuscego') continue;     // renderizado como o salão inteiro
      let img = monsterSprite(mo.def.shape);
      let sc = mo.key === 'faroleiro' ? 1.35 : mo.key === 'pombero' ? 0.62 : mo.key === 'jogador12' ? 1.1 : 1.0;
      if (mo.key === 'adze' && !mo.revealed) { img = fireflySprite(); sc = 0.16; }
      push(mo.x, mo.y, img, sc, mo.key === 'adze' && !mo.revealed ? 0.8 : 0, '232,160,80', mo.key === 'adze' && !mo.revealed);
      mo._screen = null;
    }

    sprites.sort((a, b) => b.dist - a.dist);
    for (const s of sprites) {
      const size = Math.min(RH * 2.5, (RH / s.dist) * s.scale);
      const sx = (0.5 + s.ang / FOV) * RW;
      const sy = RH / 2 + (RH / s.dist) * (0.5 - s.scale / 2) - (RH / s.dist) * s.yOff;
      const col = Math.floor(sx / COL_W);
      // oclusão pelo zbuffer (checa coluna central)
      if (col >= 0 && col < NUM_RAYS && this.zbuf[col] < s.dist - 0.3) continue;
      let lum = this.lightAt(s.dist, sx / RW, G);
      if (s.always) lum = Math.max(lum, 0.55);
      if (lum < 0.03) continue;
      cx.save();
      cx.globalAlpha = Math.min(1, lum * 1.6);
      if (s.glow) {
        const gr = cx.createRadialGradient(sx, sy, 1, sx, sy, size * 0.9);
        gr.addColorStop(0, `rgba(${s.glowColor},${0.35 * s.glow})`);
        gr.addColorStop(1, `rgba(${s.glowColor},0)`);
        cx.fillStyle = gr;
        cx.fillRect(sx - size, sy - size, size * 2, size * 2);
      }
      cx.imageSmoothingEnabled = false;
      const w = size * (s.img.width / s.img.height);
      cx.drawImage(s.img, sx - w / 2, sy - size / 2, w, size);
      cx.restore();
      // guarda posição na tela dos monstros (gaze do Monge, sustos)
      for (const mo of G.monsters) {
        if (Math.abs(mo.x - s.x) < 0.01 && Math.abs(mo.y - s.y) < 0.01) {
          mo._screen = { x: sx, y: sy, size, dist: s.dist };
        }
      }
    }

    // ---------- Deus Cego: a mão colossal no Salão da Voz ----------
    if (G.level.godHall && G.inGodHall) {
      const img = monsterSprite('deuscego');
      const breathe = G.godExhaling ? 1.15 : 1 + 0.04 * Math.sin(G.time * 0.8);
      const hgt = RH * 0.95 * breathe;
      cx.save();
      cx.globalAlpha = 0.85;
      cx.drawImage(img, RW / 2 - hgt * 0.35, RH - hgt, hgt * 0.7, hgt);
      cx.restore();
    }

    // ---------- visão espectral ----------
    if (G.spectralTimer > 0) {
      cx.save();
      cx.globalAlpha = Math.min(1, G.spectralTimer);
      for (const mo of G.monsters) {
        if (mo.key === 'deuscego') continue;
        const dx = mo.x - p.x, dy = mo.y - p.y;
        const dist = Math.hypot(dx, dy);
        let ang = Math.atan2(dy, dx) - dirA;
        while (ang > Math.PI) ang -= Math.PI * 2;
        while (ang < -Math.PI) ang += Math.PI * 2;
        if (Math.abs(ang) > FOV / 2 + 0.3 || dist < 0.5) continue;
        const size = Math.min(RH * 2, RH / dist);
        const sx = (0.5 + ang / FOV) * RW;
        cx.globalCompositeOperation = 'screen';
        cx.filter = 'blur(2px)';
        cx.fillStyle = 'rgba(255,40,40,0.55)';
        const w = size * 0.5;
        cx.fillRect(sx - w / 2, RH / 2 - size / 2, w, size);
        cx.filter = 'none';
      }
      cx.restore();
      cx.globalCompositeOperation = 'source-over';
    }

    // ---------- bússola da lore ----------
    if (G.compassTimer > 0 && !G.paperTaken) {
      const ang = Math.atan2(m.paper.y - p.y, m.paper.x - p.x) - dirA;
      cx.save();
      cx.translate(RW / 2, RH * 0.2);
      cx.rotate(ang);
      cx.globalAlpha = 0.55 + 0.3 * Math.sin(G.time * 5);
      cx.fillStyle = '#9ac8ff';
      cx.beginPath(); cx.moveTo(26, 0); cx.lineTo(-12, -10); cx.lineTo(-6, 0); cx.lineTo(-12, 10); cx.closePath(); cx.fill();
      cx.restore();
    }

    // ---------- farol varrendo ----------
    if (G.lighthouseActive) {
      const beam = (G.time * 1.2) % (Math.PI * 2);
      let rel = beam - dirA;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      if (Math.abs(rel) < 0.7) {
        cx.fillStyle = `rgba(255,250,200,${0.18 * (1 - Math.abs(rel) / 0.7)})`;
        cx.fillRect(0, 0, RW, RH);
      }
    }

    cx.restore();
    this.drawHand(G, dt);
    this.drawMinimap(G);
  },

  // ---------- a mão com a lanterna (única parte visível do corpo) ----------
  drawHand(G, dt) {
    const ox = this.ox, p = G.player;
    ox.clearRect(0, 0, RW, RH);
    const t = G.time;
    // balanço ao andar + tremor por proximidade de monstro
    const sway = p.moving ? Math.sin(t * (p.running ? 11 : 6)) * (p.running ? 14 : 7) : Math.sin(t * 1.4) * 3;
    const bob = p.moving ? Math.abs(Math.cos(t * (p.running ? 11 : 6))) * (p.running ? 10 : 5) : Math.sin(t * 1.1) * 2;
    let tremor = G.nearestMonsterDist < 10 ? (10 - G.nearestMonsterDist) / 10 : 0;
    tremor += Math.min(0.5, (SAVE.deaths.reduce((a, b) => a + b, 0)) / 60); // mão de quem morreu treme mais
    const tx = (Math.random() - 0.5) * tremor * 9, ty = (Math.random() - 0.5) * tremor * 9;
    const hx = RW * 0.68 + sway + tx, hy = RH * 0.78 + bob + ty + (p.crouching ? 26 : 0);

    ox.save();
    ox.translate(hx, hy);
    ox.rotate(-0.32 + sway * 0.004);
    // braço
    ox.fillStyle = '#16120e';
    ox.fillRect(40, 60, 150, 180);
    // mão (a mão conta história: suja conforme fase/mortes)
    const dirtLvl = Math.min(1, G.level.id / 9 + SAVE.deaths.reduce((a, b) => a + b, 0) / 80);
    const skin = `rgb(${168 - dirtLvl * 60},${140 - dirtLvl * 55},${116 - dirtLvl * 50})`;
    ox.fillStyle = skin;
    ox.beginPath(); ox.ellipse(60, 70, 46, 58, 0.25, 0, 7); ox.fill();
    // dedos agarrando a lanterna
    for (let i = 0; i < 4; i++) {
      ox.beginPath();
      ox.ellipse(18 - i * 4, 26 + i * 17, 30, 11, 0.12, 0, 7);
      ox.fill();
    }
    // arranhões e curativos (fases avançadas)
    if (dirtLvl > 0.25) {
      ox.strokeStyle = 'rgba(90,28,16,0.7)'; ox.lineWidth = 2;
      ox.beginPath(); ox.moveTo(48, 40); ox.lineTo(78, 66); ox.stroke();
      ox.beginPath(); ox.moveTo(70, 96); ox.lineTo(92, 110); ox.stroke();
    }
    if (dirtLvl > 0.6) { // curativo improvisado / fase 10: enfaixada
      ox.fillStyle = '#9a9284';
      ox.fillRect(30, 78, 64, 14);
      ox.fillRect(42, 50, 14, 60);
    }
    // a lanterna
    const gold = SAVE.nightmare; // skin dourada
    ox.fillStyle = gold ? '#8a6a18' : '#23201c';
    ox.fillRect(-58, 10, 86, 40);
    ox.fillStyle = gold ? '#c9a83a' : '#3a3631';
    ox.fillRect(-74, 4, 22, 52);
    // halo da lente
    if (p.lanternOn && !G.lanternKilled) {
      const gr = ox.createRadialGradient(-70, 30, 2, -70, 30, 60);
      gr.addColorStop(0, `rgba(255,242,200,${0.9 * G.lanternFlicker})`);
      gr.addColorStop(1, 'rgba(255,242,200,0)');
      ox.fillStyle = gr;
      ox.fillRect(-130, -30, 130, 120);
    }
    ox.restore();

    // efeito de esconderijo: frestas de persiana
    if (p.hidden) {
      ox.fillStyle = 'rgba(0,0,0,0.93)';
      for (let i = 0; i < 7; i++) {
        ox.fillRect(0, i * (RH / 7), RW, RH / 7 - 16);
      }
      // indicador de fôlego
      if (p.holdingBreath) {
        ox.fillStyle = 'rgba(180,200,255,0.5)';
        ox.fillRect(RW / 2 - 80, RH - 40, 160 * (p.breathLeft / p.breathMax()), 6);
      }
    }
    // pânico: embaçado (via CSS no canvas principal)
    this.cv.style.filter = G.panicTimer > 0 ? `blur(${Math.min(6, G.panicTimer * 3)}px)` : '';
  },

  // ---------- minimapa (Mapa Rabiscado) ----------
  drawMinimap(G) {
    const show = SAVE.perm.map && !G.level.noMap && !G.anyChasing && !G.player.dead;
    this.mm.classList.toggle('hidden', !show);
    if (!show) return;
    const mx = this.mx, m = G.map, s = 150 / MAP_W;
    mx.clearRect(0, 0, 150, 150);
    mx.fillStyle = 'rgba(20,16,10,0.85)';
    mx.fillRect(0, 0, 150, 150);
    mx.fillStyle = 'rgba(190,175,140,0.7)';
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      const v = m.t[y * MAP_W + x];
      if (v === TILE.WALL || v === TILE.WALL2) mx.fillRect(x * s, y * s, s, s);
    }
    // só a SUA posição — nunca monstros, nunca itens
    mx.fillStyle = '#e8d8a0';
    mx.beginPath(); mx.arc(G.player.x * s, G.player.y * s, 3, 0, 7); mx.fill();
    mx.strokeStyle = '#e8d8a0';
    mx.beginPath();
    mx.moveTo(G.player.x * s, G.player.y * s);
    mx.lineTo(G.player.x * s + Math.cos(G.player.angle) * 7, G.player.y * s + Math.sin(G.player.angle) * 7);
    mx.stroke();
  },
};
