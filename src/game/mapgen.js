// ============================================================
// LUZ FRACA — mapgen.js : geração procedural dos 10 mapas
// Tiles: 0 chão | 1 parede | 2 parede alt | 3 saída (trancada)
//        4 esconderijo | 5 água | 6 sala escura | 7 pétalas
//        8 salão do deus | 9 capim alto
// ============================================================

export const TILE = { FLOOR: 0, WALL: 1, WALL2: 2, EXIT: 3, HIDE: 4, WATER: 5, DARK: 6, PETAL: 7, GOD: 8, GRASS: 9 };
export const MAP_W = 48, MAP_H = 48;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMap(level, nightmare) {
  const rng = mulberry32(level.id * 7919 + (nightmare ? 31337 : 1) + ((Date.now() / 60000) | 0));
  const m = {
    w: MAP_W, h: MAP_H,
    t: new Uint8Array(MAP_W * MAP_H).fill(TILE.WALL),
    spawn: null, exit: null, paper: null,
    coins: [], batteries: [], props: [], hides: [],
    rooms: [], darkRoom: null, godHall: null,
    rng,
  };
  const at = (x, y) => m.t[y * MAP_W + x];
  const set = (x, y, v) => { if (x > 0 && y > 0 && x < MAP_W - 1 && y < MAP_H - 1) m.t[y * MAP_W + x] = v; };
  const rect = (x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ri = (a, b) => a + Math.floor(rng() * (b - a + 1));
  m.at = at; m.set = set;

  switch (level.gen) {
    case 'arena': genArena(m, rect, ri, rng); break;
    case 'shelves': genShelves(m, rect, ri, rng); break;
    case 'maze': genMaze(m, rect, ri, rng); break;
    case 'village': genVillage(m, rect, ri, rng, level); break;
    case 'savanna': genSavanna(m, rect, ri, rng); break;
    case 'facility': genFacility(m, rect, ri, rng); break;
    case 'island': genIsland(m, rect, ri, rng); break;
    case 'temple': genTemple(m, rect, ri, rng); break;
  }

  ensureConnectivity(m);
  placeEntities(m, level, nightmare, ri, rng);
  scatterDetail(m, level, ri, rng);
  return m;
}

// espalha entulho e detalhe temático em tiles livres (sem colisão)
function scatterDetail(m, level, ri, rng) {
  const themes = {
    arena: ['trash', 'flag', 'bottle', 'seat'],
    shelves: ['box', 'pallet', 'trash', 'spill'],
    maze: ['stain', 'wire', 'chair', 'stain'],
    village: level.candles ? ['skull', 'flowerpot', 'bench', 'trash'] :
      level.snow ? ['redlantern', 'bench', 'stonelamp', 'trash'] : ['barrel', 'hay', 'fence', 'trash'],
    savanna: ['rock', 'termite', 'bone', 'bush'],
    facility: ['crate', 'barrel', 'pipe', 'paperpile'],
    island: ['rock', 'plank', 'net', 'shell'],
    temple: ['skull', 'plate', 'ropecandle', 'stain'],
  };
  const list = themes[level.gen] || ['trash'];
  const n = 55;
  for (let i = 0; i < n; i++) {
    const t = m.freeTiles[Math.floor(rng() * m.freeTiles.length)];
    if (!t) continue;
    if (Math.hypot(t.x - m.spawn.x, t.y - m.spawn.y) < 2) continue;
    if (Math.hypot(t.x - m.paper.x, t.y - m.paper.y) < 2) continue;
    m.props.push({
      x: t.x + 0.2 + rng() * 0.6, y: t.y + 0.2 + rng() * 0.6,
      type: list[Math.floor(rng() * list.length)],
      rot: rng() * Math.PI * 2, s: 0.7 + rng() * 0.6, detail: true,
    });
  }
}

// --- FASE 1: estádio — campo aberto central + anel + vestiários ---
function genArena(m, rect, ri, rng) {
  rect(6, 6, 41, 41, TILE.FLOOR);                      // arquibancada (anel)
  for (let y = 8; y < 40; y += 4) for (let x = 8; x < 40; x += 4) {
    if (x < 12 || x > 36 || y < 12 || y > 36) m.set(x, y, TILE.WALL2);
  }
  rect(13, 13, 34, 34, TILE.FLOOR);                    // campo
  rect(14, 42, 33, 46, TILE.FLOOR);                    // vestiários/túnel (sul)
  for (let x = 17; x < 32; x += 4) { m.set(x, 44, TILE.WALL); m.set(x, 45, TILE.WALL); }
  rect(22, 40, 25, 42, TILE.FLOOR);                    // túnel liga campo↔vestiário
  m.spawn = { x: 23.5, y: 44.5 };
  m.paper = { x: 23.5, y: 23.5 };                      // marca do pênalti
  m.exit = { x: 23, y: 6 };
  m.set(23, 6, TILE.EXIT);
  m.patrolHint = 'ring';
  m.props.push(
    { x: 23.5, y: 13.8, type: 'goal' }, { x: 23.5, y: 33.8, type: 'goal' },
    { x: 10, y: 10, type: 'scoreboard' },
    { x: 8.5, y: 24, type: 'floodlight' }, { x: 39.5, y: 24, type: 'floodlight' },
    { x: 24, y: 8.5, type: 'floodlight' }, { x: 24, y: 39.5, type: 'floodlight' },
    { x: 13.6, y: 23.5, type: 'bench3' }, { x: 34.4, y: 23.5, type: 'bench3' },
    { x: 13.5, y: 13.5, type: 'cornerflag' }, { x: 34.5, y: 13.5, type: 'cornerflag' },
    { x: 13.5, y: 34.5, type: 'cornerflag' }, { x: 34.5, y: 34.5, type: 'cornerflag' },
  );
}

// --- FASE 2: walmart — grade de prateleiras 8x6 ---
function genShelves(m, rect, ri, rng) {
  rect(3, 3, 44, 44, TILE.FLOOR);
  for (let row = 0; row < 6; row++) {
    const y = 7 + row * 5;
    for (let col = 0; col < 8; col++) {
      const x = 5 + col * 5;
      const gap = ri(0, 3);
      for (let i = 0; i < 4; i++) if (i !== gap) m.set(x + i, y, rng() < 0.8 ? TILE.WALL : TILE.WALL2);
    }
  }
  rect(3, 3, 44, 5, TILE.FLOOR);                       // estoque dos fundos (norte)
  for (let x = 8; x < 42; x += 6) { m.set(x, 4, TILE.WALL2); }
  rect(38, 2, 44, 6, TILE.FLOOR); rect(37, 2, 37, 6, TILE.WALL); m.set(37, 4, TILE.FLOOR);
  m.paper = { x: 41.5, y: 3.5 };
  rect(5, 40, 42, 44, TILE.FLOOR);                     // caixas (sul) e doca
  for (let x = 8; x < 40; x += 5) m.set(x, 41, TILE.WALL2);
  m.spawn = { x: 23.5, y: 42.5 };
  m.exit = { x: 5, y: 3 }; m.set(5, 3, TILE.EXIT);
  m.props.push(
    { x: 12.5, y: 22.5, type: 'cart' }, { x: 30.5, y: 17.5, type: 'cart' }, { x: 20.5, y: 32.5, type: 'cart' },
    { x: 8.5, y: 42.5, type: 'register' }, { x: 15.5, y: 42.5, type: 'register' }, { x: 25.5, y: 42.5, type: 'register' },
    { x: 41.5, y: 5.2, type: 'deskpile' },
    { x: 6.5, y: 4.5, type: 'pallet' }, { x: 12.5, y: 4.5, type: 'pallet' },
  );
  // luzes fluorescentes mortas penduradas
  for (let i = 0; i < 8; i++) m.props.push({ x: 7 + i * 5 + 0.5, y: 20.5, type: 'deadlamp', ceiling: true });
}

// --- FASE 3: backrooms — labirinto amarelo + 3 âncoras ---
function genMaze(m, rect, ri, rng) {
  for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
    if (x % 2 === 1 || y % 2 === 1) m.set(x, y, TILE.FLOOR);
  }
  for (let y = 2; y < MAP_H - 2; y += 2) for (let x = 2; x < MAP_W - 2; x += 2) {
    m.set(x, y, TILE.WALL);
    const dir = ri(0, 3);
    const dx = [1, -1, 0, 0][dir], dy = [0, 0, 1, -1][dir];
    m.set(x + dx, y + dy, TILE.WALL);
  }
  rect(6, 6, 14, 14, TILE.FLOOR);                      // sala das pilastras
  for (let y = 8; y <= 12; y += 2) for (let x = 8; x <= 12; x += 2) m.set(x, y, TILE.WALL2);
  rect(32, 30, 42, 40, TILE.WATER);                    // sala alagada
  rect(34, 8, 42, 15, TILE.DARK);                      // sala escura
  m.darkRoom = { x0: 34, y0: 8, x1: 42, y1: 15 };
  m.paper = { x: 38.5, y: 11.5 };
  m.spawn = { x: 7.5, y: 40.5 };
  rect(6, 38, 10, 43, TILE.FLOOR);
  m.exit = { x: 45, y: 24 }; m.set(45, 24, TILE.EXIT);
  rect(43, 23, 44, 25, TILE.FLOOR);
  // luminárias zumbindo no teto a intervalos regulares
  for (let y = 4; y < 44; y += 6) for (let x = 4; x < 44; x += 6) {
    m.props.push({ x: x + 0.5, y: y + 0.5, type: 'fluorescent', ceiling: true });
  }
}

