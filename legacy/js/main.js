// ============================================================
// LUZ FRACA — main.js : estado do jogo, loop, mecânicas de fase,
// morte, vitória, final, Modo Pesadelo
// ============================================================
'use strict';

let G = null;
let rafId = null, lastT = 0;

// ---------- iniciar fase ----------
function startLevel(id, nightmare) {
  const level = LEVELS[id];
  const map = generateMap(level, nightmare);
  G = {
    running: true, paused: false,
    level, map, nightmare,
    player: makePlayer(map.spawn),
    monsters: [],
    time: 0, runCoins: 0,
    paperTaken: false, exitOpen: false, fury: false,
    noisesPending: [],
    trail: [],
    anyChasing: false, chasers: 0,
    spectralTimer: 0, compassTimer: 0, incenseTimer: 0,
    panicTimer: 0, blindCooldown: 0,
    usedBatteries: 0, usedBells: 0, usedCompass: false, usedSecond: false,
    offeringsLeft: 0,
    lanternKilled: false, lanternFlicker: 1, lanternEverOn: true,
    // mecânicas de fase
    blackoutActive: false, blackoutTimer: level.blackout || 0, countdownN: -1,
    tideHigh: false, tideTimer: 0, tideRising: false,
    lighthouseActive: false, lighthouseTimer: 0,
    godPhase: 0, godExhaling: false, inGodHall: false,
    promoTarget: null, promoTimer: 35,
    reorganizeTimer: 25,
    hordeAlert: 0, hordeTarget: { x: 0, y: 0 },
    choirNotes: 0, choirNoteTimer: 0, choirLock: 0, choirTarget: { x: 0, y: 0 },
    stationaryTime: 0, lastPos: { x: map.spawn.x, y: map.spawn.y },
    wellDescending: 0,
    darkRoomAt: false,
    vhsTimer: 90 + Math.random() * 120,
    consSlots: [],
    // ---- helpers ----
    tileAt(x, y) { return map.t[Math.floor(y) * MAP_W + Math.floor(x)]; },
    caption: addCaption,
    lanternRange() { return [6, 9, 13, 18][SAVE.perm.lantern]; },
    spatialTo(x, y, maxDist) {
      return AudioSys.spatial(x - G.player.x, y - G.player.y, G.player.angle, maxDist);
    },
    nearCandle(x, y, r) {
      return map.props.some(p => (p.type === 'candle') && Math.hypot(p.x - x, p.y - y) < r);
    },
    emitNoise(x, y, radius) {
      for (const mo of G.monsters) {
        if (mo.hearNoise({ x, y, radius })) {
          if (mo.def.choir) { // Fiéis: cantam em rede
            const sp = G.spatialTo(mo.x, mo.y, 40);
            AudioSys.radar('choirNote', sp || { pan: 0, vol: 0.5 }, 1);
            G.choirNotes++;
            G.choirNoteTimer = 20;
            if (G.choirNotes >= 3 && G.choirLock <= 0) {
              G.choirLock = 15;
              G.choirTarget = { x: G.player.x, y: G.player.y };
              G.caption('[o coro afinou em UNÍSSONO — todos se levantaram]');
            }
          } else {
            mo.alert(x, y);
          }
        }
      }
    },
    onChaseStart(mo) {
      G.chasers++;
      G.anyChasing = true;
      AudioSys.startChase(level.id);
      Renderer.shake = 1;
    },
    onChaseEnd() {
      G.chasers = Math.max(0, G.chasers - 1);
      if (G.chasers === 0) { G.anyChasing = false; AudioSys.stopChase(); }
    },
    onDamaSight(n) { updatePetals(n); },
    onCaught(mo) { onPlayerCaught(mo); },
    godStrike() {
      G.caption('[a mão desceu]');
      doDeath(G.monsters.find(m => m.key === 'deuscego') || G.monsters[0]);
    },
    startLighthouse() {
      G.lighthouseActive = true;
      G.lighthouseTimer = 30;
      G.caption('[o farol ACENDEU — saia do facho]');
    },
  };
  // slots de consumíveis (teclas 1-3) — a Visão Espectral é consumida
  // automaticamente no início da fase, então não ocupa slot
  const order = ['battery', 'bell', 'incense', 'adrenaline', 'compass'];
  G.consSlots = order.filter(idc => (SAVE.cons[idc] || 0) > 0).slice(0, 3);
  while (G.consSlots.length < 3) G.consSlots.push(null);

  // fase 3 começa com a lanterna apagada (ambiente claro + conquista Cego por Opção)
  if (level.id === 2) { G.player.lanternOn = false; G.lanternEverOn = false; }

  G.monsters = spawnMonsters(G, level, nightmare);

  // maré inicial da ilha: baixa (templo acessível depois de 1 ciclo)
  if (level.tide) setTide(true);

  // visão espectral: consome 1 automaticamente se houver (1 uso por fase, no início)
  if ((SAVE.cons.spectral || 0) > 0) {
    SAVE.cons.spectral--;
    saveGame();
    G.spectralTimer = 5;
    addCaption('[Visão Espectral: 5 segundos]');
  }

  // UI
  stopMenuBg();
  showScreen('game');
  document.getElementById('death-screen').classList.add('hidden');
  document.getElementById('win-screen').classList.add('hidden');
  document.getElementById('final-screen').classList.add('hidden');
  document.getElementById('pause-menu').classList.add('hidden');
  document.getElementById('hud-petals').classList.add('hidden');
  updateHudSlots();
  updatePetals(0);
  document.getElementById('hud-petals').classList.toggle('hidden', !level.monsters.includes('dama'));

  AudioSys.init();
  AudioSys.silenceAll();
  AudioSys.startDrone(level.drone);
  document.getElementById('game-canvas').requestPointerLock?.();

  lastT = performance.now();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

// ---------- loop ----------
function gameLoop(now) {
  if (!G || !G.running) return;
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  if (!G.paused && !G.player.dead) {
    G.time += dt;
    tickLevelMechanics(dt);
    updatePlayer(dt);
    for (const mo of G.monsters) mo.update(dt);
    tickAmbient(dt);
  }
  Renderer.frame(G, dt);
  rafId = requestAnimationFrame(gameLoop);
}

// ---------- mecânicas exclusivas por fase ----------
function tickLevelMechanics(dt) {
  const p = G.player, L = G.level;

  // timers gerais
  if (G.spectralTimer > 0) G.spectralTimer -= dt;
  if (G.compassTimer > 0) G.compassTimer -= dt;
  if (G.incenseTimer > 0) G.incenseTimer -= dt;
  if (G.panicTimer > 0) G.panicTimer -= dt;
  if (G.blindCooldown > 0) G.blindCooldown -= dt;
  if (G.hordeAlert > 0) G.hordeAlert -= dt;
  if (G.choirLock > 0) G.choirLock -= dt;
  if (G.choirNoteTimer > 0) { G.choirNoteTimer -= dt; if (G.choirNoteTimer <= 0) G.choirNotes = 0; }

  // rastro de cheiro envelhece (60s)
  while (G.trail.length && G.time - G.trail[0].t > 60) G.trail.shift();

  // anti-camping: faro/instinto após 30s parado
  const moved = Math.hypot(p.x - G.lastPos.x, p.y - G.lastPos.y);
  if (moved < 0.5 && !p.hidden) {
    G.stationaryTime += dt;
    if (G.stationaryTime > 30) {
      G.stationaryTime = 0;
      G.caption('[algo farejou você parado aí]');
      let best = null, bd = 1e9;
      for (const mo of G.monsters) {
        const d = mo.distPlayer();
        if (d < bd && mo.key !== 'deuscego') { bd = d; best = mo; }
      }
      if (best) best.alert(p.x, p.y);
    }
  } else { G.stationaryTime = 0; G.lastPos = { x: p.x, y: p.y }; }

  // poço da savana: descida de 8s vulnerável
  if (G.wellDescending > 0) {
    G.wellDescending -= dt;
    p.moving = false;
    if (G.wellDescending <= 0) {
      G.caption('[no fundo do poço… você descobriu o que pesava na corda]');
      takePaper();
    }
  }

  // sala escura dos backrooms
  G.darkRoomAt = false;
  if (G.map.darkRoom) {
    const d = G.map.darkRoom;
    if (p.x >= d.x0 && p.x <= d.x1 + 1 && p.y >= d.y0 && p.y <= d.y1 + 1) G.darkRoomAt = true;
  }

  // backrooms se reorganizam quando você não olha
  if (L.id === 2) {
    G.reorganizeTimer -= dt;
    if (G.reorganizeTimer <= 0) {
      G.reorganizeTimer = 20 + Math.random() * 18;
      reorganizeMaze();
      AudioSys.noise(AudioSys.scare, 1.2, { freq: 120, gain: 0.18, q: 1, attack: 0.4 });
      G.caption('[som de mobília arrastando atrás de você]');
    }
    // zumbido muda de tom perto do Errante
    const err = G.monsters.find(m => m.key === 'errante');
    if (err) AudioSys.setHumProximity(Math.max(0, 1 - err.distPlayer() / 20));
  }

  // Walmart: anúncios de promoção
  if (L.id === 1) {
    G.promoTimer -= dt;
    if (G.promoTimer <= 0) {
      G.promoTimer = 40 + Math.random() * 25;
      const t = randomFreePoint(G.map);
      G.promoTarget = t;
      AudioSys.whisper('promocao no corredor sete');
      G.caption('["Promoçããão… no corredor… ' + (1 + (Math.random() * 9 | 0)) + '…"]');
      setTimeout(() => { if (G) G.promoTarget = null; }, 15000);
    }
  }

  // NASA: contagem regressiva e apagão
  if (L.blackout) {
    G.blackoutTimer -= dt;
    if (!G.blackoutActive && G.blackoutTimer <= 10 && G.blackoutTimer > 0) {
      const n = Math.ceil(G.blackoutTimer);
      if (n !== G.countdownN) {
        G.countdownN = n;
        AudioSys.tone(AudioSys.fx, 0.18, { freq: 880, type: 'square', gain: 0.1 });
        G.caption('[alto-falantes: … ' + n + ' …]');
      }
    }
    if (G.blackoutTimer <= 0 && !G.blackoutActive) {
      G.blackoutActive = true;
      G.blackoutTimer = 20;
      G.caption('[APAGÃO TOTAL — 20 segundos]');
      AudioSys.noise(AudioSys.scare, 2, { freq: 60, gain: 0.4, q: 0.5, type: 'lowpass' });
    } else if (G.blackoutActive && G.blackoutTimer <= 0) {
      G.blackoutActive = false;
      G.blackoutTimer = L.blackout;
      G.countdownN = -1;
      G.caption('[as luzes de emergência voltaram]');
    }
  }

  // Ilha: maré respirando
  if (L.tide) {
    G.tideTimer += dt;
    const period = G.tideRising ? 60 : L.tide; // depois do papel, sobe rápido
    if (G.tideTimer > period) {
      G.tideTimer = 0;
      setTide(G.tideHigh); // alterna
    }
  }

  // farol varrendo
  if (G.lighthouseActive) {
    G.lighthouseTimer -= dt;
    if (G.lighthouseTimer <= 0) { G.lighthouseActive = false; G.caption('[o farol apagou]'); }
    else if (!p.hidden && Math.random() < dt * 0.5) {
      // pego no facho: posição marcada para TODOS
      G.caption('[o facho passou por você — eles SABEM]');
      for (const mo of G.monsters) if (mo.key !== 'deuscego') mo.alert(p.x, p.y);
      if (G.monsters.some(m => m.def.horde)) { G.hordeAlert = 10; G.hordeTarget = { x: p.x, y: p.y }; }
    }
  }

  // Sereia: canto inverte controles
  const sereia = G.monsters.find(m => m.key === 'sereia');
  if (sereia) {
    const d = sereia.distPlayer();
    p.invertTimer = d < 7 ? 0.5 : 0;
    if (d < 12 && Math.random() < dt * 0.25) {
      AudioSys.radar('song', G.spatialTo(sereia.x, sereia.y, 20), 1);
      if (d < 8) G.caption('[o canto dela embaralha suas mãos]');
    }
  }

  // Salão da Voz: a respiração do Deus Cego
  if (L.godHall) {
    G.inGodHall = G.tileAt(p.x, p.y) === TILE.GOD || p.y > 32;
    if (G.inGodHall) {
      G.godPhase += dt;
      const cycle = 15; // 12 inala + 3 exala
      const ph = G.godPhase % cycle;
      const wasEx = G.godExhaling;
      G.godExhaling = ph >= 12;
      if (G.godExhaling && !wasEx) {
        AudioSys.radar('breath', { pan: 0, vol: 1 }, 1);
        G.caption('[ELE EXALA — congele]');
      }
      if (!G.godExhaling && wasEx) G.caption('[inalação — ande agora]');
      G.lanternKilled = G.godExhaling; // a respiração apaga sua lanterna
    } else {
      G.lanternKilled = false;
      G.godExhaling = false;
    }
  }

  // tremulação da lanterna (bateria fraca + tremor)
  const batLow = p.battery < 0.25;
  G.lanternFlicker = 1;
  if (batLow) G.lanternFlicker = 0.55 + Math.random() * 0.45 * (p.battery / 0.25);
  if (G.nearestMonsterDist < 10) G.lanternFlicker *= 0.88 + Math.random() * 0.12;

  // frame de ruído VHS aleatório
  G.vhsTimer -= dt;
  if (G.vhsTimer <= 0) {
    G.vhsTimer = 120 + Math.random() * 180;
    const vhs = document.getElementById('fx-vhs');
    vhs.classList.remove('hidden');
    setTimeout(() => vhs.classList.add('hidden'), 90);
  }
}

function tickAmbient(dt) {
  const p = G.player;
  // monstro mais próximo (para tremor, radar, etc.)
  let nd = 1e9;
  for (const mo of G.monsters) {
    if (mo.key === 'deuscego') continue;
    nd = Math.min(nd, mo.distPlayer());
  }
  G.nearestMonsterDist = nd;
  // Radar de Batimentos
  if (SAVE.perm.radar && nd < 15) AudioSys.heartbeatPulse(nd < 7 ? 2 : 1);
  // olhar sobre o Monge Oco (centro da tela por 2s acumulados)
  const monge = G.monsters.find(m => m.key === 'monge');
  if (monge && !monge.activated && monge._screen) {
    if (Math.abs(monge._screen.x - RW / 2) < 110 && monge._screen.dist < 16) {
      monge.gazeAccum += dt;
      if (monge.gazeAccum > 0.8) G.caption('[não olhe para o monge]');
    }
  }
}

// backrooms: muda paredes longe do jogador
function reorganizeMaze() {
  const m = G.map, p = G.player;
  for (let i = 0; i < 14; i++) {
    const x = 2 + (Math.random() * (MAP_W - 4) | 0), y = 2 + (Math.random() * (MAP_H - 4) | 0);
    if (Math.hypot(x - p.x, y - p.y) < 10) continue;
    const v = m.t[y * MAP_W + x];
    if (v === TILE.FLOOR) m.t[y * MAP_W + x] = TILE.WALL;
    else if (v === TILE.WALL && Math.random() < 0.7) m.t[y * MAP_W + x] = TILE.FLOOR;
  }
  // garante que papel e saída continuam alcançáveis
  ensureConnectivity(m);
}

// ilha: alterna a maré
function setTide(low) {
  const m = G.map;
  G.tideHigh = !low;
  for (const i of m.tideTiles) m.t[i] = low ? TILE.FLOOR : TILE.WATER;
  for (const i of m.templeTiles) m.t[i] = low ? TILE.FLOOR : TILE.WATER;
  if (G.time > 1) G.caption(low ? '[a maré BAIXOU — o templo abriu]' : '[a maré está SUBINDO]');
}

// ---------- morte / segunda chance ----------
function onPlayerCaught(mo) {
  const p = G.player;
  if (p.dead) return;
  // Segunda Chance (não funciona na fase 10)
  if (!G.usedSecond && (SAVE.cons.second || 0) > 0 && !G.level.noSecondChance) {
    G.usedSecond = true;
    SAVE.cons.second--;
    saveGame();
    AudioSys.secondChance();
    // jogado 20 metros para longe
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const nx = p.x + Math.cos(a) * 20, ny = p.y + Math.sin(a) * 20;
      if (nx > 1 && ny > 1 && nx < MAP_W - 1 && ny < MAP_H - 1 && !isSolidTile(G.tileAt(nx, ny), G.exitOpen)) {
        p.x = nx; p.y = ny;
        break;
      }
    }
    G.panicTimer = SAVE.perm.calm ? 1 : 3;
    mo.loseTrack?.();
    G.caption('[SEGUNDA CHANCE — você acordou longe, coração disparado]');
    updateHudSlots();
    return;
  }
  doDeath(mo);
}

