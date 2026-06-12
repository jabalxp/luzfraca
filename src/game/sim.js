// ============================================================
// LUZ FRACA — sim.js : estado do jogo, loop de simulação,
// jogador, mecânicas de fase, morte, vitória, final.
// Sem DOM e sem React: a UI injeta callbacks (ui) e lê G.
// ============================================================
import { LEVELS, FINAL_TEXT } from './data.js';
import { SAVE, saveGame, grantAch } from './save.js';
import { AudioSys } from './audio.js';
import { TILE, MAP_W, MAP_H, generateMap, isSolidTile, randomFreePoint, ensureConnectivity, lineOfSight } from './mapgen.js';
import { spawnMonsters } from './monsters.js';

// ---------- iniciar fase ----------
export function createGame(id, nightmare, ui) {
  const level = LEVELS[id];
  const map = generateMap(level, nightmare);
  const G = {
    running: true, paused: false, phase: 'playing', // playing | dead | won | final
    level, map, nightmare, ui,
    player: makePlayer(map.spawn),
    monsters: [],
    input: { keys: {}, mouseDX: 0, mouseDY: 0, mouseRight: false },
    time: 0, runCoins: 0,
    paperTaken: false, exitOpen: false, fury: false,
    trail: [],
    anyChasing: false, chasers: 0,
    spectralTimer: 0, compassTimer: 0, incenseTimer: 0,
    panicTimer: 0, blindCooldown: 0,
    usedBatteries: 0, usedBells: 0, usedCompass: false, usedSecond: false,
    offeringsLeft: 0,
    lanternKilled: false, lanternFlicker: 1, lanternEverOn: true,
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
    shake: 0,
    mapVersion: 0,         // muda → R3F reconstrói paredes
    nearestMonsterDist: 1e9,
    // ---- helpers ----
    tileAt(x, y) { return map.t[Math.floor(y) * MAP_W + Math.floor(x)]; },
    caption: (txt) => ui.caption(txt),
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
          if (mo.def.choir) {
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
    onChaseStart() {
      G.chasers++;
      G.anyChasing = true;
      AudioSys.startChase(level.id);
      G.shake = 1;
    },
    onChaseEnd() {
      G.chasers = Math.max(0, G.chasers - 1);
      if (G.chasers === 0) { G.anyChasing = false; AudioSys.stopChase(); }
    },
    onDamaSight(n) { ui.petals(n); },
    onCaught(mo) { onPlayerCaught(G, mo); },
    godStrike() {
      G.caption('[a mão desceu]');
      doDeath(G, G.monsters.find(m => m.key === 'deuscego') || G.monsters[0]);
    },
    startLighthouse() {
      G.lighthouseActive = true;
      G.lighthouseTimer = 30;
      G.caption('[o farol ACENDEU — saia do facho]');
    },
  };

  // slots de consumíveis (teclas 1-3)
  const order = ['battery', 'bell', 'incense', 'adrenaline', 'compass'];
  G.consSlots = order.filter(idc => (SAVE.cons[idc] || 0) > 0).slice(0, 3);
  while (G.consSlots.length < 3) G.consSlots.push(null);

  // fase 3 começa com a lanterna apagada (ambiente claro + conquista Cego por Opção)
  if (level.id === 2) { G.player.lanternOn = false; G.lanternEverOn = false; }

  G.monsters = spawnMonsters(G, level, nightmare);

  if (level.tide) setTide(G, true);

  if ((SAVE.cons.spectral || 0) > 0) {
    SAVE.cons.spectral--;
    saveGame();
    G.spectralTimer = 5;
    ui.caption('[Visão Espectral: 5 segundos]');
  }

  AudioSys.init();
  AudioSys.resume();
  AudioSys.silenceAll();
  AudioSys.startDrone(level.drone);
  ui.slots(G.consSlots.slice());
  ui.petals(0);
  return G;
}

function makePlayer(spawn) {
  return {
    x: spawn.x, y: spawn.y, angle: -Math.PI / 2, pitch: 0,
    moving: false, running: false, crouching: false,
    currentSpeed: 0,
    stamina: 1, gasping: 0,
    lanternOn: true, battery: 1,
    focusing: false,
    hidden: false, holdingBreath: false, breathLeft: 6,
    dead: false,
    stepTimer: 0,
    invertTimer: 0,
    adrenaline: 0,
    bob: 0,
    breathMax() { return SAVE.perm.calm ? 10 : 6; },
  };
}

function runDuration() { return [5, 8, 12, 16][SAVE.perm.stamina]; }
function staminaRecovery() { return [8, 8, 5, 5][SAVE.perm.stamina]; }
function batteryDuration() { return 100 * [1, 1.3, 1.6, 2][SAVE.perm.lantern]; }

// ---------- ações do jogador ----------
export function toggleLantern(G) {
  const p = G.player;
  if (p.hidden || p.dead) return;
  p.lanternOn = !p.lanternOn;
  AudioSys.lanternClick();
  G.emitNoise(p.x, p.y, 5);
  if (p.lanternOn) G.lanternEverOn = true;
}

export function playerInteract(G) {
  const p = G.player, m = G.map;
  if (p.dead) return;
  if (p.hidden) { exitHide(G); return; }
  const tile = G.tileAt(p.x, p.y);
  if (tile === TILE.HIDE) { enterHide(G); return; }
  const pd = Math.hypot(m.paper.x - p.x, m.paper.y - p.y);
  if (!G.paperTaken && pd < 1.4) {
    if (m.paperWell && !G.wellDescending) {
      G.wellDescending = 8;
      G.caption('[descendo pela corda… a corda pesa]');
      return;
    }
    if (!m.paperWell) takePaper(G);
    return;
  }
  for (const pr of m.props) {
    if (pr.type === 'cana' && !pr.taken && Math.hypot(pr.x - p.x, pr.y - p.y) < 1.4) {
      pr.taken = true;
      G.offeringsLeft = (G.offeringsLeft || 0) + 1;
      for (const mo of G.monsters) {
        if (mo.key === 'pombero') {
          mo.pauseTimer = 90;
          mo.state = 'patrol';
        }
      }
      G.caption('[você deixou a oferenda — ele aceitou]');
      AudioSys.vendor();
      if (G.offeringsLeft >= 3) grantAch('prodigio');
      return;
    }
  }
}

function enterHide(G) {
  const p = G.player;
  p.hidden = true;
  p.breathLeft = p.breathMax();
  for (const mo of G.monsters) {
    mo.sawEnterHide = mo.state === 'chase' && mo.distPlayer() < 9 && lineOfSight(G.map, mo.x, mo.y, p.x, p.y);
    if (!mo.sawEnterHide && mo.state === 'chase') {
      mo.stimulus = { x: p.x, y: p.y };
    }
  }
  AudioSys.noise(AudioSys.fx, 0.4, { freq: 300, gain: 0.2, q: 1 });
  G.caption(`[você entrou: ${G.level.hideName}]`);
}

function exitHide(G) {
  const p = G.player;
  p.hidden = false;
  p.holdingBreath = false;
  AudioSys.noise(AudioSys.fx, 0.4, { freq: 300, gain: 0.2, q: 1 });
}

function takePaper(G) {
  G.paperTaken = true;
  G.exitOpen = true;
  G.mapVersion++;
  AudioSys.paperSting();
  setTimeout(() => AudioSys.doorUnlock(), 900);
  G.ui.hudMessage('ENCONTRE A SAÍDA');
  G.caption('[uma porta destrancou, ecoando pelo mapa]');
  G.fury = true;
  for (const mo of G.monsters) {
    if (mo.def.hearing > 0) mo.alert(G.player.x, G.player.y);
  }
  if (G.level.snow) AudioSys.radar('bellToll', { pan: 0, vol: 1 }, 1);
  if (G.level.id === 1) G.caption('[uma luz vermelha gira em silêncio]');
  if (G.level.tide) { G.tideRising = true; G.tideTimer = 0; }
  if (G.level.id === 9) { finishGame(G); return; }
}

export function useConsumable(G, slot) {
  const id = G.consSlots[slot];
  if (!id) return;
  const p = G.player;
  if (p.dead) return;
  const have = SAVE.cons[id] || 0;
  if (have <= 0) { G.caption('[sem unidades]'); return; }
  switch (id) {
    case 'battery':
      if (G.usedBatteries >= 3) { G.caption('[limite de 3 pilhas por fase]'); return; }
      G.usedBatteries++;
      p.battery = Math.min(1, p.battery + 0.5);
      AudioSys.batteryPickup();
      G.caption('[pilha trocada]');
      break;
    case 'bell': {
      if (G.usedBells >= 2) { G.caption('[limite de 2 sinos por fase]'); return; }
      G.usedBells++;
      const tx = p.x + Math.cos(p.angle) * 8, ty = p.y + Math.sin(p.angle) * 8;
      AudioSys.bellThrow();
      G.emitNoise(tx, ty, 25);
      G.caption('[o sino de lata quicou longe]');
      break;
    }
    case 'incense':
      G.incenseTimer = 60;
      G.caption('[você está sem cheiro por 60 segundos]');
      break;
    case 'adrenaline':
      p.adrenaline = 5;
      AudioSys.adrenalineFx();
      G.caption('[ADRENALINA — todos sabem onde você está]');
      for (const mo of G.monsters) mo.alert(p.x, p.y);
      break;
    case 'compass':
      if (G.usedCompass) { G.caption('[1 uso por fase]'); return; }
      G.usedCompass = true;
      G.compassTimer = 15;
      G.caption('[fumaça azulada aponta a direção do papel]');
      break;
    default:
      return;
  }
  SAVE.cons[id]--;
  saveGame();
  G.ui.slots(G.consSlots.slice());
}

// ---------- tick principal ----------
export function tickGame(G, dt) {
  if (!G.running || G.paused || G.player.dead) return;
  G.time += dt;
  tickLevelMechanics(G, dt);
  updatePlayer(G, dt);
  for (const mo of G.monsters) mo.update(dt);
  tickAmbient(G, dt);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 1.6);
}

