// ============================================================
// LUZ FRACA — store/ui.js : estado reativo da interface (Zustand)
// O estado pesado da simulação vive fora do React (gameRef);
// aqui ficam telas, HUD e overlays.
// ============================================================
import { create } from 'zustand';
import { createGame, destroyGame } from '../game/sim.js';
import { SAVE, saveGame, setAchCaptionFn } from '../game/save.js';
import { AudioSys } from '../game/audio.js';

// instância da simulação, fora do React (sem re-render por frame)
export const gameRef = { current: null };

let capId = 0;

export const useUI = create((set, get) => ({
  screen: 'intro',          // intro | menu | play | prep | lore | settings | shop | game
  prepLevelId: 0,
  shopFromPrep: false,
  saveVersion: 0,           // bump quando o SAVE muda

  // sessão de jogo
  paused: false,
  deathInfo: null,
  winInfo: null,
  finalText: null,

  // HUD
  captions: [],             // {id, txt}
  prompt: null,
  hudMessage: null,
  hudCoins: null,           // {value, ts}
  petals: -1,
  slots: [null, null, null],
  vhsFlash: 0,

  go(screen) { AudioSys.uiClick(); set({ screen }); },
  openPrep(id) { AudioSys.uiClick(); set({ prepLevelId: id, screen: 'prep' }); },
  bumpSave() { set(s => ({ saveVersion: s.saveVersion + 1 })); },

  startLevel(id, nightmare) {
    const ui = {
      caption: (txt) => {
        if (!SAVE.settings.captions) return;
        const id = ++capId;
        set(s => ({ captions: [...s.captions.slice(-3), { id, txt }] }));
        setTimeout(() => set(s => ({ captions: s.captions.filter(c => c.id !== id) })), 4000);
      },
      hudMessage: (txt) => {
        set({ hudMessage: txt });
        setTimeout(() => set({ hudMessage: null }), 3500);
      },
      coinCounter: (value) => set({ hudCoins: { value, ts: Date.now() } }),
      petals: (n) => set({ petals: n }),
      slots: (slots) => set({ slots }),
      prompt: (txt) => { if (get().prompt !== txt) set({ prompt: txt }); },
      vhsFlash: () => set(s => ({ vhsFlash: s.vhsFlash + 1 })),
      death: (info) => {
        document.exitPointerLock?.();
        setTimeout(() => set({ deathInfo: info }), 700);
        get().bumpSave();
      },
      win: (info) => {
        document.exitPointerLock?.();
        set({ winInfo: info });
        get().bumpSave();
      },
      final: (text) => {
        document.exitPointerLock?.();
        set({ finalText: text });
        get().bumpSave();
      },
    };
    gameRef.current = createGame(id, nightmare, ui);
    if (typeof window !== 'undefined') window.__LUZ = gameRef; // depuração/testes
    set({
      screen: 'game', paused: false,
      deathInfo: null, winInfo: null, finalText: null,
      captions: [], prompt: null, hudMessage: null, hudCoins: null,
      petals: -1, slots: gameRef.current.consSlots.slice(),
    });
  },

  togglePause() {
    const G = gameRef.current;
    if (!G || !G.running || G.player.dead) return;
    G.paused = !G.paused;
    if (G.paused) document.exitPointerLock?.();
    set({ paused: G.paused });
  },

  closeGame(toScreen = 'play') {
    const G = gameRef.current;
    if (G) destroyGame(G);
    gameRef.current = null;
    document.exitPointerLock?.();
    set({
      screen: toScreen, paused: false,
      deathInfo: null, winInfo: null, finalText: null,
      captions: [], prompt: null, hudMessage: null, hudCoins: null,
    });
    get().bumpSave();
  },
}));

// conquistas concedidas fora de uma fase também geram caption se possível
setAchCaptionFn((txt) => {
  const s = useUI.getState();
  if (s.screen === 'game') {
    const id = ++capId;
    useUI.setState(st => ({ captions: [...st.captions.slice(-3), { id, txt }] }));
    setTimeout(() => useUI.setState(st => ({ captions: st.captions.filter(c => c.id !== id) })), 4000);
  }
});

// util de compra compartilhado pela Loja
export function spendCoins(price) {
  if (SAVE.coins < price) return false;
  SAVE.coins -= price;
  saveGame();
  return true;
}
