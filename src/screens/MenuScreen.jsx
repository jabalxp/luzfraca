import { useEffect, useRef } from 'react';
import { useUI } from '../store/ui.js';
import { SAVE, papersCount } from '../game/save.js';

// fundo: facho de lanterna trêmulo varrendo uma parede úmida (canvas 2D leve)
function MenuBackdrop() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const cx = cv.getContext('2d');
    let raf, t = 0;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const loop = () => {
      t += 0.016;
      cx.fillStyle = '#030302';
      cx.fillRect(0, 0, cv.width, cv.height);
      const fx = cv.width / 2 + Math.sin(t * 0.5) * 50;
      const fy = cv.height * 0.36 + Math.cos(t * 0.7) * 24;
      const flick = 0.85 + Math.random() * 0.15;
      const gr = cx.createRadialGradient(fx, fy, 30, fx, fy, cv.width * 0.34);
      gr.addColorStop(0, `rgba(225,205,150,${0.14 * flick})`);
      gr.addColorStop(0.6, `rgba(160,140,90,${0.05 * flick})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = gr;
      cx.fillRect(0, 0, cv.width, cv.height);
      cx.fillStyle = 'rgba(28,24,16,0.3)';
      for (let i = 0; i < 9; i++) {
        cx.beginPath();
        cx.ellipse((i * 211) % cv.width, (i * 137) % cv.height, 60 + i * 12, 30 + i * 8, i, 0, 7);
        cx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0" />;
}

export default function MenuScreen() {
  const go = useUI(s => s.go);
  useUI(s => s.saveVersion);
  return (
    <div className="menu-grain relative h-full">
      <MenuBackdrop />
      <div className="vignette-overlay" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
        <h1 className="animate-flicker mb-12 font-title text-7xl tracking-[0.3em] text-bone drop-shadow-[0_0_24px_rgba(201,168,106,0.25)] md:text-8xl">
          LUZ FRACA
        </h1>
        <div className="flex flex-col items-center gap-4">
          {[['JOGAR', 'play'], ['LORE', 'lore'], ['CONFIGURAÇÕES', 'settings'], ['LOJA', 'shop']].map(([label, dest]) => (
            <button
              key={dest}
              className="w-72 border border-bone/10 bg-black/40 py-3 font-title text-xl tracking-[0.3em] text-bone-dim transition-all hover:border-amber-weak/50 hover:text-amber-weak"
              onClick={() => go(dest)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-12 flex gap-10 font-paper text-sm text-bone-dim">
          <span>🪙 {SAVE.coins}</span>
          <span>📜 {papersCount()}/10</span>
        </div>
        {SAVE.finished && (
          <div className="animate-slowpulse mt-4 font-title text-sm tracking-[0.3em] text-blood-bright">
            ☠ MODO PESADELO DISPONÍVEL
          </div>
        )}
      </div>
    </div>
  );
}