// --- FASES 4/6/8: vila — casas espalhadas com ruas ---
function genVillage(m, rect, ri, rng, level) {
  rect(2, 2, 45, 45, TILE.FLOOR);
  const buildings = [];
  for (let i = 0; i < 11; i++) {
    const w = ri(5, 8), h = ri(5, 8);
    const x = ri(3, 44 - w), y = ri(3, 38 - h);
    if (buildings.some(b => x < b.x + b.w + 2 && x + w + 2 > b.x && y < b.y + b.h + 2 && y + h + 2 > b.y)) continue;
    buildings.push({ x, y, w, h });
    for (let yy = y; yy <= y + h; yy++) for (let xx = x; xx <= x + w; xx++) {
      const edge = xx === x || xx === x + w || yy === y || yy === y + h;
      m.set(xx, yy, edge ? (rng() < 0.85 ? TILE.WALL : TILE.WALL2) : TILE.FLOOR);
    }
    const doorSide = ri(0, 3);
    if (doorSide === 0) m.set(x + (w >> 1), y, TILE.FLOOR);
    else if (doorSide === 1) m.set(x + (w >> 1), y + h, TILE.FLOOR);
    else if (doorSide === 2) m.set(x, y + (h >> 1), TILE.FLOOR);
    else m.set(x + w, y + (h >> 1), TILE.FLOOR);
    m.rooms.push({ cx: x + w / 2, cy: y + h / 2, building: true });
  }
  m.buildings = buildings;
  // prédio especial do papel (igreja / sétima cruz / templo no "topo")
  rect(20, 3, 29, 11, TILE.FLOOR);
  for (let x = 20; x <= 29; x++) { m.set(x, 3, TILE.WALL); m.set(x, 11, TILE.WALL); }
  for (let y = 3; y <= 11; y++) { m.set(20, y, TILE.WALL); m.set(29, y, TILE.WALL); }
  m.set(24, 11, TILE.FLOOR); m.set(25, 11, TILE.FLOOR);
  m.paper = { x: 24.5, y: 5.5 };
  m.spawn = { x: 24.5, y: 43.5 };
  m.exit = { x: 2, y: 40 }; m.set(2, 40, TILE.EXIT);
  if (level.candles) {           // México: velas + caminhos de pétalas
    for (let i = 0; i < 22; i++) m.props.push({ x: ri(4, 43) + 0.5, y: ri(13, 43) + 0.5, type: 'candle' });
    let px = 24, py = 42;
    for (let s = 0; s < 60 && py > 13; s++) {
      if (m.at(px, py) === TILE.FLOOR) m.set(px, py, TILE.PETAL);
      const r = rng(); if (r < 0.6) py--; else if (r < 0.8) px = Math.max(4, px - 1); else px = Math.min(43, px + 1);
    }
    m.props.push({ x: 24.5, y: 7.5, type: 'altar' });
    // varal de papel picado entre as casas
    for (let i = 0; i < 6; i++) m.props.push({ x: ri(6, 41) + 0.5, y: ri(14, 42) + 0.5, type: 'papelpicado', ceiling: true });
  }
  if (level.offerings) {         // Paraguai: 7 cruzes + 3 garrafas de caña
    for (let i = 0; i < 7; i++) m.props.push({ x: 33.5 + (i % 4) * 1.5, y: 35.5 + Math.floor(i / 4) * 2, type: i === 6 ? 'cross7' : 'cross' });
    m.paper = { x: 36.5, y: 37.5 };
    for (let i = 0; i < 3; i++) m.props.push({ x: ri(5, 42) + 0.5, y: ri(14, 42) + 0.5, type: 'cana', id: i });
    for (let i = 0; i < 5; i++) m.props.push({ x: ri(4, 43) + 0.5, y: ri(13, 43) + 0.5, type: 'deadtree', solid: true });
  }
  if (level.snow) {              // Ásia: guarda-chuvas decorativos (um é o Kara-Kasa)
    for (let i = 0; i < 9; i++) m.props.push({ x: ri(4, 43) + 0.5, y: ri(13, 43) + 0.5, type: 'umbrella' });
    m.props.push({ x: 24.5, y: 7.5, type: 'altar' });
    for (let i = 0; i < 12; i++) m.props.push({ x: ri(4, 43) + 0.5, y: ri(13, 43) + 0.5, type: 'redlantern', ceiling: true });
    m.props.push({ x: 22.5, y: 12.2, type: 'torii' }, { x: 24.5, y: 13.5, type: 'torii' });
  }
}

