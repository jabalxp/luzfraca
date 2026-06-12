import { useUI } from '../store/ui.js';
import { AudioSys } from '../game/audio.js';

export default function IntroScreen() {
  const go = useUI(s => s.go);
  return (
    <div className="menu-grain relative flex h-full flex-col items-center justify-center gap-8 bg-void">
      <div className="vignette-overlay" />
      <p className="font-title text-3xl tracking-[0.35em] text-bone md:text-5xl">JOGUE COM FONES.</p>
      <p className="font-ui text-lg italic text-bone-dim">
        Eles ouvem você. É justo que você os ouça também.
      </p>
      <button
        className="animate-flicker mt-10 border border-amber-weak/40 bg-coal px-10 py-4 font-title text-xl tracking-[0.25em] text-amber-weak transition-colors hover:bg-ash hover:text-bone"
        onClick={() => { AudioSys.init(); AudioSys.uiClick(); go('menu'); }}
      >
        ACENDER A LANTERNA
      </button>
    </div>
  );
}