// ---------- update do jogador ----------
function updatePlayer(G, dt) {
  const p = G.player, input = G.input, Keys = input.keys;
  if (p.dead) return;
  if (G.wellDescending > 0) { p.moving = false; p.running = false; return; }

  // mouse look (yaw + pitch)
  const sens = SAVE.settings.sensitivity / 100 * 0.0023;
  p.angle += input.mouseDX * sens;
  p.pitch -= input.mouseDY * sens * (SAVE.settings.invertY ? -1 : 1);
  p.pitch = Math.max(-1.25, Math.min(1.25, p.pitch));
  input.mouseDX = 0; input.mouseDY = 0;
  p.focusing = input.mouseRight && p.lanternOn;

  if (p.hidden) {
    p.moving = false; p.running = false;
    if (Keys['Space']) {
      if (!p.holdingBreath && p.breathLeft > 0) p.holdingBreath = true;
      if (p.holdingBreath) {
        p.breathLeft -= dt;
        if (p.breathLeft <= 0) {
          p.holdingBreath = false;
          AudioSys.gasp();
          G.emitNoise(p.x, p.y, 15);
          G.caption('[você arquejou ALTO]');
        }
      }
    } else {
      if (p.holdingBreath) { p.holdingBreath = false; AudioSys.breathRelease(); }
      p.breathLeft = Math.min(p.breathMax(), p.breathLeft + dt * 1.5);
    }
    return;
  }

  let fwd = 0, str = 0;
  if (Keys['KeyW'] || Keys['ArrowUp']) fwd += 1;
  if (Keys['KeyS'] || Keys['ArrowDown']) fwd -= 1;
  if (Keys['KeyA']) str -= 1;
  if (Keys['KeyD']) str += 1;
  if (Keys['ArrowLeft']) p.angle -= 1.8 * dt;
  if (Keys['ArrowRight']) p.angle += 1.8 * dt;
  p.crouching = !!(Keys['ControlLeft'] || Keys['KeyC']);
  const wantsRun = !!(Keys['ShiftLeft'] || Keys['ShiftRight']) && fwd > 0 && !p.crouching;

  // canto da sereia inverte controles levemente
  if (p.invertTimer > 0) { fwd = -fwd; str = -str; }

  // estamina
  if (p.adrenaline > 0) {
    p.adrenaline -= dt;
    p.running = wantsRun || fwd !== 0;
  } else if (wantsRun && p.stamina > 0 && p.gasping <= 0) {
    p.running = true;
    p.stamina -= dt / runDuration();
    if (p.stamina <= 0) {
      p.stamina = 0;
      p.gasping = 3;
      AudioSys.gasp();
      G.emitNoise(p.x, p.y, SAVE.perm.stamina >= 3 ? 7.5 : 15);
      G.caption('[ofegando…]');
    }
  } else {
    p.running = false;
    if (p.gasping > 0) p.gasping -= dt;
    else p.stamina = Math.min(1, p.stamina + dt / staminaRecovery());
  }

  // velocidade
  let speed = p.crouching ? 1.8 : p.running ? 6.5 : 3.5;
  if (p.running && SAVE.perm.shoes) speed *= 1.15;
  if (p.adrenaline > 0 && p.running) speed *= 1.3;
  const tile = G.tileAt(p.x, p.y);
  if (tile === TILE.WATER) speed *= 0.55;
  if (tile === TILE.GRASS) speed *= 0.85;
  p.currentSpeed = speed;

  // mover com colisão por eixo
  const mvx = (Math.cos(p.angle) * fwd + Math.cos(p.angle + Math.PI / 2) * str);
  const mvy = (Math.sin(p.angle) * fwd + Math.sin(p.angle + Math.PI / 2) * str);
  const len = Math.hypot(mvx, mvy) || 1;
  const dx = mvx / len * speed * dt, dy = mvy / len * speed * dt;
  const RADIUS = 0.28;
  const solidAt = (x, y) => isSolidTile(G.map.t[Math.floor(y) * MAP_W + Math.floor(x)], G.exitOpen) ||
    G.map.props.some(pr => pr.solid && Math.hypot(pr.x - x, pr.y - y) < 0.8);
  if (!solidAt(p.x + dx + Math.sign(dx) * RADIUS, p.y)) p.x += dx;
  if (!solidAt(p.x, p.y + dy + Math.sign(dy) * RADIUS)) p.y += dy;
  p.moving = (fwd !== 0 || str !== 0);
  if (p.moving) p.bob += dt * speed * 1.6;

  // Deus Cego: mover-se durante a exalação dentro do salão = morte
  if (G.level.godHall && G.inGodHall && G.godExhaling && p.moving && !G.wellDescending) {
    G.godStrike();
  }

  // passos: som + ruído
  if (p.moving) {
    p.stepTimer -= dt * speed;
    if (p.stepTimer <= 0) {
      p.stepTimer = 2.2;
      const surface = tile === TILE.WATER ? 'water' : G.level.snow ? 'snow' : 'floor';
      AudioSys.footstep(p.running, surface);
      let radius = p.running ? 25 : p.crouching ? 1.5 : 6;
      if (SAVE.perm.cotton) radius = p.crouching ? 0 : radius * 0.6;
      if (tile === TILE.WATER) radius = Math.max(radius, 10);
      if (radius > 0) G.emitNoise(p.x, p.y, radius);
      G.trail.push({ x: p.x, y: p.y, t: G.time });
      if (G.trail.length > 120) G.trail.shift();
    }
  }

  // bateria da lanterna
  if (p.lanternOn && !G.lanternKilled) {
    const drain = p.focusing ? 2 : 1;
    p.battery -= dt * drain / batteryDuration();
    if (p.battery <= 0) { p.battery = 0; p.lanternOn = false; G.caption('[a lanterna morreu]'); }
  }

  // cegar com o Farol de Mão (nível 3): monstro fotossensível no centro da mira
  if (p.focusing && SAVE.perm.lantern >= 3 && G.blindCooldown <= 0) {
    for (const mo of G.monsters) {
      if (mo.def.lightAttract && mo.distPlayer() < G.lanternRange() * 1.5 && angleToMonster(G, mo) < 0.3
        && lineOfSight(G.map, p.x, p.y, mo.x, mo.y)) {
        mo.pauseTimer = 2;
        G.blindCooldown = 60;
        G.caption('[CEGO pela luz!]');
        break;
      }
    }
  }

  // pétalas murcham atrás de você (recurso finito)
  if (tile === TILE.PETAL) {
    if (!p._lastPetal || p._lastPetal.x !== Math.floor(p.x) || p._lastPetal.y !== Math.floor(p.y)) {
      if (p._lastPetal) { G.map.t[p._lastPetal.y * MAP_W + p._lastPetal.x] = TILE.FLOOR; G.mapVersion++; }
      p._lastPetal = { x: Math.floor(p.x), y: Math.floor(p.y) };
    }
  } else if (p._lastPetal) {
    G.map.t[p._lastPetal.y * MAP_W + p._lastPetal.x] = TILE.FLOOR;
    G.mapVersion++;
    p._lastPetal = null;
  }

  collectItems(G);

  if (G.exitOpen) {
    const e = G.map.exit;
    if (Math.hypot(e.x + 0.5 - p.x, e.y + 0.5 - p.y) < 1.3) winLevel(G);
  }

  updatePrompt(G);
}