function doDeath(mo) {
  const p = G.player;
  p.dead = true;
  AudioSys.jumpscare();
  AudioSys.silenceAll();
  Renderer.shake = 3;
  document.exitPointerLock?.();
  // estatísticas e economia
  SAVE.deaths[G.level.id]++;
  const lossFrac = SAVE.perm.pockets ? 0.25 : 0.5;
  const kept = Math.ceil(G.runCoins * (1 - lossFrac));
  const lost = G.runCoins - kept;
  SAVE.coins += kept;
  saveGame();
  setTimeout(() => {
    document.getElementById('death-screen').classList.remove('hidden');
    document.getElementById('death-message').textContent = '"' + G.level.deathMsg + '"';
    document.getElementById('death-stats').innerHTML =
      `${mo ? mo.def.name : '???'} pegou você.<br>` +
      `Moedas perdidas: ${lost} · Moedas mantidas: ${kept}<br>` +
      `Mortes nesta fase: ${SAVE.deaths[G.level.id]}`;
  }, 700);
}

// ---------- vitória ----------
function winLevel() {
  const id = G.level.id;
  const p = G.player;
  if (p.dead) return;
  p.dead = true; // trava o update
  document.exitPointerLock?.();
  AudioSys.silenceAll();
  AudioSys.winSound();

  const wasCleared = SAVE.cleared[id];
  const allCoins = G.map.coins.every(c => c.taken);
  let earned = G.runCoins + G.level.bonus;
  if (wasCleared) earned = Math.floor(earned * 0.5); // rejogada rende 50%
  SAVE.coins += earned;
  SAVE.papers[id] = true;
  SAVE.cleared[id] = true;
  if (allCoins) SAVE.allCoins[id] = true;
  if (!SAVE.bestTimes[id] || G.time < SAVE.bestTimes[id]) SAVE.bestTimes[id] = G.time;
  if (G.nightmare) {
    SAVE.nmCleared[id] = true;
    if (SAVE.nmCleared.every(Boolean)) {
      SAVE.nightmare = true;
      SAVE.paper12 = true;
      grantAch('maratonista');
    }
  }
  // conquistas
  const achs = [];
  if (SAVE.deaths[id] === 0) { const a = grantAch('peQuente'); if (a) achs.push(a.name); }
  if (allCoins) { const a = grantAch('paoDuro'); if (a) achs.push(a.name); }
  if (id === 2 && !G.lanternEverOn) { const a = grantAch('cego'); if (a) achs.push(a.name); }
  saveGame();

  document.getElementById('win-screen').classList.remove('hidden');
  document.getElementById('win-title').textContent = 'VOCÊ SOBREVIVEU';
  const mm = Math.floor(G.time / 60), ss = String(Math.floor(G.time % 60)).padStart(2, '0');
  document.getElementById('win-stats').innerHTML =
    `Papel ${id + 1} recuperado — leia no menu LORE.<br>` +
    `Moedas: ${G.runCoins} + bônus ${G.level.bonus}${wasCleared ? ' (rejogada: 50%)' : ''} = <b>+${earned}</b><br>` +
    `Tempo: ${mm}:${ss} · Moedas no banco: ${SAVE.coins}`;
  document.getElementById('win-achievement').textContent = achs.length ? '🏆 ' + achs.join(' · ') : '';
}