// --- FASE 5: savana — campo aberto, capim alto, cabanas, poço ---
function genSavanna(m, rect, ri, rng) {
  rect(2, 2, 45, 45, TILE.FLOOR);
  for (let i = 0; i < 14; i++) {
    const cx = ri(5, 42), cy = ri(5, 42), r = ri(2, 5);
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && m.t[y * MAP_W + x] === TILE.FLOOR) m.set(x, y, TILE.GRASS);
    }
  }
  for (let i = 0; i < 6; i++) {
    const cx = ri(6, 41), cy = ri(6, 41);
    for (let a = 0; a < 12; a++) {
      const x = Math.round(cx + 2.2 * Math.cos(a * Math.PI / 6)), y = Math.round(cy + 2.2 * Math.sin(a * Math.PI / 6));
      if (a !== 3) m.set(x, y, TILE.WALL2);
    }
    m.rooms.push({ cx, cy, building: true, hut: true });
    m.props.push({ x: cx + 0.5, y: cy + 0.5, type: 'firepit' });
  }
  for (let i = 0; i < 5; i++) m.props.push({ x: ri(4, 43) + 0.5, y: ri(4, 43) + 0.5, type: 'baobab', solid: true });
  rect(22, 22, 26, 26, TILE.FLOOR);
  m.props.push({ x: 24.5, y: 24.5, type: 'well' });
  m.paper = { x: 24.5, y: 24.5 }; m.paperWell = true;
  m.spawn = { x: 5.5, y: 43.5 };
  m.exit = { x: 45, y: 6 }; m.set(45, 6, TILE.EXIT);
  m.props.push({ x: 12.5, y: 12.5, type: 'drum' });
}

