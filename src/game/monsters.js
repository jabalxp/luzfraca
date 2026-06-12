// ============================================================
// LUZ FRACA — monsters.js : IA dos monstros
// Estados: patrol → suspect → chase (+fúria após o papel)
// Cada monstro tem sentidos e comportamento próprios.
// ============================================================
import { MONSTERS } from './data.js';
import { AudioSys } from './audio.js';
import { SAVE } from './save.js';
import { TILE, MAP_W, isSolidTile, randomFreePoint, bfsNextStep, lineOfSight } from './mapgen.js';

let MONSTER_UID = 0;

export class Monster {
  constructor(key, game, spawnPos) {
    this.uid = ++MONSTER_UID;
    this.key = key;
    this.def = MONSTERS[key];
    this.game = game;
    this.x = spawnPos.x; this.y = spawnPos.y;
    this.dir = Math.random() * Math.PI * 2;
    this.state = 'patrol';          // patrol | suspect | chase | dormant
    this.wp = null;
    this.stimulus = null;
    this.stateTimer = 0;
    this.pathTimer = 0;
    this.nextStep = null;
    this.lastSeenPlayer = 0;
    this.radarTimer = Math.random() * 3;
    this.specialTimer = 0;
    this.sniffing = 0;
    // específicos
    this.sightCount = 0;            // Dama
    this.gazeAccum = 0;             // Monge
    this.activated = false;         // Monge / Kara-Kasa
    this.perched = false;           // Impundulu
    this.pauseTimer = 0;            // Pombero (oferenda) / cegueira por foco
    this.revealed = false;          // Adze
    this.atLighthouse = false;      // Faroleiro
    this.trailIdx = 0;              // Adze (rastro)
    if (key === 'monge') this.relocate();
  }

  // ---------- utilidades ----------
  dist(px, py) { return Math.hypot(this.x - px, this.y - py); }
  distPlayer() { const p = this.game.player; return this.dist(p.x, p.y); }

  speed() {
    const d = this.def.speeds;
    let s = this.state === 'chase' ? d.chase : d.patrol;
    if (this.game.fury) s = this.state === 'chase' ? d.fury : d.patrol * 1.2;
    if (this.game.nightmare) s *= 1.15;
    return s;
  }

  moveToward(tx, ty, dt, throughWalls) {
    const sp = this.speed();
    if (sp <= 0) return;
    if (throughWalls || this.def.flying) {
      const a = Math.atan2(ty - this.y, tx - this.x);
      this.x += Math.cos(a) * sp * dt;
      this.y += Math.sin(a) * sp * dt;
      this.dir = a;
      return;
    }
    this.pathTimer -= dt;
    if (this.pathTimer <= 0 || !this.nextStep) {
      this.pathTimer = 0.4;
      this.nextStep = bfsNextStep(this.game.map, this.x, this.y, tx, ty, this.game.exitOpen);
    }
    const t = this.nextStep || { x: tx, y: ty };
    const a = Math.atan2(t.y - this.y, t.x - this.x);
    const nx = this.x + Math.cos(a) * sp * dt;
    const ny = this.y + Math.sin(a) * sp * dt;
    const v = this.game.map.t[Math.floor(ny) * MAP_W + Math.floor(nx)];
    if (!isSolidTile(v, this.game.exitOpen)) { this.x = nx; this.y = ny; this.dir = a; }
    else this.nextStep = null;
    if (Math.hypot(t.x - this.x, t.y - this.y) < 0.4) this.nextStep = null;
  }

  relocate() { // teleporta para ponto livre longe do jogador
    const g = this.game;
    for (let i = 0; i < 30; i++) {
      const p = randomFreePoint(g.map);
      if (Math.hypot(p.x - g.player.x, p.y - g.player.y) > 12) { this.x = p.x; this.y = p.y; return; }
    }
  }

