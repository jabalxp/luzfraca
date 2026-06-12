import { useReducer } from 'react';
import { useUI } from '../store/ui.js';
import { SAVE, saveGame, resetSave } from '../game/save.js';
import { AudioSys } from '../game/audio.js';

const SLIDERS = [
  ['volMaster', 'Volume Geral', 0, 100],
  ['volMusic', 'Volume da Música', 0, 100],
  ['volFx', 'Volume dos Efeitos', 0, 100],
  ['volScare', 'Volume dos Sustos', 0, 100],
  ['brightness', 'Brilho', 50, 150],
  ['sensitivity', 'Sensibilidade do mouse', 20, 200],
];

const CHECKS = [
  ['invertY', 'Inverter eixo Y'],
  ['colorblind', 'Modo Daltonismo (formas distintas)'],
  ['captions', 'Legendas de som'],
];

export default function SettingsScreen() {
  const go = useUI(s => s.go);
  const bumpSave = useUI(s => s.bumpSave);
  const [, force] = useReducer(x => x + 1, 0);
  const s = SAVE.settings;
  return (
    <div className="menu-grain relative flex h-full flex-col items-center overflow-y-auto bg-void p-8">
      <div className="vignette-overlay" />
      <h2 className="relative z-10 mb-8 font-title text-4xl tracking-[0.3em] text-bone">CONFIGURAÇÕES</h2>
      <div className="relative z-10 flex w-full max-w-md flex-col gap-4">
        {SLIDERS.map(([key, label, min, max]) => (
          <label key={key} className="flex items-center justify-between gap-3 font-ui text-bone-dim">
            <span className="w-48">{label}</span>
            <input
              type="range" min={min} max={max} value={s[key]}
              className="flex-1"
              onChange={e => { s[key] = +e.target.value; saveGame(); AudioSys.applyVolumes(); force(); }}
            />
            <span className="w-10 text-right font-paper text-sm">{s[key]}</span>
          </label>
        ))}
        {CHECKS.map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center justify-between font-ui text-bone-dim">
            <span>{label}</span>
            <input
              type="checkbox" checked={s[key]}
              onChange={e => { s[key] = e.target.checked; saveGame(); force(); }}
            />
          </label>
        ))}
        <p className="mt-2 font-ui text-sm italic text-bone-dim/60">
          Ajuste o brilho até o símbolo da esquerda ficar quase invisível:
        </p>
        <div className="flex justify-center gap-16 text-2xl" style={{ filter: `brightness(${s.brightness}%)` }}>
          <span style={{ color: '#0a0a0a' }}>◆</span>
          <span style={{ color: '#2a2a2a' }}>◆</span>
          <span style={{ color: '#555' }}>◆</span>
        </div>
        <button
          className="mt-6 border border-blood/60 py-2 font-title tracking-[0.2em] text-blood-bright hover:bg-blood/20"
          onClick={() => {
            if (confirm('Apagar TODO o progresso? (moedas, papéis, fases, mortes)')) {
              resetSave();
              bumpSave();
              go('menu');
            }
          }}
        >
          APAGAR SAVE
        </button>
      </div>
      <button
        className="relative z-10 mt-8 border border-bone/10 px-8 py-2 font-title tracking-[0.2em] text-bone-dim hover:text-bone"
        onClick={() => go('menu')}
      >
        ← VOLTAR
      </button>
    </div>
  );
}
