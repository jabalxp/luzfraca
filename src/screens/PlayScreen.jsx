import { useUI } from '../store/ui.js';
import { LEVELS, ACHIEVEMENTS } from '../game/data.js';
import { SAVE, unlockedUpTo } from '../game/save.js';

function Stars({ n }) {
  const full = Math.floor(n);
  return (
    <span className="text-amber-weak/90">
      {'★'.repeat(full)}{n % 1 ? '+' : ''}{'☆'.repeat(Math.max(0, 5 - Math.ceil(n)))}
    </span>
  );
}

function PhaseCard({ lv, unlocked }) {
  const openPrep = useUI(s => s.openPrep);
  if (!unlocked) {
    return (
      <div className="flex h-48 flex-col items-center justify-center border border-bone/5 bg-coal/70 text-bone-dim/40">
        <div className="text-3xl">🔒</div>
        <div className="mt-2 font-ui text-sm italic">Sobreviva à fase anterior</div>
      </div>
    );
  }
  const d = SAVE.deaths[lv.id];
  const bt = SAVE.bestTimes[lv.id];
  const btTxt = bt ? `${Math.floor(bt / 60)}:${String(Math.floor(bt % 60)).padStart(2, '0')}` : '—';
  let tally = '';
  for (let k = 0; k < Math.min(d, 25); k++) tally += '❘' + ((k + 1) % 5 === 0 ? ' ' : '');
  return (
    <button
      className="group relative flex h-48 flex-col border border-bone/10 bg-coal/80 p-3 text-left transition-all hover:border-amber-weak/40 hover:bg-ash"
      onClick={() => openPrep(lv.id)}
    >
      <div
        className="h-14 w-full opacity-70 transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(120deg, ${lv.palette.wall}, ${lv.palette.floor})` }}
      />
      <div className="mt-2 font-paper text-[10px] text-bone-dim">FASE {lv.id + 1}</div>
      <div className="font-title text-base leading-tight tracking-wider text-bone">{lv.name}</div>
      <div className="text-xs"><Stars n={lv.stars} /></div>
      <div className="mt-auto font-paper text-[10px] text-bone-dim">
        Mortes: {d === 0 ? '0' : `${d} ${tally.trim()}`} · melhor: {btTxt}
      </div>
      {SAVE.papers[lv.id] && (
        <div className="absolute right-2 top-2 rotate-6 border border-amber-weak/40 bg-black/60 px-1.5 py-0.5 font-paper text-[9px] text-amber-weak">
          PAPEL<br />ENCONTRADO
        </div>
      )}
    </button>
  );
}

export default function PlayScreen() {
  const go = useUI(s => s.go);
  useUI(s => s.saveVersion);
  const maxUnlocked = unlockedUpTo();
  return (
    <div className="menu-grain relative flex h-full flex-col overflow-y-auto bg-void p-8">
      <div className="vignette-overlay" />
      <h2 className="relative z-10 mb-6 text-center font-title text-4xl tracking-[0.3em] text-bone">
        ESCOLHA SEU PESADELO
      </h2>
      <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-5">
        {LEVELS.map(lv => <PhaseCard key={lv.id} lv={lv} unlocked={lv.id <= maxUnlocked} />)}
      </div>
      <div className="relative z-10 mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-3">
        {ACHIEVEMENTS.map(a => (
          <div
            key={a.id}
            title={a.desc}
            className={`font-paper text-[11px] ${SAVE.ach[a.id] ? 'text-amber-weak' : 'text-bone-dim/40'}`}
          >
            {SAVE.ach[a.id] ? '🏆 ' : '· '}{a.name}
          </div>
        ))}
      </div>
      <button
        className="relative z-10 mx-auto mt-8 border border-bone/10 px-8 py-2 font-title tracking-[0.2em] text-bone-dim hover:text-bone"
        onClick={() => go('menu')}
      >
        ← VOLTAR
      </button>
    </div>
  );
}
