// ============================================================
// LUZ FRACA — save.js : save automático em localStorage
// ============================================================
'use strict';

const SAVE_KEY = 'luzfraca_save_v1';

function defaultSave() {
  return {
    coins: 0,
    papers: Array(10).fill(false),
    cleared: Array(10).fill(false),       // fases vencidas
    deaths: Array(10).fill(0),
    bestTimes: Array(10).fill(0),
    allCoins: Array(10).fill(false),      // pegou todas as moedas (Pão-duro)
    perm: { lantern: 0, stamina: 0, shoes: false, cotton: false, magnet: false, calm: false, map: false, pockets: false, radar: false, rabbit: false },
    cons: { spectral: 0, battery: 0, second: 0, bell: 0, incense: 0, adrenaline: 0, compass: 0 },
    ach: {},
    finished: false,        // zerou o jogo
    nightmare: false,       // zerou o modo pesadelo
    nmCleared: Array(10).fill(false),
    paper12: false,
    settings: {
      volMaster: 80, volMusic: 70, volFx: 85, volScare: 80,
      brightness: 100, sensitivity: 100,
      invertY: false, colorblind: false, captions: true,
    },
  };
}

let SAVE = loadSave();

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const d = defaultSave();
    const s = JSON.parse(raw);
    // merge defensivo (campos novos em versões futuras)
    for (const k of Object.keys(d)) {
      if (s[k] === undefined) s[k] = d[k];
      else if (typeof d[k] === 'object' && !Array.isArray(d[k]) && d[k] !== null) {
        s[k] = Object.assign({}, d[k], s[k]);
      }
    }
    return s;
  } catch (e) {
    return defaultSave();
  }
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sem storage */ }
}

function resetSave() {
  SAVE = defaultSave();
  saveGame();
}

function unlockedUpTo() {
  // fase i está desbloqueada se i==0 ou a anterior foi vencida
  let n = 0;
  for (let i = 0; i < 10; i++) if (i === 0 || SAVE.cleared[i - 1]) n = i;
  return n;
}

function papersCount() { return SAVE.papers.filter(Boolean).length; }

function grantAch(id) {
  if (!SAVE.ach[id]) {
    SAVE.ach[id] = true;
    saveGame();
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a && typeof addCaption === 'function') addCaption('🏆 Conquista: ' + a.name);
    return a;
  }
  return null;
}

function checkClienteFiel() {
  const p = SAVE.perm;
  if (p.lantern >= 3 && p.stamina >= 3 && p.shoes && p.cotton && p.magnet && p.calm && p.map && p.pockets && p.radar && p.rabbit) {
    return grantAch('cliente');
  }
  return null;
}
