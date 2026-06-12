// ============================================================
// LUZ FRACA — HUD.jsx : legendas, prompt, slots, barras,
// minimapa a carvão, bússola da lore e overlays diegéticos.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { useUI, gameRef } from '../store/ui.js';
import { SAVE } from '../game/save.js';
import { SHOP_CONS } from '../game/data.js';
import { TILE, MAP_W, MAP_H } from '../game/mapgen.js';

// lê valores da simulação num intervalo curto (sem re-render por frame)
function useSimPoll(read, ms = 140) {
  const [v, setV] = useState(() => {
    const G = gameRef.current;
    return G ? read(G) : null;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const G = gameRef.current;
      if (G) setV(read(G));
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

function Bars() {
  const s = useSimPoll(G => ({
    battery: G.player.battery,
    stamina: G.player.stamina,
    hidden: G.player.hidden,
    breath: G.player.breathLeft / G.player.breathMax(),
    holding: G.player.holdingBreath,
  }));
  if (!s) return null;
  return (
    <div className="absolute bottom-5 left-5 flex flex-col gap-1.5 opacity-70">
      <div className="flex items-center gap-2">
        <span className="w-4 text-xs">🔦</span>
        <div className="h-1 w-28 bg-white/10">
          <div className={`h-full ${s.battery < 0.25 ? 'bg-blood-bright' : 'bg-amber-weak/80'}`} style={{ width: `${s.battery * 100}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 text-xs">🫁</span>
        <div className="h-1 w-28 bg-white/10">
          <div className="h-full bg-bone/60" style={{ width: `${(s.hidden ? s.breath : s.stamina) * 100}%` }} />
        </div>
      </div>
      {s.holding && <div className="font-paper text-[10px] text-bone-dim">prendendo a respiração…</div>}
    </div>
  );
}

function Minimap() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    const id = setInterval(() => {
      const G = gameRef.current;
      if (!G) return;
      const show = SAVE.perm.map && !G.level.noMap && !G.anyChasing;
      cv.style.display = show ? 'block' : 'none';
      if (!show) return;
      cx.fillStyle = 'rgba(8,8,6,0.85)';
      cx.fillRect(0, 0, 150, 150);
      const sc = 150 / MAP_W;
      cx.fillStyle = 'rgba(190,180,150,0.55)';
      for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
        const v = G.map.t[y * MAP_W + x];
        if (v === TILE.WALL || v === TILE.WALL2) cx.fillRect(x * sc, y * sc, sc, sc);
      }
      // jogador
      const p = G.player;
      cx.fillStyle = '#c95a2c';
      cx.beginPath();
      cx.arc(p.x * sc, p.y * sc, 3, 0, 7);
      cx.fill();
      cx.strokeStyle = '#c95a2c';
      cx.beginPath();
      cx.moveTo(p.x * sc, p.y * sc);
      cx.lineTo(p.x * sc + Math.cos(p.angle) * 8, p.y * sc + Math.sin(p.angle) * 8);
      cx.stroke();
    }, 300);
    return () => clearInterval(id);
  }, []);
  return (
    <canvas ref={ref} width={150} height={150} className="absolute right-5 top-5 border border-bone/15" style={{ display: 'none' }} />
  );
}

function Compass() {
  const data = useSimPoll(G => {
    if (G.compassTimer <= 0) return null;
    const a = Math.atan2(G.map.paper.y - G.player.y, G.map.paper.x - G.player.x) - G.player.angle;
    return a;
  }, 80);
  if (data === null || data === undefined) return null;
  return (
    <div className="absolute left-1/2 top-[20%] -translate-x-1/2">
      <div className="text-4xl text-sky-300/80 drop-shadow-[0_0_12px_rgba(140,190,255,0.8)]"
        style={{ transform: `rotate(${data + Math.PI / 2}rad)` }}>↑</div>
    </div>
  );
}

// overlay do esconderijo: frestas
function HiddenOverlay() {
  const hidden = useSimPoll(G => G.player.hidden);
  if (!hidden) return null;
  return (
    <div className="pointer-events-none absolute inset-0"
      style={{
        background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.96) 0px, rgba(0,0,0,0.96) 60px, rgba(0,0,0,0.45) 64px, rgba(0,0,0,0.45) 86px, rgba(0,0,0,0.96) 90px)',
      }} />
  );
}

function WellOverlay() {
  const v = useSimPoll(G => G.wellDescending);
  if (!v || v <= 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/70 pb-24">
      <div className="font-paper text-sm text-bone-dim">descendo… {Math.ceil(v)}s</div>
    </div>
  );
}

function GodTint() {
  const ex = useSimPoll(G => G.inGodHall && G.godExhaling);
  if (!ex) return null;
  return <div className="pointer-events-none absolute inset-0 bg-blood/15" />;
}

function DeathFlash() {
  const dead = useSimPoll(G => G.player.dead && G.phase === 'dead', 60);
  if (!dead) return null;
  return <div className="pointer-events-none absolute inset-0 animate-pulse bg-blood/25" />;
}

export default function HUD() {
  const captions = useUI(s => s.captions);
  const prompt = useUI(s => s.prompt);
  const hudMessage = useUI(s => s.hudMessage);
  const hudCoins = useUI(s => s.hudCoins);
  const petals = useUI(s => s.petals);
  const slots = useUI(s => s.slots);
  const vhsFlash = useUI(s => s.vhsFlash);
  const [vhsVisible, setVhsVisible] = useState(false);

  useEffect(() => {
    if (vhsFlash > 0) {
      setVhsVisible(true);
      const t = setTimeout(() => setVhsVisible(false), 90);
      return () => clearTimeout(t);
    }
  }, [vhsFlash]);

  const G = gameRef.current;
  const showPetals = G && G.level.monsters.includes('dama') && petals >= 0;

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <HiddenOverlay />
      <WellOverlay />
      <GodTint />
      <DeathFlash />
      {vhsVisible && (
        <div className="absolute inset-0 opacity-40"
          style={{ background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 2px, transparent 2px 5px)' }} />
      )}

      {/* legendas de som */}
      <div className="absolute bottom-24 left-1/2 flex w-full max-w-xl -translate-x-1/2 flex-col items-center gap-1">
        {captions.map(c => (
          <div key={c.id} className="font-paper text-sm text-bone-dim/90 drop-shadow-[0_1px_2px_#000]">{c.txt}</div>
        ))}
      </div>

      {/* prompt contextual */}
      {prompt && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 border border-bone/20 bg-black/60 px-4 py-1.5 font-paper text-sm text-bone">
          {prompt}
        </div>
      )}

      {/* mensagem central (ENCONTRE A SAÍDA) */}
      {hudMessage && (
        <div className="hud-message absolute left-1/2 top-[30%] -translate-x-1/2 font-title text-4xl tracking-[0.3em] text-blood-bright drop-shadow-[0_0_18px_rgba(179,38,38,0.7)]">
          {hudMessage}
        </div>
      )}

      {/* contador de moedas */}
      {hudCoins && Date.now() - hudCoins.ts < 2000 && (
        <div className="absolute right-6 top-1/4 font-paper text-lg text-amber-weak drop-shadow-[0_1px_2px_#000]">
          🪙 {hudCoins.value}
        </div>
      )}

      {/* pétalas (Dama) */}
      {showPetals && (
        <div className="absolute left-1/2 top-5 -translate-x-1/2 text-lg tracking-widest">
          {'🌸'.repeat(Math.max(0, petals))}{'·'.repeat(Math.max(0, 3 - Math.max(0, petals)))}
        </div>
      )}

      {/* slots de consumíveis */}
      <div className="absolute bottom-5 right-5 flex gap-2">
        {slots.map((id, i) => {
          const item = id ? SHOP_CONS.find(c => c.id === id) : null;
          return (
            <div key={i} className="relative flex h-11 w-11 items-center justify-center border border-bone/15 bg-black/50 text-lg">
              {item ? <>{item.icon}<small className="absolute bottom-0 right-1 font-paper text-[9px] text-bone-dim">{SAVE.cons[id] || 0}</small></> : <span className="text-bone-dim/30">·</span>}
              <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center bg-ash font-paper text-[9px] text-bone-dim">{i + 1}</span>
            </div>
          );
        })}
      </div>

      <Bars />
      <Minimap />
      <Compass />

      {/* mira mínima */}
      <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone/25" />
    </div>
  );
}