// --- FASE 7: NASA — salas + corredores ---
function genFacility(m, rect, ri, rng) {
  const roomsDef = [
    [3, 3, 14, 12, 'hangar'], [18, 3, 30, 10, 'controle'], [34, 3, 44, 12, 'quarentena'],
    [3, 16, 12, 26, 'refeitorio'], [16, 14, 28, 24, 'labs'], [32, 16, 44, 26, 'dormitorios'],
    [3, 30, 14, 42, 'doca'], [18, 28, 30, 42, 'reatores'], [34, 30, 44, 42, 'observacao'],
  ];
  for (const [x0, y0, x1, y1, name] of roomsDef) {
    rect(x0, y0, x1, y1, TILE.FLOOR);
    m.rooms.push({ cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, name });
  }
  rect(15, 6, 17, 40, TILE.FLOOR); rect(31, 6, 33, 40, TILE.FLOOR);
  rect(6, 13, 42, 15, TILE.FLOOR); rect(6, 27, 42, 29, TILE.FLOOR);
  m.paper = { x: 39.5, y: 6.5 };
  m.props.push(
    { x: 39.5, y: 8.5, type: 'gurney' }, { x: 22.5, y: 6.5, type: 'console' }, { x: 8.5, y: 7.5, type: 'rocket', solid: true },
    { x: 25.5, y: 6.5, type: 'console' }, { x: 19.5, y: 6.5, type: 'console' },
    { x: 36.5, y: 9.5, type: 'gurney' }, { x: 42.5, y: 10.5, type: 'gurney' },
    { x: 7.5, y: 19.5, type: 'table' }, { x: 7.5, y: 23.5, type: 'table' },
    { x: 22.5, y: 18.5, type: 'labtank' }, { x: 25.5, y: 21.5, type: 'labtank' },
    { x: 24.5, y: 35.5, type: 'reactor' }, { x: 21.5, y: 38.5, type: 'reactor' },
    { x: 8.5, y: 36.5, type: 'crate' }, { x: 10.5, y: 37.5, type: 'crate' },
    { x: 38.5, y: 36.5, type: 'telescope' },
  );
  // luzes de emergência vermelhas nos corredores
  for (let y = 8; y < 40; y += 8) {
    m.props.push({ x: 16.5, y: y + 0.5, type: 'emergencylight', ceiling: true });
    m.props.push({ x: 32.5, y: y + 0.5, type: 'emergencylight', ceiling: true });
  }
  m.spawn = { x: 8.5, y: 40.5 };
  m.exit = { x: 3, y: 36 }; m.set(3, 36, TILE.EXIT);
}