// ângulo entre a direção do olhar do jogador e o monstro (radianos)
function angleToMonster(G, mo) {
  const p = G.player;
  const angTo = Math.atan2(mo.y - p.y, mo.x - p.x);
  return Math.abs(((angTo - p.angle) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
}

function collectItems(G) {
  const p = G.player, m = G.map;
  const magnetR = SAVE.perm.magnet ? 3 : 0.8;
  for (const c of m.coins) {
    if (c.taken) continue;
    const d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d < magnetR) {
      if (SAVE.perm.magnet && d > 0.8) {
        c.x += (p.x - c.x) * 0.18; c.y += (p.y - c.y) * 0.18;
        continue;
      }
      c.taken = true;
      G.runCoins += c.v;
      const silent = SAVE.perm.magnet;
      AudioSys.coinClink(silent);
      if (!silent) G.emitNoise(p.x, p.y, 8);
      G.ui.coinCounter(G.runCoins);
    }
  }
  for (const b of m.batteries) {
    if (b.taken) continue;
    if (Math.hypot(b.x - p.x, b.y - p.y) < 0.9) {
      b.taken = true;
      p.battery = Math.min(1, p.battery + 0.4);
      AudioSys.batteryPickup();
      G.caption('[pilha encontrada: +40% bateria]');
    }
  }
}

function updatePrompt(G) {
  const p = G.player, m = G.map;
  let txt = null;
  if (p.hidden) txt = 'E — sair  |  ESPAÇO — prender a respiração';
  else if (G.tileAt(p.x, p.y) === TILE.HIDE) txt = `E — esconder (${G.level.hideName})`;
  else if (!G.paperTaken && Math.hypot(m.paper.x - p.x, m.paper.y - p.y) < 1.4) {
    txt = m.paperWell && !G.wellDescending ? 'E — descer pela corda (8s)' : m.paperWell ? null : 'E — pegar o papel';
  } else {
    for (const pr of m.props) {
      if (pr.type === 'cana' && !pr.taken && Math.hypot(pr.x - p.x, pr.y - p.y) < 1.4) { txt = 'E — deixar a oferenda'; break; }
    }
  }
  G.ui.prompt(txt);
}

// ---------- mecânicas exclusivas por fase ----------
function tickLevelMechanics(G, dt) {
  const p = G.player, L = G.level;

  if (G.spectralTimer > 0) G.spectralTimer -= dt;
  if (G.compassTimer > 0) G.compassTimer -= dt;
  if (G.incenseTimer > 0) G.incenseTimer -= dt;
  if (G.panicTimer > 0) G.panicTimer -= dt;
  if (G.blindCooldown > 0) G.blindCooldown -= dt;
  if (G.hordeAlert > 0) G.hordeAlert -= dt;
  if (G.choirLock > 0) G.choirLock -= dt;
  if (G.choirNoteTimer > 0) { G.choirNoteTimer -= dt; if (G.choirNoteTimer <= 0) G.choirNotes = 0; }

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
      takePaper(G);
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
      reorganizeMaze(G);
      AudioSys.noise(AudioSys.scare, 1.2, { freq: 120, gain: 0.18, q: 1, attack: 0.4 });
      G.caption('[som de mobília arrastando atrás de você]');
    }
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
      setTimeout(() => { if (G.running) G.promoTarget = null; }, 15000);
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
    const period = G.tideRising ? 60 : L.tide;
    if (G.tideTimer > period) {
      G.tideTimer = 0;
      setTide(G, G.tideHigh);
    }
  }

  // farol varrendo
  if (G.lighthouseActive) {
    G.lighthouseTimer -= dt;
    if (G.lighthouseTimer <= 0) { G.lighthouseActive = false; G.caption('[o farol apagou]'); }
    else if (!p.hidden && Math.random() < dt * 0.5) {
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
      G.lanternKilled = G.godExhaling;
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
    G.ui.vhsFlash();
  }
}

