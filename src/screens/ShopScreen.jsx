import { useState } from 'react';
import { useUI } from '../store/ui.js';
import { SHOP_PERM, SHOP_CONS, VENDOR_LINES } from '../game/data.js';
import { SAVE, saveGame, checkClienteFiel } from '../game/save.js';
import { AudioSys } from '../game/audio.js';

export default function ShopScreen() {
  const go = useUI(s => s.go);
  const bumpSave = useUI(s => s.bumpSave);
  useUI(s => s.saveVersion);
  const [tab, setTab] = useState('perm');
  const [line, setLine] = useState(() => VENDOR_LINES.enter[(Math.random() * VENDOR_LINES.enter.length) | 0]);

  const buy = (price, apply, special) => {
    if (SAVE.coins < price) { setLine(VENDOR_LINES.poor); return; }
    SAVE.coins -= price;
    apply();
    saveGame();
    bumpSave();
    AudioSys.vendor();
    setLine(special || VENDOR_LINES.buy[(Math.random() * VENDOR_LINES.buy.length) | 0]);
    checkClienteFiel();
  };

  return (
    <div className="menu-grain relative flex h-full flex-col overflow-y-auto bg-void p-8">
      <div className="vignette-overlay" />
      <div className="relative z-10 mx-auto flex w-full max-w-4xl items-baseline justify-between">
        <h2 className="font-title text-4xl tracking-[0.3em] text-bone">A LOJA</h2>
        <span className="font-paper text-lg text-amber-weak">🪙 {SAVE.coins}</span>
      </div>
      <p className="relative z-10 mx-auto mt-2 w-full max-w-4xl font-ui text-lg italic text-bone-dim">"{line}"</p>
      <div className="relative z-10 mx-auto mt-4 flex w-full max-w-4xl gap-2">
        {[['perm', 'PERMANENTES'], ['cons', 'CONSUMÍVEIS']].map(([id, label]) => (
          <button
            key={id}
            className={`border px-5 py-1.5 font-title text-sm tracking-[0.2em] ${tab === id ? 'border-amber-weak/60 text-amber-weak' : 'border-bone/10 text-bone-dim hover:text-bone'}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="relative z-10 mx-auto mt-4 grid w-full max-w-4xl grid-cols-1 gap-3 md:grid-cols-2">
        {tab === 'perm' ? SHOP_PERM.map(item => {
          if (item.levels) {
            const lvl = SAVE.perm[item.id];
            const next = item.levels[lvl];
            return (
              <div key={item.id} className="border border-bone/10 bg-coal/80 p-4">
                <h4 className="font-title text-lg tracking-wider text-bone"><span className="mr-2">{item.icon}</span>{item.name}</h4>
                <div className="mt-1 font-paper text-[11px] leading-relaxed text-bone-dim">
                  {item.levels.map((L, i) => (
                    <div key={i}>{i < lvl ? '✓' : '·'} N{i + 1} {L.name} ({L.price})</div>
                  ))}
                </div>
                <div className="mt-2 font-ui text-sm text-bone-dim">{next ? `Próximo: ${next.name} — ${next.desc}` : 'NÍVEL MÁXIMO.'}</div>
                <button
                  disabled={!next || SAVE.coins < next.price}
                  className="mt-3 w-full border border-amber-weak/30 py-1.5 font-paper text-xs text-amber-weak disabled:opacity-30"
                  onClick={() => next && buy(next.price, () => SAVE.perm[item.id]++, item.id === 'map' ? VENDOR_LINES.mapWarn : null)}
                >
                  {next ? `COMPRAR — ${next.price} moedas` : 'COMPLETO'}
                </button>
              </div>
            );
          }
          const owned = SAVE.perm[item.id];
          return (
            <div key={item.id} className="border border-bone/10 bg-coal/80 p-4">
              <h4 className="font-title text-lg tracking-wider text-bone"><span className="mr-2">{item.icon}</span>{item.name}</h4>
              <div className="mt-1 font-ui text-sm text-bone-dim">{item.desc}</div>
              <button
                disabled={owned || SAVE.coins < item.price}
                className="mt-3 w-full border border-amber-weak/30 py-1.5 font-paper text-xs text-amber-weak disabled:opacity-30"
                onClick={() => buy(item.price, () => { SAVE.perm[item.id] = true; }, item.id === 'map' ? VENDOR_LINES.mapWarn : null)}
              >
                {owned ? 'ADQUIRIDO' : `COMPRAR — ${item.price} moedas`}
              </button>
            </div>
          );
        }) : SHOP_CONS.map(item => {
          const n = SAVE.cons[item.id] || 0;
          const full = n >= item.max;
          return (
            <div key={item.id} className="border border-bone/10 bg-coal/80 p-4">
              <h4 className="font-title text-lg tracking-wider text-bone"><span className="mr-2">{item.icon}</span>{item.name}</h4>
              <div className="mt-1 font-ui text-sm text-bone-dim">{item.desc}</div>
              <div className="mt-1 font-paper text-[11px] text-bone-dim">Em estoque: {n} / {item.max}</div>
              <button
                disabled={full || SAVE.coins < item.price}
                className="mt-3 w-full border border-amber-weak/30 py-1.5 font-paper text-xs text-amber-weak disabled:opacity-30"
                onClick={() => buy(item.price, () => { SAVE.cons[item.id] = n + 1; }, item.id === 'second' ? VENDOR_LINES.secondChanceWarn : null)}
              >
                {full ? 'ESTOQUE CHEIO' : `COMPRAR — ${item.price} moedas`}
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="relative z-10 mx-auto mt-8 border border-bone/10 px-8 py-2 font-title tracking-[0.2em] text-bone-dim hover:text-bone"
        onClick={() => {
          const fromPrep = useUI.getState().shopFromPrep;
          useUI.setState({ shopFromPrep: false });
          go(fromPrep ? 'prep' : 'menu');
        }}
      >
        ← VOLTAR
      </button>
    </div>
  );
}