// --- FASE 9: ilha — praia, floresta, farol, templo central com maré ---
function genIsland(m, rect, ri, rng) {
  rect(2, 2, 45, 45, TILE.WATER);
  for (let y = 4; y < 44; y++) for (let x = 4; x < 44; x++) {
    const dx = (x - 24) / 19, dy = (y - 24) / 17;
    if (dx * dx + dy * dy < 1) m.set(x, y, TILE.FLOOR);
  }
  m.tideTiles = [];
  for (let y = 4; y < 44; y++) for (let x = 4; x < 44; x++) {
    const dx = (x - 24) / 19, dy = (y - 24) / 17, d = dx * dx + dy * dy;
    if (d >= 0.62 && d < 1 && m.t[y * MAP_W + x] === TILE.FLOOR) m.tideTiles.push(y * MAP_W + x);
  }
  for (let i = 0; i < 22; i++) {
    const x = ri(10, 38), y = ri(8, 38);
    if (m.t[y * MAP_W + x] === TILE.FLOOR) m.props.push({ x: x + 0.5, y: y + 0.5, type: 'tree', solid: true });
  }
  for (let i = 0; i < 5; i++) m.props.push({ x: 10 + i * 6.5, y: 40.5, type: 'wreck' });
  m.props.push({ x: 10.5, y: 9.5, type: 'lighthouse', solid: true });
  rect(21, 21, 27, 27, TILE.WATER);
  m.templeTiles = [];
  for (let y = 21; y <= 27; y++) for (let x = 21; x <= 27; x++) m.templeTiles.push(y * MAP_W + x);
  m.paper = { x: 24.5, y: 24.5 };
  m.spawn = { x: 24.5, y: 41.5 };
  m.exit = { x: 24, y: 4 }; m.set(24, 4, TILE.EXIT);
  m.props.push({ x: 22.5, y: 20.2, type: 'templeStairs' });
  // colunas do templo submerso
  for (const [cx, cy] of [[21.5, 21.5], [26.5, 21.5], [21.5, 26.5], [26.5, 26.5]]) {
    m.props.push({ x: cx, y: cy, type: 'column' });
  }
}

