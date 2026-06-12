// ============================================================
// LUZ FRACA — Monsters.jsx : criaturas humanoides procedurais.
// Proporções humanas, postura errada, animação de marcha,
// cabeça que vira para você e tiques nervosos. O horror está
// nos 10% que não são humanos.
// ============================================================
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Glow } from './LevelMesh.jsx';
import { textTexture } from './textures.js';
import { TILE } from '../game/mapgen.js';
import { wallHeight } from './LevelMesh.jsx';

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });

// ---------- corpo humanoide base ----------
// cfg: { skin, cloth, height, armLen, legLen, bulk, headScale, eyes, eyeColor, hunch }
function useHumanoidParts(cfg) {
  return useMemo(() => {
    const skin = mat(cfg.skin);
    const cloth = mat(cfg.cloth || cfg.skin);
    const eye = new THREE.MeshStandardMaterial({
      color: cfg.eyeColor || '#000000',
      emissive: cfg.eyeColor || '#000000',
      emissiveIntensity: cfg.eyes === 'glow' ? 2.2 : 0,
      roughness: 0.3,
    });
    return { skin, cloth, eye };
  }, [cfg]);
}

function Humanoid({ cfg, refs }) {
  const { skin, cloth, eye } = useHumanoidParts(cfg);
  const H = cfg.height ?? 1.85;
  const legL = (cfg.legLen ?? 0.48) * H;
  const torsoL = 0.34 * H;
  const headR = 0.075 * H * (cfg.headScale ?? 1);
  const armL = (cfg.armLen ?? 0.42) * H;
  const bulk = cfg.bulk ?? 1;
  const hipY = legL;
  const shoulderY = hipY + torsoL;

  return (
    <group ref={refs.body}>
      {/* pernas (pivot no quadril) */}
      <group ref={refs.legL} position={[-0.09 * bulk, hipY, 0]}>
        <mesh position={[0, -legL / 2, 0]} castShadow material={cloth}>
          <capsuleGeometry args={[0.055 * bulk, legL - 0.12, 4, 8]} />
        </mesh>
      </group>
      <group ref={refs.legR} position={[0.09 * bulk, hipY, 0]}>
        <mesh position={[0, -legL / 2, 0]} castShadow material={cloth}>
          <capsuleGeometry args={[0.055 * bulk, legL - 0.12, 4, 8]} />
        </mesh>
      </group>
      {/* tronco (pivot no quadril, inclina para a frente) */}
      <group ref={refs.torso} position={[0, hipY, 0]} rotation-x={cfg.hunch ?? 0.08}>
        <mesh position={[0, torsoL / 2, 0]} castShadow material={cloth}>
          <capsuleGeometry args={[0.13 * bulk, torsoL - 0.2, 4, 10]} />
        </mesh>
        {cfg.vest && (
          <mesh position={[0, torsoL * 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.145 * bulk, torsoL * 0.5, 4, 10]} />
            <meshStandardMaterial color={cfg.vest} roughness={0.9} />
          </mesh>
        )}
        {cfg.backNumber && (
          <mesh position={[0, torsoL * 0.55, -0.135 * bulk - 0.012]} rotation-y={Math.PI}>
            <planeGeometry args={[0.22, 0.26]} />
            <meshBasicMaterial map={cfg.backNumber} transparent opacity={0.9} />
          </mesh>
        )}
        {/* braços (pivot no ombro) */}
        <group ref={refs.armL} position={[-0.16 * bulk, torsoL - 0.05, 0]}>
          <mesh position={[0, -armL / 2, 0]} castShadow material={skin}>
            <capsuleGeometry args={[0.042 * bulk, armL - 0.1, 4, 8]} />
          </mesh>
          {/* mãos compridas */}
          <mesh position={[0, -armL - 0.04, 0]} castShadow material={skin}>
            <boxGeometry args={[0.05, 0.14, 0.03]} />
          </mesh>
        </group>
        <group ref={refs.armR} position={[0.16 * bulk, torsoL - 0.05, 0]}>
          <mesh position={[0, -armL / 2, 0]} castShadow material={skin}>
            <capsuleGeometry args={[0.042 * bulk, armL - 0.1, 4, 8]} />
          </mesh>
          <mesh position={[0, -armL - 0.04, 0]} castShadow material={skin}>
            <boxGeometry args={[0.05, 0.14, 0.03]} />
          </mesh>
        </group>
        {/* cabeça (pivot no pescoço) */}
        <group ref={refs.head} position={[0, torsoL + 0.02, 0]}>
          {!cfg.noHead && (
            <mesh position={[0, headR, 0]} castShadow material={skin}>
              <sphereGeometry args={[headR, 12, 10]} />
            </mesh>
          )}
          {cfg.hair && (
            <mesh position={[0, headR * 0.6, -headR * 0.5]} castShadow>
              <boxGeometry args={[headR * 2.1, headR * 3.4, headR * 1.1]} />
              <meshStandardMaterial color={cfg.hair} roughness={1} />
            </mesh>
          )}
          {cfg.hood && (
            <mesh position={[0, headR * 0.9, 0]} castShadow material={cloth}>
              <coneGeometry args={[headR * 1.7, headR * 3.2, 8]} />
            </mesh>
          )}
          {cfg.helmet && (
            <>
              <mesh position={[0, headR, 0]} castShadow>
                <sphereGeometry args={[headR * 1.5, 12, 10]} />
                <meshStandardMaterial color="#c8c8c4" roughness={0.4} />
              </mesh>
              <mesh position={[0, headR, headR * 1.1]}>
                <sphereGeometry args={[headR * 0.9, 10, 8]} />
                <meshStandardMaterial color="#0a0c10" roughness={0.1} metalness={0.6} />
              </mesh>
            </>
          )}
          {cfg.veil && (
            <mesh position={[0, headR * 0.4, 0]} castShadow material={cloth}>
              <coneGeometry args={[headR * 1.6, headR * 4.5, 10, 1, true]} />
            </mesh>
          )}
          {cfg.snout && (
            <mesh position={[0, headR * 0.8, headR * 0.95]} rotation-x={Math.PI / 2} castShadow material={skin}>
              <coneGeometry args={[headR * 0.5, headR * 1.6, 8]} />
            </mesh>
          )}
          {cfg.hat && (
            <mesh position={[0, headR * 2.1, 0]} castShadow>
              <coneGeometry args={[headR * 2.2, headR * 1.8, 9]} />
              <meshStandardMaterial color="#241a0e" roughness={1} />
            </mesh>
          )}
          {/* olhos */}
          {cfg.eyes && cfg.eyes !== 'none' && !cfg.helmet && (
            <>
              <mesh position={[-headR * 0.38, headR * 1.1, headR * 0.82]} material={eye}>
                <sphereGeometry args={[headR * (cfg.eyes === 'voids' ? 0.22 : 0.13), 6, 5]} />
              </mesh>
              <mesh position={[headR * 0.38, headR * 1.1, headR * 0.82]} material={eye}>
                <sphereGeometry args={[headR * (cfg.eyes === 'voids' ? 0.22 : 0.13), 6, 5]} />
              </mesh>
            </>
          )}
          {cfg.eyes === 'sewn' && (
            <>
              <mesh position={[-headR * 0.38, headR * 1.1, headR * 0.95]} rotation-z={0.3}>
                <boxGeometry args={[headR * 0.5, headR * 0.06, headR * 0.02]} />
                <meshStandardMaterial color="#4a1212" />
              </mesh>
              <mesh position={[headR * 0.38, headR * 1.1, headR * 0.95]} rotation-z={-0.3}>
                <boxGeometry args={[headR * 0.5, headR * 0.06, headR * 0.02]} />
                <meshStandardMaterial color="#4a1212" />
              </mesh>
            </>
          )}
        </group>
        {cfg.skirt && (
          <mesh position={[0, -0.02, 0]} castShadow material={cloth}>
            <coneGeometry args={[0.34 * bulk, legL * 1.05, 12, 1, true]} />
          </mesh>
        )}
        {cfg.wings && (
          <>
            <mesh position={[-0.45, torsoL * 0.7, -0.1]} rotation={[0.2, 0.4, 0.9]} castShadow material={cloth}>
              <coneGeometry args={[0.5, 1.3, 4]} />
            </mesh>
            <mesh position={[0.45, torsoL * 0.7, -0.1]} rotation={[0.2, -0.4, -0.9]} castShadow material={cloth}>
              <coneGeometry args={[0.5, 1.3, 4]} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

// configuração visual por shape
function shapeConfig(key, def) {
  switch (key) {
    case 'jogador12': return { skin: '#cfc8b8', cloth: '#d8d8d0', height: 1.95, eyes: 'voids', eyeColor: '#050505', hunch: 0.22, armLen: 0.46, number: true };
    case 'repositor': return { skin: '#9aa0a4', cloth: '#3c4248', vest: '#2855a0', height: 2.05, armLen: 0.55, eyes: 'glow', eyeColor: '#7ab0e8', hunch: 0.3 };
    case 'errante': return { skin: '#b0a050', cloth: '#988a42', height: 1.8, eyes: 'none', hunch: 0.35, bulk: 1.2, melted: true };
    case 'chorona': return { skin: '#cfd4da', cloth: '#e8ecf0', height: 1.78, eyes: 'none', veil: true, skirt: true, float: true, handsToFace: true };
    case 'impundulu': return { skin: '#14141c', cloth: '#1a1a22', height: 1.9, eyes: 'glow', eyeColor: '#cc3333', wings: true, hunch: 0.4, fly: true };
    case 'adze': return { skin: '#c97b2c', cloth: '#8a5018', height: 1.45, eyes: 'glow', eyeColor: '#e8a050', hunch: 0.5, bulk: 0.8, firefly: true };
    case 'luison': return { skin: '#6a6258', cloth: '#4a4238', height: 1.85, eyes: 'glow', eyeColor: '#c8b040', snout: true, hunch: 0.55, allFours: true };
    case 'pombero': return { skin: '#3a2c16', cloth: '#4a3a22', height: 1.25, eyes: 'glow', eyeColor: '#caa84a', hat: true, bulk: 1.3, hunch: 0.2 };
    case 'astronauta': return { skin: '#d8d8d4', cloth: '#c8c8c4', height: 1.95, helmet: true, bulk: 1.5, hunch: 0.05, slow: true };
    case 'dama': return { skin: '#e8e4dc', cloth: '#ece8e0', height: 2.1, eyes: 'voids', eyeColor: '#0a0a0a', hair: '#0c0c0c', skirt: true, hunch: -0.05 };
    case 'monge': return { skin: '#0a0806', cloth: '#3a3228', height: 1.8, eyes: 'none', hood: true, noHead: false, skirt: true, hunch: 0.15, backward: true };
    case 'faroleiro': return { skin: '#8a8468', cloth: '#6a6428', height: 1.9, eyes: 'glow', eyeColor: '#d4c040', hood: true, hunch: 0.3 };
    case 'sereia': return { skin: '#3a6a5a', cloth: '#2c5446', height: 1.7, eyes: 'glow', eyeColor: '#6aa890', hair: '#16241e', inWater: true };
    case 'afogado': return { skin: '#4a5a52', cloth: '#3a4a42', height: 1.75, eyes: 'voids', eyeColor: '#0c1410', bulk: 1.35, hunch: 0.4, stagger: true };
    case 'profeta': return { skin: '#c8bca8', cloth: '#f0ece4', height: 2.0, eyes: 'sewn', skirt: true, hunch: -0.08, armsWide: true };
    case 'fiel': return { skin: '#6a6052', cloth: '#5a5244', height: 1.7, eyes: 'none', hood: true, skirt: true, kneel: true };
    default: return { skin: def.color, cloth: def.accent, height: 1.8, eyes: 'glow', eyeColor: def.accent };
  }
}

// ---------- monstro genérico ----------
function MonsterUnit({ G, mo }) {
  const cfg = useMemo(() => {
    const c = shapeConfig(mo.key, mo.def);
    if (c.number) {
      c.backNumber = textTexture(['12'], { w: 64, h: 80, color: '#7a1818', bg: 'transparent', font: 'bold 56px serif' });
    }
    return c;
  }, [mo]);
  const root = useRef();
  const refs = {
    body: useRef(), torso: useRef(), head: useRef(),
    armL: useRef(), armR: useRef(), legL: useRef(), legR: useRef(),
  };
  const anim = useRef({ phase: 0, lastX: mo.x, lastY: mo.y, twitch: 0, twitchT: 0, headYaw: 0, headPitch: 0 });

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const a = anim.current;
    const p = G.player;
    const t = state.clock.elapsedTime;

    // posição/rotação a partir da simulação
    const moved = Math.hypot(mo.x - a.lastX, mo.y - a.lastY);
    a.lastX = mo.x; a.lastY = mo.y;
    const speed = moved / Math.max(dt, 1e-4);
    a.phase += Math.min(speed, 10) * dt * 2.4;

    let yBase = 0;
    if (cfg.fly && !mo.perched && mo.state !== 'chase') yBase = 2.2 + Math.sin(t * 1.7) * 0.3;
    else if (cfg.fly && mo.state === 'chase') yBase = 0.9;
    if (cfg.float) yBase = 0.06 + Math.sin(t * 1.1) * 0.04;
    if (cfg.inWater) yBase = G.tileAt(mo.x, mo.y) === TILE.WATER ? -0.85 : -0.2;
    g.position.set(mo.x, yBase, mo.y);
    g.rotation.y = Math.PI / 2 - mo.dir + (cfg.backward ? Math.PI : 0);

    const chasing = mo.state === 'chase';
    const sw = Math.sin(a.phase);
    const amp = Math.min(0.65, 0.12 + speed * 0.07);

    // marcha
    if (refs.legL.current) {
      refs.legL.current.rotation.x = sw * amp;
      refs.legR.current.rotation.x = -sw * amp;
    }
    if (refs.armL.current) {
      if (cfg.handsToFace) {
        refs.armL.current.rotation.x = -2.4; refs.armR.current.rotation.x = -2.4;
        refs.armL.current.rotation.z = 0.5; refs.armR.current.rotation.z = -0.5;
      } else if (cfg.kneel && !chasing) {
        refs.armL.current.rotation.x = -1.2; refs.armR.current.rotation.x = -1.2;
      } else if (cfg.armsWide) {
        refs.armL.current.rotation.z = 1.2 + sw * 0.05;
        refs.armR.current.rotation.z = -1.2 - sw * 0.05;
      } else if (chasing) {
        // braços esticados para a frente — vem te pegar
        refs.armL.current.rotation.x = -1.5 + sw * 0.15;
        refs.armR.current.rotation.x = -1.5 - sw * 0.15;
      } else {
        refs.armL.current.rotation.x = -sw * amp * 0.8;
        refs.armR.current.rotation.x = sw * amp * 0.8;
        refs.armL.current.rotation.z = 0.06;
        refs.armR.current.rotation.z = -0.06;
      }
    }
    // postura
    if (refs.torso.current) {
      let lean = (cfg.hunch ?? 0.08) + (chasing ? 0.3 : 0) + Math.sin(t * 0.8) * 0.02;
      if (cfg.allFours && chasing) lean = 1.1;
      if (cfg.kneel && !chasing) {
        refs.torso.current.position.y = (cfg.legLen ?? 0.48) * (cfg.height ?? 1.8) * 0.4;
        lean = 0.5;
      }
      refs.torso.current.rotation.x = lean;
      // respiração errada
      const breathe = 1 + Math.sin(t * (chasing ? 6 : 2.2)) * 0.025;
      refs.torso.current.scale.set(breathe, 1, breathe);
    }
    // cabeça encara o jogador quando perto (mesmo de costas — pior ainda)
    if (refs.head.current) {
      const d = mo.distPlayer();
      const want = d < 14;
      const angTo = Math.atan2(p.y - mo.y, p.x - mo.x);
      let rel = ((Math.PI / 2 - angTo) - g.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      rel = Math.max(-1.4, Math.min(1.4, rel));
      a.headYaw += ((want ? rel : 0) - a.headYaw) * Math.min(1, dt * 3);
      // tique nervoso
      a.twitchT -= dt;
      if (a.twitchT <= 0) {
        a.twitchT = chasing ? 0.12 + Math.random() * 0.2 : 0.8 + Math.random() * 2.4;
        a.twitch = (Math.random() - 0.5) * (chasing ? 0.5 : 0.22);
      }
      refs.head.current.rotation.y = a.headYaw + a.twitch;
      refs.head.current.rotation.z = Math.sin(t * 0.6 + mo.uid) * 0.06 + (chasing ? a.twitch * 0.5 : 0);
      refs.head.current.rotation.x = cfg.backward ? 0 : Math.sin(t * 0.4 + mo.uid * 2) * 0.05;
    }
    // cambaleio dos afogados
    if (cfg.stagger && refs.body.current) {
      refs.body.current.rotation.z = Math.sin(t * 1.3 + mo.uid * 3) * 0.12;
    }
    // adze vira vagalume quando não revelado
    if (cfg.firefly && refs.body.current) {
      refs.body.current.visible = mo.revealed || mo.state === 'chase';
    }
  });

  return (
    <group ref={root}>
      <Humanoid cfg={cfg} refs={refs} />
      {cfg.firefly && <FireflyGlow mo={mo} />}
      {mo.key === 'faroleiro' && (
        <group position={[0.25, 1.0, 0.15]}>
          <Glow position={[0, 0, 0]} color="#d4c040" scale={0.5} opacity={0.6} />
        </group>
      )}
      {cfg.eyes === 'glow' && !cfg.firefly && (
        <pointLight position={[0, (cfg.height ?? 1.8) * 0.86, 0.1]} color={cfg.eyeColor} intensity={0.35} distance={2.5} />
      )}
    </group>
  );
}

// vagalume do Adze (visível quando o corpo não está)
function FireflyGlow({ mo }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const hidden = !(mo.revealed || mo.state === 'chase');
    ref.current.visible = hidden;
    const t = clock.elapsedTime;
    ref.current.position.set(Math.sin(t * 2.2) * 0.3, 1.1 + Math.sin(t * 3.1) * 0.25, Math.cos(t * 1.8) * 0.3);
  });
  return (
    <group ref={ref}>
      <Glow position={[0, 0, 0]} color="#e8c050" scale={0.35} opacity={0.9} />
      <pointLight color="#e8a050" intensity={0.8} distance={3} />
    </group>
  );
}

// ---------- Kara-Kasa: o guarda-chuva que não é guarda-chuva ----------
function KarakasaUnit({ G, mo }) {
  const root = useRef();
  const eye = useRef();
  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const active = mo.state === 'chase';
    g.position.set(mo.x, active ? 0.35 + Math.abs(Math.sin(state.clock.elapsedTime * 9)) * 0.35 : 0, mo.y);
    g.rotation.y = Math.PI / 2 - mo.dir;
    g.rotation.z = active ? Math.sin(state.clock.elapsedTime * 7) * 0.18 : 0;
    if (eye.current) eye.current.visible = active;
  });
  return (
    <group ref={root}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.4, 6]} />
        <meshStandardMaterial color="#241a10" roughness={1} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.75, 0.5, 12]} />
        <meshStandardMaterial color="#a02828" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <group ref={eye} visible={false}>
        <mesh position={[0, 1.18, 0.4]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#e8e0d0" emissive="#c8b890" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 1.18, 0.5]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color="#0a0604" />
        </mesh>
        {/* língua comprida */}
        <mesh position={[0, 0.9, 0.35]} rotation-x={0.5}>
          <coneGeometry args={[0.05, 0.5, 6]} />
          <meshStandardMaterial color="#7a2030" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- A Amostra: massa negra que escorre do teto ----------
function AmostraUnit({ G, mo }) {
  const root = useRef();
  const blob = useRef();
  const ceilH = wallHeight(G.level);
  useFrame(({ clock }, dt) => {
    const g = root.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const chasing = mo.state === 'chase';
    const targetY = chasing ? 0.45 : ceilH - 0.4;
    g.position.x = mo.x; g.position.z = mo.y;
    g.position.y += (targetY - g.position.y) * Math.min(1, dt * (chasing ? 6 : 1.5));
    if (blob.current) {
      blob.current.scale.set(
        1 + Math.sin(t * 3.1) * 0.18,
        1 + Math.sin(t * 4.3 + 1) * 0.25,
        1 + Math.sin(t * 2.7 + 2) * 0.18
      );
    }
  });
  return (
    <group ref={root} position={[mo.x, ceilH - 0.4, mo.y]}>
      <mesh ref={blob} castShadow>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color="#06060a" roughness={0.15} metalness={0.6} />
      </mesh>
      {/* gotas */}
      <mesh position={[0.2, -0.5, 0.1]}>
        <sphereGeometry args={[0.08, 6, 5]} />
        <meshStandardMaterial color="#06060a" roughness={0.15} metalness={0.6} />
      </mesh>
    </group>
  );
}

// ---------- O Deus Cego: presença colossal no Salão da Voz ----------
function DeusCegoUnit({ G, mo }) {
  const root = useRef();
  const head = useRef();
  useFrame(({ clock }) => {
    if (!root.current) return;
    // respiração: 12s inala (cresce devagar), 3s exala (encolhe + treme)
    const cycle = G.godPhase % 15;
    const exhaling = cycle >= 12;
    const breath = exhaling ? 1.06 - (cycle - 12) / 3 * 0.09 : 0.97 + (cycle / 12) * 0.09;
    root.current.scale.setScalar(breath);
    if (head.current) {
      head.current.rotation.z = exhaling ? Math.sin(clock.elapsedTime * 18) * 0.01 : 0;
    }
  });
  return (
    <group position={[mo.x, 0, mo.y + 3]} ref={root}>
      {/* ombros emergindo do chão */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[5.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0a0806" roughness={1} />
      </mesh>
      {/* cabeça colossal */}
      <group ref={head} position={[0, 4.6, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[2.6, 16, 13]} />
          <meshStandardMaterial color="#0c0a08" roughness={1} />
        </mesh>
        {/* pálpebras fundidas — vincos onde olhos deviam estar */}
        <mesh position={[-0.9, 0.5, 2.35]} rotation-z={0.2}>
          <boxGeometry args={[1.1, 0.1, 0.15]} />
          <meshStandardMaterial color="#1c140c" roughness={1} />
        </mesh>
        <mesh position={[0.9, 0.5, 2.35]} rotation-z={-0.2}>
          <boxGeometry args={[1.1, 0.1, 0.15]} />
          <meshStandardMaterial color="#1c140c" roughness={1} />
        </mesh>
        {/* boca entreaberta de onde vem a respiração */}
        <mesh position={[0, -0.9, 2.3]}>
          <boxGeometry args={[1.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#030201" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- silhuetas da Visão Espectral (através das paredes) ----------
function SpectralOverlay({ G }) {
  const group = useRef();
  useFrame(() => {
    if (!group.current) return;
    const on = G.spectralTimer > 0;
    group.current.visible = on;
    if (on) {
      G.monsters.forEach((mo, i) => {
        const m = group.current.children[i];
        if (m) m.position.set(mo.x, 0.95, mo.y);
      });
    }
  });
  const mt = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#cc2020', transparent: true, opacity: 0.55, depthTest: false,
  }), []);
  return (
    <group ref={group} visible={false} renderOrder={999}>
      {G.monsters.map(mo => (
        <mesh key={mo.uid} material={mt} renderOrder={999}>
          <capsuleGeometry args={[0.28, 1.2, 4, 8]} />
        </mesh>
      ))}
    </group>
  );
}

export default function MonstersLayer({ G }) {
  return (
    <>
      {G.monsters.map(mo => {
        if (mo.key === 'karakasa') return <KarakasaUnit key={mo.uid} G={G} mo={mo} />;
        if (mo.key === 'amostra') return <AmostraUnit key={mo.uid} G={G} mo={mo} />;
        if (mo.key === 'deuscego') return <DeusCegoUnit key={mo.uid} G={G} mo={mo} />;
        return <MonsterUnit key={mo.uid} G={G} mo={mo} />;
      })}
      <SpectralOverlay G={G} />
    </>
  );
}
