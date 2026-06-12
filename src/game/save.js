// ============================================================
// LUZ FRACA — save.js : save automático em localStorage
// ============================================================
import { ACHIEVEMENTS } from './data.js';

const SAVE_KEY = 'luzfraca_save_v2';

function defaultSave() {
  return {
    coins: 0,
    papers: Array(10).fill(false),
    cleared: Array(10).fill(false),
    deaths: Array(10).fill(0),
    bestTimes: Array(10).fill(0),
    allCoins: Array(10).fill(false),
    perm: { lantern: 0, stamina: 0, shoes: false, cotton: false, magnet: false, calm: false, map: false, pockets: false, radar: false, rabbit: false },
    cons: { spectral: 0, battery: 0, second: 0, bell: 0, incense: 0, adrenaline: 0, compass: 0 },
    ach: {},
    finished: false,
    nightmare: false,
    nmCleared: Array(10).fill(false),
    paper12: false,
    settings: {
      volMaster: 80, volMusic: 70, volFx: 85, volScare: 80,
      brightness: 100, sensitivity: 100,
      invertY: false, colorblind: false, captions: true,
    },
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const d = defaultSave();
    const s = JSON.parse(raw);
    for (const k of Object.keys(d)) {
      if (s[k] === undefined) s[k] = d[k];
      else if (typeof d[k] === 'object' && !Array.isArray(d[k]) && d[k] !== null) {
        s[k] = Object.assign({}, d[k], s[k]);
      }
    }
    return s;
  } catch {
    return defaultSave();
  }
}

export const SAVE = loadSave();

// listeners para a UI reagir a mudanças no save
const listeners = new Set();
export function onSaveChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch { /* sem storage */ }
  for (const fn of listeners) fn();
}

export function resetSave() {
  Object.assign(SAVE, defaultSave());
  saveGame();
}

export function unlockedUpTo() {
  let n = 0;
  for (let i = 0; i < 10; i++) if (i === 0 || SAVE.cleared[i - 1]) n = i;
  return n;
}

export function papersCount() { return SAVE.papers.filter(Boolean).length; }

let achCaption = null;
export function setAchCaptionFn(fn) { achCaption = fn; }

export function grantAch(id) {
  if (!SAVE.ach[id]) {
    SAVE.ach[id] = true;
    saveGame();
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a && achCaption) achCaption('🏆 Conquista: ' + a.name);
    return a;
  }
  return null;
}

export function checkClienteFiel() {
  const p = SAVE.perm;
  if (p.lantern >= 3 && p.stamina >= 3 && p.shoes && p.cotton && p.magnet && p.calm && p.map && p.pockets && p.radar && p.rabbit) {
    return grantAch('cliente');
  }
  return null;
}