// --- FASE 10: culto — capela, dormitórios, túneis, Salão da Voz ---
function genTemple(m, rect, ri, rng) {
  rect(14, 3, 33, 12, TILE.FLOOR);                     // capela torta
  for (let x = 17; x < 31; x += 3) { m.set(x, 6, TILE.WALL2); m.set(x, 9, TILE.WALL2); }
  rect(4, 5, 11, 12, TILE.FLOOR);                      // dormitórios
  for (let y = 6; y < 12; y += 2) m.set(7, y, TILE.WALL2);
  rect(36, 5, 44, 12, TILE.FLOOR);                     // refeitório (100 pratos)
  rect(14, 12, 17, 20, TILE.FLOOR); rect(30, 12, 33, 20, TILE.FLOOR);
  rect(4, 12, 7, 16, TILE.FLOOR); rect(40, 12, 43, 16, TILE.FLOOR);
  rect(4, 16, 43, 20, TILE.FLOOR);                     // claustro
  rect(10, 20, 13, 30, TILE.FLOOR); rect(34, 20, 37, 30, TILE.FLOOR);
  rect(22, 20, 25, 30, TILE.FLOOR);
  rect(8, 30, 39, 33, TILE.FLOOR);                     // antecâmara
  for (let y = 34; y <= 45; y++) for (let x = 12; x <= 35; x++) {
    const dx = (x - 23.5) / 12, dy = (y - 39.5) / 6;
    if (dx * dx + dy * dy < 1) m.set(x, y, TILE.GOD);
  }
  m.godHall = { x0: 12, y0: 34, x1: 35, y1: 45 };
  m.paper = { x: 23.5, y: 43.5 };
  m.props.push({ x: 23.5, y: 44.6, type: 'idol' }, { x: 23.5, y: 7.5, type: 'altar' });
  for (let i = 0; i < 8; i++) m.props.push({ x: ri(15, 32) + 0.5, y: ri(16, 19) + 0.5, type: 'blackcandle' });
  // 100 pratos no refeitório
  for (let i = 0; i < 9; i++) m.props.push({ x: 37.5 + (i % 3) * 2.5, y: 6.5 + Math.floor(i / 3) * 2, type: 'table' });
  m.spawn = { x: 23.5, y: 4.5 };
  m.exit = { x: 23, y: 3 }; m.set(23, 3, TILE.EXIT);
}

// ---------- conectividade ----------
export function ensureConnectivity(m) {
  const pass = v => v !== TILE.WALL && v !== TILE.WALL2;
  const idx = (x, y) => y * MAP_W + x;
  const seen = new Uint8Array(MAP_W * MAP_H);
  const sx = Math.floor(m.spawn.x), sy = Math.floor(m.spawn.y);
  const q = [[sx, sy]]; seen[idx(sx, sy)] = 1;
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      if (!seen[idx(nx, ny)] && pass(m.t[idx(nx, ny)])) { seen[idx(nx, ny)] = 1; q.push([nx, ny]); }
    }
  }
  const carveTo = (tx, ty) => {
    let x = sx, y = sy;
    while (x !== tx || y !== ty) {
      if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y);
      if (!pass(m.t[idx(x, y)])) {
        if (m.t[idx(x, y)] !== TILE.EXIT) m.t[idx(x, y)] = TILE.FLOOR;
      }
    }
  };
  for (const poi of [m.paper, { x: m.exit.x + 0.5, y: m.exit.y + 1.5 }]) {
    const px = Math.floor(poi.x), py = Math.floor(poi.y);
    if (!seen[idx(px, py)]) carveTo(px, py);
  }
}

