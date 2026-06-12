// ============================================================
// LUZ FRACA — player.js : movimentação, lanterna, estamina,
// esconderijos, prender respiração, consumíveis
// ============================================================
'use strict';

const Keys = {};
let MouseDX = 0, MouseDY = 0, MouseRight = false;

function initInput() {
  window.addEventListener('keydown', e => {
    Keys[e.code] = true;
    if (G && G.running && !G.paused) {
      if (e.code === 'KeyF') togglePlayerLantern();
      if (e.code === 'KeyE') playerInteract();
      if (e.code === 'Digit1') useConsumable(0);
      if (e.code === 'Digit2') useConsumable(1);
      if (e.code === 'Digit3') useConsumable(2);
    }
    if (e.code === 'Escape' && G && G.running) togglePause();
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => { Keys[e.code] = false; });
  const cv = document.getElementById('game-canvas');
  cv.addEventListener('click', () => {
    if (G && G.running && !G.paused && document.pointerLockElement !== cv) cv.requestPointerLock();
  });
  window.addEventListener('mousemove', e => {
    if (document.pointerLockElement === cv) { MouseDX += e.movementX; MouseDY += e.movementY; }
  });
  window.addEventListener('mousedown', e => { if (e.button === 2) MouseRight = true; });
  window.addEventListener('mouseup', e => { if (e.button === 2) MouseRight = false; });
  window.addEventListener('contextmenu', e => { if (G && G.running) e.preventDefault(); });
}

function makePlayer(spawn) {
  return {
    x: spawn.x, y: spawn.y, angle: -Math.PI / 2,
    moving: false, running: false, crouching: false,
    currentSpeed: 0,
    stamina: 1, gasping: 0,
    lanternOn: true, battery: 1,
    focusing: false,
    hidden: false, holdingBreath: false, breathLeft: 6,
    dead: false,
    stepTimer: 0,
    invertTimer: 0,    // canto da sereia
    adrenaline: 0,
    breathMax() { return SAVE.perm.calm ? 10 : 6; },
  };
}

// limites por nível de power-up
function runDuration() { return [5, 8, 12, 16][SAVE.perm.stamina]; }
function staminaRecovery() { return [8, 8, 5, 5][SAVE.perm.stamina]; }
function batteryDuration() { return 100 * [1, 1.3, 1.6, 2][SAVE.perm.lantern]; }

function togglePlayerLantern() {
  const p = G.player;
  if (p.hidden || p.dead) return;
  p.lanternOn = !p.lanternOn;
  AudioSys.lanternClick();
  G.emitNoise(p.x, p.y, 5);          // o clique é ouvido a 5m
  if (p.lanternOn) G.lanternEverOn = true;
}

function playerInteract() {
  const p = G.player, m = G.map;
  if (p.dead) return;
  // sair do esconderijo
  if (p.hidden) { exitHide(); return; }
  const tile = G.tileAt(p.x, p.y);
  // entrar em esconderijo
  if (tile === TILE.HIDE) { enterHide(); return; }
  // papel de lore
  const pd = Math.hypot(m.paper.x - p.x, m.paper.y - p.y);
  if (!G.paperTaken && pd < 1.4) {
    if (m.paperWell && !G.wellDescending) {
      // descer pela corda do poço: 8 segundos vulnerável
      G.wellDescending = 8;
      G.caption('[descendo pela corda… a corda pesa]');
      return;
    }
    if (!m.paperWell) takePaper();
    return;
  }
  // garrafa de caña (oferenda ao Pombero)
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

function enterHide() {
  const p = G.player;
  p.hidden = true;
  p.breathLeft = p.breathMax();
  // monstros em caçada que VIRAM você entrar saberão
  for (const mo of G.monsters) {
    mo.sawEnterHide = mo.state === 'chase' && mo.canSeePlayer && mo.distPlayer() < 9 && lineOfSight(G.map, mo.x, mo.y, p.x, p.y);
    if (!mo.sawEnterHide && mo.state === 'chase') {
      mo.stimulus = { x: p.x, y: p.y };
    }
  }
  AudioSys.noise(AudioSys.fx, 0.4, { freq: 300, gain: 0.2, q: 1 });
  G.caption(`[você entrou: ${G.level.hideName}]`);
}

function exitHide() {
  const p = G.player;
  p.hidden = false;
  p.holdingBreath = false;
  AudioSys.noise(AudioSys.fx, 0.4, { freq: 300, gain: 0.2, q: 1 });
}

function takePaper() {
  G.paperTaken = true;
  G.exitOpen = true;
  AudioSys.paperSting();
  setTimeout(() => AudioSys.doorUnlock(), 900);
  showHudMessage('ENCONTRE A SAÍDA');
  G.caption('[uma porta destrancou, ecoando pelo mapa]');
  // modo fúria: +20% velocidade, todos alertados
  G.fury = true;
  for (const mo of G.monsters) {
    if (mo.def.hearing > 0) mo.alert(G.player.x, G.player.y);
  }
  // fase 8: o sino do templo toca — os TRÊS em fúria
  if (G.level.snow) AudioSys.radar('bellToll', { pan: 0, vol: 1 }, 1);
  // fase 2: alarme silencioso
  if (G.level.id === 1) G.caption('[uma luz vermelha gira em silêncio]');
  // fase 9: a maré começa a subir
  if (G.level.tide) { G.tideRising = true; G.tideTimer = 0; }
  // fase 10: cutscene final em vez de fuga
  if (G.level.id === 9) { finishGame(); return; }
}

function useConsumable(slot) {
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
  updateHudSlots();
}

// ---------- update por frame ----------
function updatePlayer(dt) {
  const p = G.player;
  if (p.dead) return;
  if (G.wellDescending > 0) { p.moving = false; p.running = false; return; } // pendurado na corda

  // mouse look
  const sens = SAVE.settings.sensitivity / 100 * 0.0023;
  p.angle += MouseDX * sens;
  MouseDX = 0; MouseDY = 0;
  p.focusing = MouseRight && p.lanternOn;

  if (p.hidden) {
    p.moving = false; p.running = false;
    // prender a respiração
    if (Keys['Space']) {
      if (!p.holdingBreath && p.breathLeft > 0) p.holdingBreath = true;
      if (p.holdingBreath) {
        p.breathLeft -= dt;
        if (p.breathLeft <= 0) {
          p.holdingBreath = false;
          AudioSys.gasp();
          G.emitNoise(p.x, p.y, 15);  // arquejo ALTO entrega a posição
          G.caption('[você arquejou ALTO]');
        }
      }
    } else {
      if (p.holdingBreath) { p.holdingBreath = false; AudioSys.breathRelease(); }
      p.breathLeft = Math.min(p.breathMax(), p.breathLeft + dt * 1.5);
    }
    return;
  }

  // teclas de movimento
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
  const solidAt = (x, y) => isSolidTile(G.map.t[Math.floor(y) * MAP_W + Math.floor(x)], G.exitOpen);
  if (!solidAt(p.x + dx + Math.sign(dx) * RADIUS, p.y)) p.x += dx;
  if (!solidAt(p.x, p.y + dy + Math.sign(dy) * RADIUS)) p.y += dy;
  p.moving = (fwd !== 0 || str !== 0);

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
      if (tile === TILE.WATER) radius = Math.max(radius, 10); // splash!
      if (radius > 0) G.emitNoise(p.x, p.y, radius);
      // rastro de cheiro (Adze/Luison)
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

  // cegar com o Farol de Mão (nível 3)
  if (p.focusing && SAVE.perm.lantern >= 3 && G.blindCooldown <= 0) {
    for (const mo of G.monsters) {
      if (mo.def.lightAttract && mo._screen && mo._screen.dist < G.lanternRange() * 1.5 && Math.abs(mo._screen.x - RW / 2) < 90) {
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
      if (p._lastPetal) G.map.t[p._lastPetal.y * MAP_W + p._lastPetal.x] = TILE.FLOOR;
      p._lastPetal = { x: Math.floor(p.x), y: Math.floor(p.y) };
    }
  } else if (p._lastPetal) {
    G.map.t[p._lastPetal.y * MAP_W + p._lastPetal.x] = TILE.FLOOR;
    p._lastPetal = null;
  }

  // coleta: moedas, pilhas
  collectItems();

  // chegou à saída?
  if (G.exitOpen) {
    const e = G.map.exit;
    if (Math.hypot(e.x + 0.5 - p.x, e.y + 0.5 - p.y) < 1.3) winLevel();
  }

  // prompt contextual
  updatePrompt();
}

function collectItems() {
  const p = G.player, m = G.map;
  const magnetR = SAVE.perm.magnet ? 3 : 0.8;
  for (const c of m.coins) {
    if (c.taken) continue;
    const d = Math.hypot(c.x - p.x, c.y - p.y);
    if (d < magnetR) {
      if (SAVE.perm.magnet && d > 0.8) { // moedas voam até você
        c.x += (p.x - c.x) * 0.18; c.y += (p.y - c.y) * 0.18;
        continue;
      }
      c.taken = true;
      G.runCoins += c.v;
      const silent = SAVE.perm.magnet;
      AudioSys.coinClink(silent);
      if (!silent) G.emitNoise(p.x, p.y, 8);  // o clink atrai
      showCoinCounter();
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

function updatePrompt() {
  const p = G.player, m = G.map;
  const el = document.getElementById('hud-prompt');
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
  el.classList.toggle('hidden', !txt);
  if (txt) el.textContent = txt;
}