function tickAmbient(G, dt) {
  const p = G.player;
  let nd = 1e9;
  for (const mo of G.monsters) {
    if (mo.key === 'deuscego') continue;
    nd = Math.min(nd, mo.distPlayer());
  }
  G.nearestMonsterDist = nd;
  if (SAVE.perm.radar && nd < 15) AudioSys.heartbeatPulse(nd < 7 ? 2 : 1);
  // olhar sobre o Monge Oco (centro da mira por 2s acumulados)
  const monge = G.monsters.find(m => m.key === 'monge');
  if (monge && !monge.activated) {
    if (angleToMonster(G, monge) < 0.35 && monge.distPlayer() < 16
      && lineOfSight(G.map, p.x, p.y, monge.x, monge.y)) {
      monge.gazeAccum += dt;
      if (monge.gazeAccum > 0.8) G.caption('[não olhe para o monge]');
    }
  }
}

// backrooms: muda paredes longe do jogador
function reorganizeMaze(G) {
  const m = G.map, p = G.player;
  for (let i = 0; i < 14; i++) {
    const x = 2 + (Math.random() * (MAP_W - 4) | 0), y = 2 + (Math.random() * (MAP_H - 4) | 0);
    if (Math.hypot(x - p.x, y - p.y) < 10) continue;
    const v = m.t[y * MAP_W + x];
    if (v === TILE.FLOOR) m.t[y * MAP_W + x] = TILE.WALL;
    else if (v === TILE.WALL && Math.random() < 0.7) m.t[y * MAP_W + x] = TILE.FLOOR;
  }
  ensureConnectivity(m);
  G.mapVersion++;
}

