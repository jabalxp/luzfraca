import { useState } from 'react';
import { useUI } from '../store/ui.js';
import { LEVELS, SHOP_CONS } from '../game/data.js';
import { SAVE } from '../game/save.js';

export default function PrepScreen() {
  const go = useUI(s => s.go);
  const id = useUI(s => s.prepLevelId);
  const startLevel = useUI(s => s.startLevel);
  useUI(s => s.saveVersion);
  const [nightmare, setNightmare] = useState(false);
  const lv = LEVELS[id];

  let warn = '';
  if (lv.noSecondChance && SAVE.cons.second > 0) warn = '⚠ A Segunda Chance NÃO funciona nesta fase. O Deus Cego não dá segundas chances.';
  if (lv.noMap && SAVE.perm.map) warn = '⚠ O Mapa Rabiscado não funciona aqui — o desenho aparece borrado.';

  return (
    <div className="menu-grain relative flex h-full items-center justify-center bg-void p-6">
      <div className="vignette-overlay" />
      <div className="relative z-10 w-full max-w-xl border border-bone/10 bg-coal/90 p-8">
        <h2 className="font-title text-3xl tracking-[0.2em] text-bone">FASE {id + 1} — {lv.name}</h2>
        <p className="mt-3 font-ui text-lg italic leading-snug text-bone-dim">{lv.desc}</p>
        {warn && <p className="mt-3 font-paper text-sm text-blood-bright">{warn}</p>}
        <div className="mt-5 grid grid-cols-2 gap-1 font-paper text-xs text-bone-dim">
          {SHOP_CONS.map(item => (
            <div key={item.id}>{item.icon} {item.name}: <b className="text-bone">{SAVE.cons[item.id] || 0}</b></div>
          ))}
        </div>
        {SAVE.finished && (
          <label className="mt-5 flex cursor-pointer items-center gap-2 font-paper text-sm text-blood-bright">
            <input type="checkbox" checked={nightmare} onChange={e => setNightmare(e.target.checked)} />
            ☠ Modo Pesadelo (+1 monstro visitante)
          </label>
        )}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            className="border border-bone/10 px-5 py-2.5 font-title text-sm tracking-[0.15em] text-bone-dim hover:text-bone"
            onClick={() => { useUI.setState({ shopFromPrep: true }); go('shop'); }}
          >
            LOJA (última chance)
          </button>
          <button
            className="animate-tremble border border-blood bg-blood/20 px-10 py-2.5 font-title text-xl tracking-[0.25em] text-bone hover:bg-blood/40"
            onClick={() => startLevel(id, nightmare)}
          >
            ENTRAR
          </button>
        </div>
        <button
          className="mt-6 font-title text-sm tracking-[0.2em] text-bone-dim hover:text-bone"
          onClick={() => go('play')}
        >
          ← VOLTAR
        </button>
      </div>
    </div>
  );
}