// ---------- final do jogo (papel 10) ----------
function finishGame() {
  const p = G.player;
  p.dead = true;
  document.exitPointerLock?.();
  AudioSys.silenceAll();
  SAVE.papers[9] = true;
  SAVE.cleared[9] = true;
  SAVE.coins += G.runCoins + G.level.bonus;
  if (G.nightmare) {
    SAVE.nmCleared[9] = true;
    if (SAVE.nmCleared.every(Boolean)) { SAVE.nightmare = true; SAVE.paper12 = true; grantAch('maratonista'); }
  }
  const first = !SAVE.finished;
  SAVE.finished = true;
  grantAch('leitor');
  const totalDeaths = SAVE.deaths.reduce((a, b) => a + b, 0);
  if (totalDeaths < 30) grantAch('maoFirme');
  saveGame();

  const screen = document.getElementById('final-screen');
  const txt = document.getElementById('final-text');
  const btn = document.getElementById('btn-final-ok');
  screen.classList.remove('hidden');
  btn.classList.add('hidden');
  txt.textContent = '';
  // texto datilografado lentamente
  let i = 0;
  const full = FINAL_TEXT;
  const type = () => {
    if (!G) return;
    txt.textContent = full.slice(0, i);
    i += 2;
    if (i <= full.length + 2) setTimeout(type, 38);
    else btn.classList.remove('hidden');
  };
  setTimeout(type, 1200);
  // o tambor do velho Kwame, calmo
  let beats = 0;
  const drum = setInterval(() => {
    if (!G || beats++ > 40) { clearInterval(drum); return; }
    AudioSys.radar('drum', { pan: 0, vol: 0.5 }, 0.7);
  }, 1400);
}

// ---------- pausa / desistir / fechar ----------
function togglePause() {
  if (!G || !G.running || G.player.dead) return;
  G.paused = !G.paused;
  document.getElementById('pause-menu').classList.toggle('hidden', !G.paused);
  if (G.paused) document.exitPointerLock?.();
}

function giveUp() {
  if (!G) return;
  // desistir: perde as moedas da run, sem contar morte
  closeGame();
  showScreen('play');
}

function closeGame() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  AudioSys.silenceAll();
  AudioSys.stopChase();
  document.exitPointerLock?.();
  G = null;
  refreshMenuCounters();
}

// ---------- bootstrap ----------
window.addEventListener('DOMContentLoaded', () => {
  Renderer.init();
  initInput();
  initUI();
  showScreen('intro');
});