// ilha: alterna a maré
function setTide(G, low) {
  const m = G.map;
  G.tideHigh = !low;
  for (const i of m.tideTiles) m.t[i] = low ? TILE.FLOOR : TILE.WATER;
  for (const i of m.templeTiles) m.t[i] = low ? TILE.FLOOR : TILE.WATER;
  if (G.time > 1) G.caption(low ? '[a maré BAIXOU — o templo abriu]' : '[a maré está SUBINDO]');
  G.mapVersion++;
}

// ---------- morte / segunda chance ----------
function onPlayerCaught(G, mo) {
  const p = G.player;
  if (p.dead) return;
  if (!G.usedSecond && (SAVE.cons.second || 0) > 0 && !G.level.noSecondChance) {
    G.usedSecond = true;
    SAVE.cons.second--;
    saveGame();
    AudioSys.secondChance();
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
    G.ui.slots(G.consSlots.slice());
    return;
  }
  doDeath(G, mo);
}

function doDeath(G, mo) {
  const p = G.player;
  p.dead = true;
  G.phase = 'dead';
  AudioSys.jumpscare();
  AudioSys.silenceAll();
  G.shake = 3;
  SAVE.deaths[G.level.id]++;
  const lossFrac = SAVE.perm.pockets ? 0.25 : 0.5;
  const kept = Math.ceil(G.runCoins * (1 - lossFrac));
  const lost = G.runCoins - kept;
  SAVE.coins += kept;
  saveGame();
  G.ui.death({
    monsterName: mo ? mo.def.name : '???',
    deathMsg: G.level.deathMsg,
    lost, kept,
    deaths: SAVE.deaths[G.level.id],
  });
}

