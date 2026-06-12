import { useState } from 'react';
import { useUI } from '../store/ui.js';
import { LORE, LORE_SECRET_11, LORE_SECRET_12 } from '../game/data.js';
import { SAVE, papersCount } from '../game/save.js';
import { AudioSys } from '../game/audio.js';

function PaperModal({ index, onClose }) {
  const paper = LORE[index];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        className="paper-bg relative max-h-[85vh] w-full max-w-2xl overflow-y-auto p-8 text-stone-900 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
        style={{ transform: 'rotate(-0.6deg)' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute right-3 top-2 font-paper text-xl text-stone-700 hover:text-black" onClick={onClose}>✕</button>
        <h3 className="font-paper text-lg font-bold">{paper.title}</h3>
        <div className="mt-4 space-y-4 font-paper text-sm leading-relaxed">
          <p><b>A vida antes:</b> "{paper.before}"</p>
          <p><b>O lugar:</b> "{paper.placeTx}"</p>
          <p><b>O monstro:</b> "{paper.monsterTx}"</p>
        </div>
      </div>
    </div>
  );
}

export default function LoreScreen() {
  const go = useUI(s => s.go);
  const [open, setOpen] = useState(null);
  const count = papersCount();
  return (
    <div className="menu-grain relative flex h-full flex-col overflow-y-auto bg-void p-8">
      <div className="vignette-overlay" />
      <h2 className="relative z-10 mb-6 text-center font-title text-4xl tracking-[0.3em] text-bone">OS PAPÉIS</h2>
      <div className="relative z-10 mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-5">
        {LORE.map((paper, i) => SAVE.papers[i] ? (
          <button
            key={i}
            className="paper-bg h-40 p-3 text-left text-stone-900 transition-transform hover:rotate-1 hover:scale-105"
            style={{ transform: `rotate(${(i % 3 - 1) * 1.5}deg)` }}
            onClick={() => { setOpen(i); AudioSys.whisper(paper.title); }}
          >
            <h4 className="font-paper text-xs font-bold">{paper.title.split('—')[0]}</h4>
            <div className="mt-2 font-paper text-[10px] leading-snug opacity-80">{paper.before.slice(0, 90)}…</div>
          </button>
        ) : (
          <div key={i} className="flex h-40 flex-col items-center justify-center border border-bone/5 bg-coal/70">
            <div className="font-title text-2xl text-bone-dim/50">???</div>
            <small className="mt-1 font-paper text-[10px] text-bone-dim/40">fase {i + 1}</small>
          </div>
        ))}
      </div>
      {count >= 10 && (
        <div className="relative z-10 mx-auto mt-8 max-w-2xl whitespace-pre-wrap border border-amber-weak/20 bg-coal/80 p-6 font-paper text-sm leading-relaxed text-amber-weak">
          {LORE_SECRET_11}
          {SAVE.paper12 && '\n\n———\n\n' + LORE_SECRET_12.title + '\n' + LORE_SECRET_12.text}
        </div>
      )}
      <button
        className="relative z-10 mx-auto mt-8 border border-bone/10 px-8 py-2 font-title tracking-[0.2em] text-bone-dim hover:text-bone"
        onClick={() => go('menu')}
      >
        ← VOLTAR
      </button>
      {open !== null && <PaperModal index={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