  // ---------- sentidos ----------
  canSeePlayer() {
    const g = this.game, p = g.player, d = this.def;
    if (p.hidden || p.dead) return false;
    if (!d.vision || d.vision.range <= 0) return false;
    if (this.pauseTimer > 0) return false;
    let range = d.vision.range;
    if (p.lanternOn && d.lightAttract) range *= d.lightAttract;
    if (!p.lanternOn && p.crouching) range *= 0.45;
    if (g.level.gen === 'savanna' && g.tileAt(p.x, p.y) === TILE.GRASS && !this.def.flying) range *= 0.35;
    const dd = this.distPlayer();
    if (dd > range) return false;
    if (!this.def.flying) {
      const angTo = Math.atan2(p.y - this.y, p.x - this.x);
      const diff = Math.abs(((angTo - this.dir) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
      if (diff > d.vision.fov) return false;
    }
    return lineOfSight(g.map, this.x, this.y, p.x, p.y);
  }

  senseHeat() {
    const g = this.game, p = g.player, h = this.def.heat;
    if (!h || p.hidden || p.dead) return false;
    // a Chorona se recusa a seguir os caminhos de pétalas
    if (this.key === 'chorona' && g.tileAt(p.x, p.y) === TILE.PETAL) return false;
    let radius = h.start + (h.end - h.start) * Math.min(1, g.time / 360);
    if (g.level.candles && g.nearCandle(p.x, p.y, 2.2)) radius *= 0.5;
    return this.distPlayer() < radius;
  }

  senseVibration() {
    const g = this.game, p = g.player, v = this.def.vibration;
    if (!v || p.hidden || p.dead || !p.moving) return false;
    const r = p.running ? v.run : p.crouching ? v.crouch : v.walk;
    return this.distPlayer() < r;
  }

  senseSmell() {
    const g = this.game, p = g.player;
    if (!this.def.smell || p.dead || g.incenseTimer > 0) return false;
    if (this.key === 'luison') return this.distPlayer() < (this.def.smellRadius || 14);
    return false; // Adze usa o rastro (trailHunter)
  }

  hearNoise(n) { // n: {x,y,radius}
    if (!this.def.hearing) return false;
    return this.dist(n.x, n.y) < n.radius * this.def.hearing;
  }

  // ---------- reações ----------
  alert(x, y) {
    if (this.state === 'chase') return;
    this.stimulus = { x, y };
    this.state = 'suspect';
    this.stateTimer = 0;
    if (this.key === 'jogador12') {
      const sp = this.game.spatialTo(this.x, this.y, 40);
      AudioSys.radar('claps', sp, 1);
      this.game.caption('[três palmas ecoam pelo estádio]');
    }
    if (this.key === 'profeta') {
      this.sermonPause = 3;
      this.game.caption('[o sermão PAROU]');
    }
  }

  startChase() {
    if (this.state !== 'chase') {
      this.state = 'chase';
      this.game.onChaseStart(this);
      if (this.key === 'repositor') this.game.caption('[o carrinho parou]');
      if (this.key === 'chorona') this.game.caption('[o choro parou]');
      if (this.key === 'luison' && this.def.howls) {
        AudioSys.radar('howl', { pan: 0, vol: 1 }, 1);
        this.game.caption('[um uivo que não é de lobo nem de homem]');
        for (const m of this.game.monsters) if (m.key === 'pombero') m.alert(this.game.player.x, this.game.player.y);
      }
    }
  }

  loseTrack() {
    this.state = 'suspect';
    this.stimulus = { x: this.game.player.x, y: this.game.player.y };
    this.stateTimer = 0;
    this.game.onChaseEnd();
  }

  // ---------- update ----------
  update(dt) {
    const g = this.game, p = g.player;
    this.stateTimer += dt;
    this.specialTimer -= dt;
    if (this.pauseTimer > 0) { this.pauseTimer -= dt; return; }

    this.radarTimer -= dt;
    if (this.radarTimer <= 0) {
      this.radarTimer = 1.2 + Math.random() * 2.2;
      this.emitRadar();
    }

    switch (this.def.behavior) {
      case 'patrolLoop': case 'perimeter': case 'patrolAnnounce': case 'wander': case 'coastPatrol':
        this.updateClassic(dt); break;
      case 'flyPerch': this.updateImpundulu(dt); break;
      case 'trailHunter': this.updateAdze(dt); break;
      case 'trickster': this.updatePombero(dt); break;
      case 'ceiling': this.updateAmostra(dt); break;
      case 'watcher': this.updateDama(dt); break;
      case 'gazeFollower': this.updateMonge(dt); break;
      case 'ambusher': this.updateKarakasa(dt); break;
      case 'waterHunter': this.updateSereia(dt); break;
      case 'horde': this.updateHordeMember(dt); break;
      case 'choir': this.updateFiel(dt); break;
      case 'god': break; // tratado no ritmo da respiração (sim.js)
    }

    // contato = morte (pétalas protegem da Chorona)
    const onPetal = this.key === 'chorona' && g.tileAt(p.x, p.y) === TILE.PETAL;
    if (!p.dead && !p.hidden && !onPetal && this.key !== 'deuscego' && this.distPlayer() < 0.7) {
      g.onCaught(this);
    }
    if (p.hidden && this.sawEnterHide && this.dist(p.x, p.y) < 1.0) {
      g.onCaught(this);
    }
  }

  updateClassic(dt) {
    const g = this.game, p = g.player;

    const sees = this.canSeePlayer();
    const heat = this.senseHeat();
    const vib = this.senseVibration();
    const smell = this.senseSmell();

    if (this.state !== 'chase' && (sees || heat || vib || smell)) {
      if (this.state === 'suspect' && this.stateTimer > 0.4) this.startChase();
      else if (sees && this.distPlayer() < (this.def.vision.range || 8) * 0.7) this.startChase();
      else this.alert(p.x, p.y);
    }

    if (this.state === 'chase') {
      if (p.hidden && !this.sawEnterHide) {
        if (this.sniffing <= 0) {
          this.sniffing = 4;
          g.caption('[respiração do outro lado da porta]');
        }
        this.sniffing -= dt;
        if (this.sniffing <= 0) { this.loseTrack(); return; }
        return;
      }
      const visible = sees || heat || vib || smell || this.distPlayer() < 3;
      if (visible) { this.lastSeenPlayer = g.time; this.chaseTarget = { x: p.x, y: p.y }; }
      if (!visible && g.time - this.lastSeenPlayer > 1.2 && SAVE.perm.rabbit && !this.rabbitRolled) {
        this.rabbitRolled = true;
        if (Math.random() < 0.25) { this.loseTrack(); g.caption('[ele perdeu seu rastro]'); return; }
      }
      if (visible) this.rabbitRolled = false;
      if (g.time - this.lastSeenPlayer > 5) { this.loseTrack(); return; }
      const t = this.chaseTarget || p;
      this.moveToward(t.x, t.y, dt);
    } else if (this.state === 'suspect') {
      if (this.stimulus) {
        if (this.key === 'jogador12' && this.stateTimer < 1.3) return;
        this.moveToward(this.stimulus.x, this.stimulus.y, dt * (this.key === 'jogador12' ? 2.2 : 1.4));
        if (this.dist(this.stimulus.x, this.stimulus.y) < 1) {
          this.stimulus = null; this.stateTimer = 0;
        }
      } else if (this.stateTimer > 3.5) {
        this.state = 'patrol';
        g.onChaseEnd();
      }
    } else {
      this.patrolMove(dt);
    }
  }

  patrolMove(dt) {
    const g = this.game;
    if (!this.wp || this.dist(this.wp.x, this.wp.y) < 0.8) {
      if (g.fury) {
        const ex = g.map.exit.x + 0.5, ey = g.map.exit.y + 1.5;
        const mid = Math.random();
        this.wp = {
          x: ex + (g.player.x - ex) * mid + (Math.random() - 0.5) * 6,
          y: ey + (g.player.y - ey) * mid + (Math.random() - 0.5) * 6,
        };
      } else if (this.key === 'jogador12' && g.map.patrolHint === 'ring') {
        this.ringIdx = ((this.ringIdx || 0) + 1) % 4;
        const ring = [{ x: 14, y: 14 }, { x: 33, y: 14 }, { x: 33, y: 33 }, { x: 14, y: 33 }];
        this.wp = ring[this.ringIdx];
      } else if (this.key === 'faroleiro') {
        if (Math.random() < 0.25 && !g.lighthouseActive) { this.wp = { x: 10.5, y: 11.5 }; this.headingLighthouse = true; }
        else { this.wp = { x: 8 + Math.random() * 32, y: 36 + Math.random() * 6 }; this.headingLighthouse = false; }
      } else {
        this.wp = randomFreePoint(g.map);
      }
    }
    this.moveToward(this.wp.x, this.wp.y, dt);
    if (this.key === 'faroleiro' && this.headingLighthouse && this.dist(10.5, 9.5) < 2.5) {
      g.startLighthouse();
      this.headingLighthouse = false;
      this.wp = randomFreePoint(g.map);
    }
    if (this.key === 'repositor' && g.promoTarget) {
      this.wp = g.promoTarget;
    }
  }

  // --- Impundulu: voa, pousa, varre ---
  updateImpundulu(dt) {
    const g = this.game, p = g.player;
    if (this.state === 'chase') {
      this.moveToward(p.x, p.y, dt, true);
      if (p.hidden || g.tileAt(p.x, p.y) === TILE.HIDE) { this.state = 'patrol'; this.perched = false; g.onChaseEnd(); }
      return;
    }
    if (this.perched) {
      this.perchTimer -= dt;
      const open = g.tileAt(p.x, p.y) !== TILE.GRASS && !p.hidden;
      const moving = p.moving && g.tileAt(p.x, p.y) === TILE.GRASS;
      if (!p.dead && !p.hidden && this.distPlayer() < 26 && ((p.lanternOn && open) || moving || (open && p.running))) {
        AudioSys.radar('thunder', { pan: 0, vol: 0.9 }, 1);
        g.caption('[um trovão seco]');
        this.startChase();
        this.perched = false;
        return;
      }
      if (this.perchTimer <= 0) { this.perched = false; this.specialTimer = 6 + Math.random() * 8; }
    } else {
      if (!this.wp || this.dist(this.wp.x, this.wp.y) < 1.5) this.wp = randomFreePoint(g.map);
      this.moveToward(this.wp.x, this.wp.y, dt, true);
      if (this.specialTimer <= 0) {
        this.perched = true;
        this.perchTimer = 5;
        this.specialTimer = 40 + Math.random() * 30;
        g.caption('[os grilos calaram]');
      }
    }
    AudioSys.setCricketSilence(Math.max(0, 1 - this.distPlayer() / 18));
  }

  // --- Adze: segue o rastro do jogador como vagalume ---
  updateAdze(dt) {
    const g = this.game, p = g.player;
    if (this.state === 'chase') {
      this.revealed = true;
      this.moveToward(p.x, p.y, dt);
      if (this.distPlayer() > 9 || g.incenseTimer > 0) { this.state = 'patrol'; this.revealed = false; g.onChaseEnd(); }
      return;
    }
    const trail = g.trail;
    if (trail.length && g.incenseTimer <= 0) {
      let target = null;
      for (let i = 0; i < trail.length; i++) {
        if (this.dist(trail[i].x, trail[i].y) < 10) { target = trail[i]; break; }
      }
      if (target) this.moveToward(target.x, target.y, dt);
      else { if (!this.wp || this.dist(this.wp.x, this.wp.y) < 1) this.wp = randomFreePoint(g.map); this.moveToward(this.wp.x, this.wp.y, dt); }
    } else {
      if (!this.wp || this.dist(this.wp.x, this.wp.y) < 1) this.wp = randomFreePoint(g.map);
      this.moveToward(this.wp.x, this.wp.y, dt);
    }
    if (!p.hidden && !p.dead && this.distPlayer() < 2.2) {
      this.revealed = true;
      g.caption('[o vagalume EXPLODIU em outra coisa]');
      this.startChase();
    }
  }

  // --- Pombero: arma sustos, aceita oferendas ---
  updatePombero(dt) {
    const g = this.game, p = g.player;
    if (this.state === 'chase') {
      this.moveToward(p.x, p.y, dt);
      if (this.distPlayer() > 14) { this.state = 'patrol'; g.onChaseEnd(); }
      return;
    }
    if (this.state === 'suspect' && this.stimulus) {
      this.moveToward(this.stimulus.x, this.stimulus.y, dt);
      if (this.dist(this.stimulus.x, this.stimulus.y) < 1.2) { this.stimulus = null; this.state = 'patrol'; }
      if (!p.hidden && this.distPlayer() < 3 && this.canSeePlayer()) this.startChase();
      return;
    }
    if (this.specialTimer <= 0) {
      this.specialTimer = 20 + Math.random() * 22;
      const a = Math.random() * Math.PI * 2;
      const nx = p.x + Math.cos(a) * 5, ny = p.y + Math.sin(a) * 5;
      const sp = g.spatialTo(nx, ny, 14);
      if (sp) {
        AudioSys.noise(AudioSys.scare, 0.4, { freq: 700, gain: 0.4 * sp.vol, q: 2, pan: sp.pan });
        g.caption('[algo caiu ali perto]');
      }
    }
    if (p.running && p.moving && this.distPlayer() < 16) { this.alert(p.x, p.y); }
    this.patrolMove(dt);
  }

  // --- Amostra: sente eletricidade (lanterna) ---
  updateAmostra(dt) {
    const g = this.game, p = g.player;
    const blackout = g.blackoutActive;
    if (this.state === 'chase') {
      this.moveToward(p.x, p.y, dt);
      const senses = (p.lanternOn && this.distPlayer() < this.def.electric * 1.5) || (blackout && this.distPlayer() < 10);
      if (!senses && this.distPlayer() > 6) { this.state = 'patrol'; g.onChaseEnd(); }
      return;
    }
    if (!p.dead && !p.hidden && ((p.lanternOn && this.distPlayer() < this.def.electric) || (blackout && this.distPlayer() < 10 && p.moving))) {
      g.caption('[um gotejar viscoso… OLHE PARA CIMA]');
      this.startChase();
      return;
    }
    if (!this.wp || this.dist(this.wp.x, this.wp.y) < 1) this.wp = randomFreePoint(g.map);
    this.moveToward(this.wp.x, this.wp.y, dt, true); // viaja por dutos/paredes
  }

  // --- Dama: 3 olhares e desce ---
  updateDama(dt) {
    const g = this.game, p = g.player;
    if (this.activated) {
      this.state = 'chase';
      this.moveToward(p.x, p.y, dt);
      return;
    }
    this.patrolMove(dt);
    if (this.specialTimer <= 0) {
      this.specialTimer = 4;
      if (this.canSeePlayer()) {
        this.sightCount++;
        g.onDamaSight(this.sightCount);
        if (this.sightCount >= (this.def.sightCounter || 3)) {
          this.activated = true;
          g.caption('[ela DESCEU]');
          this.startChase();
        } else {
          g.caption('[ela te notou pela janela]');
        }
      }
    }
  }

  // --- Monge: reage a SER VISTO (sim.js acumula o olhar) ---
  updateMonge(dt) {
    const g = this.game, p = g.player;
    if (!this.activated) {
      if (this.specialTimer <= 0) { this.specialTimer = 12 + Math.random() * 10; this.relocate(); }
      if (this.gazeAccum >= (this.def.gazeTrigger || 2)) {
        this.activated = true;
        AudioSys.radar('bellToll', { pan: 0, vol: 0.8 }, 1);
        g.caption('[um sino tocou dentro de algo oco]');
      }
      return;
    }
    // ativo: segue sempre, de costas, velocidade do jogador + 0,2
    const sp = (p.currentSpeed || 3.5) + 0.2;
    const step = bfsNextStep(g.map, this.x, this.y, p.x, p.y, g.exitOpen);
    const t = step || p;
    const aa = Math.atan2(t.y - this.y, t.x - this.x);
    const nx = this.x + Math.cos(aa) * sp * dt, ny = this.y + Math.sin(aa) * sp * dt;
    if (!isSolidTile(g.map.t[Math.floor(ny) * MAP_W + Math.floor(nx)], g.exitOpen)) { this.x = nx; this.y = ny; }
    this.dir = aa;
    if (!p.dead && !p.hidden && this.distPlayer() < 0.8) g.onCaught(this);
  }

  // --- Kara-Kasa: emboscada entre guarda-chuvas ---
  updateKarakasa(dt) {
    const g = this.game, p = g.player;
    if (this.state === 'chase') {
      this.moveToward(p.x, p.y, dt);
      this.chaseLeft -= dt;
      if (this.chaseLeft <= 0 || p.hidden) {
        this.state = 'patrol';
        g.onChaseEnd();
        const um = g.map.props.filter(pr => pr.type === 'umbrella');
        if (um.length) { const u = um[(Math.random() * um.length) | 0]; this.x = u.x; this.y = u.y; }
      }
      return;
    }
    if (!p.dead && !p.hidden && this.distPlayer() < (this.def.ambush || 3)) {
      g.caption('[o guarda-chuva sem neve se MOVEU]');
      this.chaseLeft = 7;
      this.startChase();
    }
  }

  // --- Sereia: domínio é a água ---
  updateSereia(dt) {
    const g = this.game, p = g.player;
    const playerInWater = g.tileAt(p.x, p.y) === TILE.WATER;
    if (this.state === 'chase') {
      if (!playerInWater) { this.state = 'patrol'; g.onChaseEnd(); return; }
      this.moveTowardWater(p.x, p.y, dt);
      return;
    }
    if (playerInWater && !p.dead && this.distPlayer() < 18) { this.startChase(); return; }
    if (!this.wp || this.dist(this.wp.x, this.wp.y) < 1) {
      for (let i = 0; i < 20; i++) {
        const t = randomFreePoint(g.map);
        if (g.tileAt(t.x, t.y) === TILE.WATER) { this.wp = t; break; }
      }
      if (!this.wp) this.wp = randomFreePoint(g.map);
    }
    this.moveTowardWater(this.wp.x, this.wp.y, dt);
  }
  moveTowardWater(tx, ty, dt) {
    const g = this.game;
    const sp = g.tileAt(this.x, this.y) === TILE.WATER ? 9.0 : 1.5;
    const a = Math.atan2(ty - this.y, tx - this.x);
    const nx = this.x + Math.cos(a) * sp * dt, ny = this.y + Math.sin(a) * sp * dt;
    const v = g.map.t[Math.floor(ny) * MAP_W + Math.floor(nx)];
    if (!isSolidTile(v, g.exitOpen)) { this.x = nx; this.y = ny; this.dir = a; }
  }

  // --- horda (Afogados): convergem quando um detecta ---
  updateHordeMember(dt) {
    const g = this.game, p = g.player;
    if (g.hordeAlert > 0 && !p.hidden) {
      this.moveToward(g.hordeTarget.x, g.hordeTarget.y, dt);
      this.state = 'chase';
    } else {
      this.state = 'patrol';
      if (!this.wp || this.dist(this.wp.x, this.wp.y) < 1) this.wp = randomFreePoint(g.map);
      this.moveToward(this.wp.x, this.wp.y, dt);
    }
    if (!p.dead && !p.hidden && this.distPlayer() < 4 && this.canSeePlayer()) {
      if (g.hordeAlert <= 0) {
        AudioSys.radar('gurgle', { pan: 0, vol: 1 }, 1.4);
        g.caption('[um borbulhar alto — TODOS responderam]');
      }
      g.hordeAlert = 12;
      g.hordeTarget = { x: p.x, y: p.y };
    }
  }

  // --- Fiéis: rede de coro ---
  updateFiel(dt) {
    const g = this.game, p = g.player;
    if (g.choirLock > 0 && !p.hidden) {
      this.state = 'chase';
      this.moveToward(g.choirTarget.x, g.choirTarget.y, dt);
      if (!p.dead && this.distPlayer() < 0.7) g.onCaught(this);
      return;
    }
    this.state = 'patrol';
    // ajoelhado, murmurando — não se move
  }

  emitRadar() {
    const g = this.game;
    const sp = g.spatialTo(this.x, this.y, 30);
    if (!sp) return;
    const kind = this.def.radarSound;
    if (kind === 'silence' || kind === 'hum') return;
    if (kind === 'sermon' && this.sermonPause > 0) { this.sermonPause -= 2; return; }
    if (kind === 'cart' && this.state === 'chase') return;
    if (kind === 'crying') { AudioSys.radar('crying', sp, 1); if (this.state !== 'chase' && sp.vol > 0.6) g.caption('[choro… baixinho… PERTO]'); return; }
    AudioSys.radar(kind, sp, 1);
  }
}

// fábrica: cria todos os monstros da fase (incluindo hordas e visitante)
export function spawnMonsters(game, level, nightmare) {
  const list = [];
  const far = () => {
    for (let i = 0; i < 50; i++) {
      const p = randomFreePoint(game.map);
      if (Math.hypot(p.x - game.map.spawn.x, p.y - game.map.spawn.y) > 16) return p;
    }
    return randomFreePoint(game.map);
  };
  for (const key of level.monsters) {
    const def = MONSTERS[key];
    if (def.horde) {
      const n = key === 'fiel' ? 12 : 9;
      for (let i = 0; i < n; i++) list.push(new Monster(key, game, far()));
    } else if (key === 'deuscego') {
      const m = new Monster(key, game, { x: 23.5, y: 41.5 });
      list.push(m);
    } else if (key === 'karakasa') {
      const um = game.map.props.filter(p => p.type === 'umbrella');
      const u = um.length ? um[(Math.random() * um.length) | 0] : far();
      list.push(new Monster(key, game, { x: u.x, y: u.y }));
    } else {
      list.push(new Monster(key, game, far()));
    }
  }
  if (nightmare && level.visitor) {
    const vis = new Monster(level.visitor, game, far());
    vis.isVisitor = true;
    list.push(vis);
  }
  return list;
}