// ---------- moedas, pilhas, esconderijos ----------
function placeEntities(m, level, nightmare, ri, rng) {
  const idx = (x, y) => y * MAP_W + x;
  const freeTiles = [];
  for (let y = 2; y < MAP_H - 2; y++) for (let x = 2; x < MAP_W - 2; x++) {
    const v = m.t[idx(x, y)];
    if (v === TILE.FLOOR || v === TILE.PETAL || v === TILE.GRASS || v === TILE.GOD) freeTiles.push({ x, y });
  }
  const pd = (t) => Math.hypot(t.x - m.paper.x, t.y - m.paper.y);
  freeTiles.sort((a, b) => pd(b) - pd(a));

  const n = level.coins;
  const safeN = Math.floor(n * 0.6), midN = Math.floor(n * 0.3), dangerN = n - safeN - midN;
  const third = Math.floor(freeTiles.length / 3);
  const pick = (arr, count, value) => {
    for (let i = 0; i < count; i++) {
      const t = arr[Math.floor(rng() * arr.length)];
      if (!t) continue;
      m.coins.push({ x: t.x + 0.3 + rng() * 0.4, y: t.y + 0.3 + rng() * 0.4, v: value, taken: false });
    }
  };
  pick(freeTiles.slice(0, third), safeN, 1);
  pick(freeTiles.slice(third, third * 2), midN, 1);
  pick(freeTiles.slice(third * 2), dangerN, 2);

  const nb = nightmare ? 3 : 6;
  for (let i = 0; i < nb; i++) {
    const t = freeTiles[Math.floor(rng() * freeTiles.length)];
    m.batteries.push({ x: t.x + 0.5, y: t.y + 0.5, taken: false });
  }

  let placed = 0;
  for (let tries = 0; tries < 500 && placed < 10; tries++) {
    const t = freeTiles[Math.floor(rng() * freeTiles.length)];
    const v = m.t[idx(t.x, t.y)];
    if (v !== TILE.FLOOR) continue;
    const nearWall = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const w = m.t[idx(t.x + dx, t.y + dy)];
      return w === TILE.WALL || w === TILE.WALL2;
    });
    if (!nearWall) continue;
    if (Math.hypot(t.x - m.spawn.x, t.y - m.spawn.y) < 3) continue;
    m.t[idx(t.x, t.y)] = TILE.HIDE;
    m.hides.push({ x: t.x, y: t.y });
    placed++;
  }

  if (nightmare && !m.paperWell && level.gen !== 'temple') {
    const far = freeTiles.slice(third * 2);
    const t = far[Math.floor(rng() * far.length)];
    if (t) m.paper = { x: t.x + 0.5, y: t.y + 0.5 };
  }
  m.freeTiles = freeTiles;
}

// tile sólido para movimento?
export function isSolidTile(v, exitOpen) {
  if (v === TILE.WALL || v === TILE.WALL2) return true;
  if (v === TILE.EXIT) return !exitOpen;
  return false;
}

// ponto livre aleatório (para waypoints de patrulha)
export function randomFreePoint(m) {
  const t = m.freeTiles[Math.floor(m.rng() * m.freeTiles.length)];
  return { x: t.x + 0.5, y: t.y + 0.5 };
}

// BFS: próximo passo de (sx,sy) até (tx,ty) — usado pela IA
export function bfsNextStep(m, sx, sy, tx, ty, exitOpen) {
  const idx = (x, y) => y * MAP_W + x;
  sx = Math.floor(sx); sy = Math.floor(sy); tx = Math.floor(tx); ty = Math.floor(ty);
  if (sx === tx && sy === ty) return null;
  const prev = new Int32Array(MAP_W * MAP_H).fill(-1);
  const q = [idx(tx, ty)]; prev[idx(tx, ty)] = idx(tx, ty);
  let head = 0;
  while (head < q.length) {
    const cur = q[head++];
    const cx = cur % MAP_W, cy = (cur / MAP_W) | 0;
    if (cx === sx && cy === sy) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 1 || ny < 1 || nx >= MAP_W - 1 || ny >= MAP_H - 1) continue;
      const ni = idx(nx, ny);
      if (prev[ni] !== -1 || isSolidTile(m.t[ni], exitOpen)) continue;
      prev[ni] = cur; q.push(ni);
    }
  }
  const si = idx(sx, sy);
  if (prev[si] === -1) return null;
  const nxt = prev[si];
  return { x: (nxt % MAP_W) + 0.5, y: ((nxt / MAP_W) | 0) + 0.5 };
}

// linha de visão em grid (DDA simples)
export function lineOfSight(m, x0, y0, x1, y1) {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.ceil(dist * 3);
  for (let i = 1; i < steps; i++) {
    const x = x0 + (x1 - x0) * i / steps, y = y0 + (y1 - y0) * i / steps;
    const v = m.t[Math.floor(y) * MAP_W + Math.floor(x)];
    if (v === TILE.WALL || v === TILE.WALL2) return false;
  }
  return true;
}