// ---------- vitória ----------
function winLevel(G) {
  const id = G.level.id;
  const p = G.player;
  if (p.dead) return;
  p.dead = true; // trava o update
  G.phase = 'won';
  AudioSys.silenceAll();
  AudioSys.winSound();

  const wasCleared = SAVE.cleared[id];
  const allCoins = G.map.coins.every(c => c.taken);
  let earned = G.runCoins + G.level.bonus;
  if (wasCleared) earned = Math.floor(earned * 0.5);
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
  const achs = [];
  if (SAVE.deaths[id] === 0) { const a = grantAch('peQuente'); if (a) achs.push(a.name); }
  if (allCoins) { const a = grantAch('paoDuro'); if (a) achs.push(a.name); }
  if (id === 2 && !G.lanternEverOn) { const a = grantAch('cego'); if (a) achs.push(a.name); }
  saveGame();

  G.ui.win({
    id, time: G.time, runCoins: G.runCoins, bonus: G.level.bonus,
    wasCleared, earned, bank: SAVE.coins, achs,
  });
}

// ---------- final do jogo (papel 10) ----------
function finishGame(G) {
  const p = G.player;
  p.dead = true;
  G.phase = 'final';
  AudioSys.silenceAll();
  SAVE.papers[9] = true;
  SAVE.cleared[9] = true;
  SAVE.coins += G.runCoins + G.level.bonus;
  if (G.nightmare) {
    SAVE.nmCleared[9] = true;
    if (SAVE.nmCleared.every(Boolean)) { SAVE.nightmare = true; SAVE.paper12 = true; grantAch('maratonista'); }
  }
  SAVE.finished = true;
  grantAch('leitor');
  const totalDeaths = SAVE.deaths.reduce((a, b) => a + b, 0);
  if (totalDeaths < 30) grantAch('maoFirme');
  saveGame();
  G.ui.final(FINAL_TEXT);
  // o tambor do velho Kwame, calmo
  let beats = 0;
  const drum = setInterval(() => {
    if (!G.running || beats++ > 40) { clearInterval(drum); return; }
    AudioSys.radar('drum', { pan: 0, vol: 0.5 }, 0.7);
  }, 1400);
}

export function destroyGame(G) {
  G.running = false;
  AudioSys.silenceAll();
  AudioSys.stopChase();
}
