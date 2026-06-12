// ============================================================
// LUZ FRACA — GameScreen.jsx : o jogo em si.
// Canvas 3D + input + HUD + overlays de pausa/morte/vitória.
// ============================================================
import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useUI, gameRef } from '../store/ui.js';
import { tickGame, toggleLantern, playerInteract, useConsumable } from '../game/sim.js';
import { Atmosphere, Floor, Ceiling, Walls, Water, Grass, ExitDoor, Hides, Snowfall, LighthouseBeam } from '../three/LevelMesh.jsx';
import PropsLayer from '../three/Props.jsx';
import MonstersLayer from '../three/Monsters.jsx';
import { Coins, Batteries, Paper } from '../three/Pickups.jsx';
import PlayerRig from '../three/PlayerRig.jsx';
import Effects from '../three/Effects.jsx';
import HUD from '../hud/HUD.jsx';
import { DeathScreen, WinScreen, FinalScreen, PauseMenu } from '../hud/Overlays.jsx';

function SimDriver({ G }) {
  useFrame((_, dt) => {
    if (G.running) tickGame(G, Math.min(0.05, dt));
  });
  return null;
}

export default function GameScreen() {
  const G = gameRef.current;
  const canvasWrap = useRef();
  const togglePause = useUI(s => s.togglePause);

  // teclado + mouse
  useEffect(() => {
    if (!G) return;
    const down = (e) => {
      G.input.keys[e.code] = true;
      if (G.running && !G.paused && !G.player.dead) {
        if (e.code === 'KeyF') toggleLantern(G);
        if (e.code === 'KeyE') playerInteract(G);
        if (e.code === 'Digit1') useConsumable(G, 0);
        if (e.code === 'Digit2') useConsumable(G, 1);
        if (e.code === 'Digit3') useConsumable(G, 2);
      }
      if (e.code === 'Escape') togglePause();
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    };
    const up = (e) => { G.input.keys[e.code] = false; };
    const move = (e) => {
      if (document.pointerLockElement) {
        G.input.mouseDX += e.movementX;
        G.input.mouseDY += e.movementY;
      }
    };
    const mdown = (e) => { if (e.button === 2) G.input.mouseRight = true; };
    const mup = (e) => { if (e.button === 2) G.input.mouseRight = false; };
    const ctx = (e) => e.preventDefault();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', mdown);
    window.addEventListener('mouseup', mup);
    window.addEventListener('contextmenu', ctx);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', mdown);
      window.removeEventListener('mouseup', mup);
      window.removeEventListener('contextmenu', ctx);
    };
  }, [G, togglePause]);

  if (!G) return null;

  const requestLock = () => {
    if (G.running && !G.paused && !G.player.dead) {
      canvasWrap.current?.querySelector('canvas')?.requestPointerLock();
    }
  };

  return (
    <div className="relative h-full w-full bg-black" ref={canvasWrap} onClick={requestLock}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 72, near: 0.05, far: 90, position: [G.map.spawn.x, 1.62, G.map.spawn.y] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <SimDriver G={G} />
        <Atmosphere G={G} />
        <Floor G={G} />
        <Ceiling G={G} />
        <Walls G={G} />
        <Water G={G} />
        <Grass G={G} />
        <ExitDoor G={G} />
        <Hides G={G} />
        <Snowfall G={G} />
        <LighthouseBeam G={G} />
        <PropsLayer G={G} />
        <MonstersLayer G={G} />
        <Coins G={G} />
        <Batteries G={G} />
        <Paper G={G} />
        <PlayerRig G={G} />
        <Effects G={G} />
      </Canvas>
      <HUD />
      <PauseMenu />
      <DeathScreen />
      <WinScreen />
      <FinalScreen />
    </div>
  );
}
