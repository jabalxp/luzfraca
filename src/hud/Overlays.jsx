// ============================================================
// LUZ FRACA — Overlays.jsx : pausa, morte, vitória e o final.
// ============================================================
import { useEffect, useState } from 'react';
import { useUI } from '../store/ui.js';

export function PauseMenu() {
  const paused = useUI(s => s.paused);
  const togglePause = useUI(s => s.togglePause);
  const closeGame = useUI(s => s.closeGame);
  if (!paused) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-black/80">
      <h2 className="font-title text-5xl tracking-[0.3em] text-bone">PAUSA</h2>
      <button
        className="w-72 border border-amber-weak/40 bg-coal py-3 font-title text-lg tracking-[0.25em] text-amber-weak hover:bg-ash"
        onClick={togglePause}
      >
        CONTINUAR
      </button>
      <button
        className="w-72 border border-bone/10 py-2.5 font-title text-sm tracking-[0.2em] text-bone-dim hover:text-bone"
        onClick={() => closeGame('play')}
      >
        DESISTIR (perde as moedas da run)
      </button>
    </div>
  );
}

export function DeathScreen() {
  const info = useUI(s => s.deathInfo);
  const closeGame = useUI(s => s.closeGame);
  if (!info) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/90">
      <p className="max-w-xl px-6 text-center font-title text-3xl leading-snug tracking-wider text-blood-bright">
        "{info.deathMsg}"
      </p>
      <div className="text-center font-paper text-sm leading-relaxed text-bone-dim">
        {info.monsterName} pegou você.<br />
        Moedas perdidas: {info.lost} · Moedas mantidas: {info.kept}<br />
        Mortes nesta fase: {info.deaths}
      </div>
      <button
        className="border border-bone/20 bg-coal px-10 py-3 font-title tracking-[0.25em] text-bone hover:bg-ash"
        onClick={() => closeGame('play')}
      >
        VOLTAR AO MENU
      </button>
    </div>
  );
}

export function WinScreen() {
  const info = useUI(s => s.winInfo);
  const closeGame = useUI(s => s.closeGame);
  if (!info) return null;
  const mm = Math.floor(info.time / 60), ss = String(Math.floor(info.time % 60)).padStart(2, '0');
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/90">
      <h2 className="font-title text-5xl tracking-[0.3em] text-bone">VOCÊ SOBREVIVEU</h2>
      <div className="text-center font-paper text-sm leading-relaxed text-bone-dim">
        Papel {info.id + 1} recuperado — leia no menu LORE.<br />
        Moedas: {info.runCoins} + bônus {info.bonus}{info.wasCleared ? ' (rejogada: 50%)' : ''} = <b className="text-amber-weak">+{info.earned}</b><br />
        Tempo: {mm}:{ss} · Moedas no banco: {info.bank}
      </div>
      {info.achs.length > 0 && (
        <div className="font-paper text-sm text-amber-weak">🏆 {info.achs.join(' · ')}</div>
      )}
      <button
        className="border border-bone/20 bg-coal px-10 py-3 font-title tracking-[0.25em] text-bone hover:bg-ash"
        onClick={() => closeGame('play')}
      >
        VOLTAR AO MENU
      </button>
    </div>
  );
}

export function FinalScreen() {
  const finalText = useUI(s => s.finalText);
  const closeGame = useUI(s => s.closeGame);
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!finalText) return;
    setShown(''); setDone(false);
    let i = 0;
    let id;
    const start = setTimeout(() => {
      id = setInterval(() => {
        i += 2;
        setShown(finalText.slice(0, i));
        if (i > finalText.length) { clearInterval(id); setDone(true); }
      }, 38);
    }, 1200);
    return () => { clearTimeout(start); clearInterval(id); };
  }, [finalText]);
  if (!finalText) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black">
      <pre className="max-h-[75vh] overflow-y-auto whitespace-pre-wrap px-6 text-center font-paper text-sm leading-relaxed text-bone">
        {shown}
      </pre>
      {done && (
        <button
          className="border border-amber-weak/40 bg-coal px-10 py-3 font-title tracking-[0.25em] text-amber-weak hover:bg-ash"
          onClick={() => closeGame('menu')}
        >
          DEIXAR O MUNDO DORMIR
        </button>
      )}
    </div>
  );
}
