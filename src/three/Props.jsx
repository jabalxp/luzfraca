// ============================================================
// LUZ FRACA — Props.jsx : objetos de cenário procedurais.
// Cada fase tem seu vocabulário de formas; tudo é primitiva
// composta, sem assets externos.
// ============================================================
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Glow } from './LevelMesh.jsx';
import { textTexture } from './textures.js';

const wood = '#3a2c1c', woodDark = '#241a10', metal = '#3c4044', stone = '#4a463e';

function Box({ p = [0, 0, 0], s = [1, 1, 1], c = wood, r, e, ei = 0.5, ...rest }) {
  return (
    <mesh position={p} rotation={r} castShadow {...rest}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.9} emissive={e || '#000000'} emissiveIntensity={e ? ei : 0} />
    </mesh>
  );
}

function Cyl({ p = [0, 0, 0], rTop = 0.2, rBot = 0.2, h = 1, c = wood, seg = 10, e, ei = 0.5, rot }) {
  return (
    <mesh position={p} rotation={rot} castShadow>
      <cylinderGeometry args={[rTop, rBot, h, seg]} />
      <meshStandardMaterial color={c} roughness={0.9} emissive={e || '#000000'} emissiveIntensity={e ? ei : 0} />
    </mesh>
  );
}

// chama de vela (sprite + leve flicker)
function Flame({ p, color = '#ffb84a', scale = 0.3 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(scale * (0.85 + Math.sin(clock.elapsedTime * 11 + p[0] * 7) * 0.15));
  });
  return (
    <group ref={ref} position={p}>
      <Glow position={[0, 0, 0]} color={color} scale={1} opacity={0.85} />
    </group>
  );
}

function Scoreboard() {
  const tex = useMemo(() => textTexture(['2 × 1', "89'"], { color: '#c9302c', bg: '#0a0a0a', font: 'bold 44px monospace' }), []);
  return (
    <group>
      <Cyl p={[-1.2, 1.5, 0]} rTop={0.08} rBot={0.1} h={3} c={metal} />
      <Cyl p={[1.2, 1.5, 0]} rTop={0.08} rBot={0.1} h={3} c={metal} />
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[3.4, 1.6, 0.2]} />
        <meshStandardMaterial color="#0c0c0c" />
      </mesh>
      <mesh position={[0, 3.4, 0.11]}>
        <planeGeometry args={[3.1, 1.3]} />
        <meshStandardMaterial map={tex} emissive="#7a1c18" emissiveIntensity={0.7} emissiveMap={tex} />
      </mesh>
    </group>
  );
}

function Goal() {
  const post = '#c8c8c0';
  return (
    <group>
      <Cyl p={[-3.6, 1.2, 0]} rTop={0.06} rBot={0.06} h={2.4} c={post} />
      <Cyl p={[3.6, 1.2, 0]} rTop={0.06} rBot={0.06} h={2.4} c={post} />
      <Cyl p={[0, 2.4, 0]} rTop={0.06} rBot={0.06} h={7.2} c={post} rot={[0, 0, Math.PI / 2]} />
      <mesh position={[0, 1.2, -0.5]} rotation-x={-0.25}>
        <planeGeometry args={[7.2, 2.5]} />
        <meshStandardMaterial color="#888" transparent opacity={0.14} side={THREE.DoubleSide} wireframe />
      </mesh>
    </group>
  );
}

function Well() {
  return (
    <group>
      <Cyl p={[0, 0.4, 0]} rTop={0.85} rBot={0.95} h={0.8} c={stone} seg={12} />
      <Cyl p={[0, 0.45, 0]} rTop={0.62} rBot={0.62} h={0.85} c="#060604" seg={12} />
      <Cyl p={[-0.8, 1.2, 0]} rTop={0.05} rBot={0.05} h={1.6} c={woodDark} />
      <Cyl p={[0.8, 1.2, 0]} rTop={0.05} rBot={0.05} h={1.6} c={woodDark} />
      <Cyl p={[0, 2.0, 0]} rTop={0.05} rBot={0.05} h={1.7} c={woodDark} rot={[0, 0, Math.PI / 2]} />
      <Cyl p={[0, 1.3, 0]} rTop={0.012} rBot={0.012} h={1.4} c="#6a5a40" />
    </group>
  );
}

function Lighthouse() {
  return (
    <group>
      <Cyl p={[0, 2.8, 0]} rTop={0.85} rBot={1.2} h={5.6} c="#5a5248" seg={12} />
      <Cyl p={[0, 6.0, 0]} rTop={0.7} rBot={0.85} h={0.9} c="#2c2824" seg={12} />
      <mesh position={[0, 6.45, 0]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial color="#1c1a14" emissive="#b0a020" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function Idol() {
  return (
    <group>
      <Box p={[0, 1.2, 0]} s={[2.6, 2.4, 1.6]} c="#1c1610" />
      <Box p={[0, 3.0, 0]} s={[1.6, 1.4, 1.2]} c="#241c12" />
      {/* boca aberta — a língua de pedra */}
      <Box p={[0, 2.7, 0.62]} s={[0.9, 0.5, 0.1]} c="#050302" />
      <Box p={[0, 2.4, 0.75]} s={[0.7, 0.12, 0.6]} c="#3a2418" />
      {/* sem olhos: superfícies lisas onde olhos deviam estar */}
      <Box p={[-0.4, 3.2, 0.61]} s={[0.35, 0.18, 0.04]} c="#100c08" />
      <Box p={[0.4, 3.2, 0.61]} s={[0.35, 0.18, 0.04]} c="#100c08" />
    </group>
  );
}

function Rocket() {
  return (
    <group>
      <Cyl p={[0, 2.2, 0]} rTop={0.7} rBot={0.7} h={4.4} c="#9a9a96" seg={14} />
      <mesh position={[0, 5.0, 0]} castShadow>
        <coneGeometry args={[0.7, 1.4, 14]} />
        <meshStandardMaterial color="#7a2c2c" roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map(i => (
        <Box key={i} p={[Math.cos(i * Math.PI / 2) * 0.8, 0.5, Math.sin(i * Math.PI / 2) * 0.8]} s={[0.5, 1, 0.1]} r={[0, i * Math.PI / 2, 0]} c="#62625e" />
      ))}
    </group>
  );
}

function Umbrella({ red = '#8c1c1c' }) {
  return (
    <group>
      <Cyl p={[0, 0.7, 0]} rTop={0.025} rBot={0.025} h={1.4} c={woodDark} />
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.75, 0.5, 12]} />
        <meshStandardMaterial color={red} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Cross({ seventh }) {
  return (
    <group>
      <Box p={[0, 0.8, 0]} s={[0.1, 1.6, 0.1]} c={seventh ? '#1a130c' : woodDark} />
      <Box p={[0, 1.15, 0]} s={[0.7, 0.1, 0.1]} c={seventh ? '#1a130c' : woodDark} />
      {!seventh && <Box p={[0, 0.95, 0.06]} s={[0.3, 0.12, 0.02]} c="#6a5a44" />}
    </group>
  );
}

function Tree({ dark }) {
  return (
    <group>
      <Cyl p={[0, 1.0, 0]} rTop={0.12} rBot={0.22} h={2.0} c="#241c12" seg={8} />
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[1.1, 2.2, 9]} />
        <meshStandardMaterial color={dark ? '#15201a' : '#1c2a18'} roughness={1} />
      </mesh>
    </group>
  );
}

function Baobab() {
  return (
    <group>
      <Cyl p={[0, 1.3, 0]} rTop={0.55} rBot={0.9} h={2.6} c="#3e3224" seg={9} />
      {[0, 1.3, 2.5, 3.8, 5.1].map((a, i) => (
        <Cyl key={i} p={[Math.cos(a) * 0.7, 2.9, Math.sin(a) * 0.7]} rTop={0.05} rBot={0.16} h={1.1}
          c="#332a1e" rot={[Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7]} />
      ))}
    </group>
  );
}

function Wreck() {
  return (
    <group rotation-z={0.28} rotation-y={0.6}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3.6, 1.2, 1.3]} />
        <meshStandardMaterial color="#2e2820" roughness={1} />
      </mesh>
      <Cyl p={[0.4, 1.7, 0]} rTop={0.05} rBot={0.07} h={1.8} c={woodDark} rot={[0, 0, -0.5]} />
    </group>
  );
}

function Console() {
  return (
    <group>
      <Box p={[0, 0.5, 0]} s={[1.4, 1, 0.6]} c={metal} />
      <mesh position={[0, 1.1, 0.1]} rotation-x={-0.5}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial color="#06080a" emissive="#163022" emissiveIntensity={0.8} />
      </mesh>
      <Glow position={[0.4, 1.06, 0.22]} color="#3aaa5a" scale={0.12} opacity={0.8} />
    </group>
  );
}

function Cart() {
  return (
    <group rotation-y={Math.random() * 6}>
      <Box p={[0, 0.55, 0]} s={[0.9, 0.5, 0.55]} c="#5a6066" />
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.92, 0.52, 0.57]} />
        <meshStandardMaterial color="#7a8086" wireframe />
      </mesh>
      {[[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]].map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.12, z]} rTop={0.1} rBot={0.1} h={0.06} c="#16181c" rot={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
}

function Altar({ red }) {
  return (
    <group>
      <Box p={[0, 0.5, 0]} s={[1.8, 1, 0.8]} c={stone} />
      <Box p={[0, 1.02, 0]} s={[1.9, 0.08, 0.9]} c={red ? '#5a1414' : '#3a3026'} />
      <Cyl p={[-0.6, 1.2, 0]} rTop={0.05} rBot={0.06} h={0.3} c="#d8cca8" />
      <Cyl p={[0.6, 1.2, 0]} rTop={0.05} rBot={0.06} h={0.3} c="#d8cca8" />
      <Flame p={[-0.6, 1.45, 0]} /><Flame p={[0.6, 1.45, 0]} />
    </group>
  );
}

function Torii() {
  const red = '#7a1818';
  return (
    <group>
      <Cyl p={[-1, 1.2, 0]} rTop={0.1} rBot={0.12} h={2.4} c={red} />
      <Cyl p={[1, 1.2, 0]} rTop={0.1} rBot={0.12} h={2.4} c={red} />
      <Box p={[0, 2.45, 0]} s={[2.8, 0.16, 0.3]} c={red} />
      <Box p={[0, 2.05, 0]} s={[2.3, 0.12, 0.2]} c={red} />
    </group>
  );
}

function Cana({ pr }) {
  const ref = useRef();
  useFrame(() => { if (ref.current) ref.current.visible = !pr.taken; });
  return (
    <group ref={ref}>
      <Cyl p={[0, 0.18, 0]} rTop={0.07} rBot={0.09} h={0.36} c="#7a5a20" e="#caa84a" ei={0.25} />
      <Cyl p={[0, 0.42, 0]} rTop={0.03} rBot={0.05} h={0.14} c="#5a4218" />
      <Glow position={[0, 0.3, 0]} color="#caa84a" scale={0.5} opacity={0.3} />
    </group>
  );
}

// guarda-chuva pendurado de lanterna vermelha
function RedLantern({ h = 2.3 }) {
  return (
    <group position={[0, h, 0]}>
      <Cyl p={[0, 0, 0]} rTop={0.16} rBot={0.16} h={0.34} c="#8c1c1c" e="#aa2020" ei={0.9} seg={10} />
      <Glow position={[0, 0, 0]} color="#c03030" scale={0.8} opacity={0.5} />
    </group>
  );
}

function Fluorescent() {
  // metade das luminárias dos backrooms está acesa
  const lit = useMemo(() => Math.random() < 0.55, []);
  return (
    <group position={[0, 2.74, 0]}>
      <Box p={[0, 0, 0]} s={[1.2, 0.08, 0.4]} c="#8a845e" e={lit ? '#d8d2a0' : '#1a1812'} ei={lit ? 1.2 : 0.1} />
      {lit && <Glow position={[0, -0.15, 0]} color="#d8d2a0" scale={1.4} opacity={0.35} />}
    </group>
  );
}

function Firepit() {
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <mesh key={i} position={[Math.cos(i) * 0.4, 0.08, Math.sin(i) * 0.4]} castShadow>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color={stone} roughness={1} />
        </mesh>
      ))}
      <Cyl p={[0, 0.08, 0]} rTop={0.25} rBot={0.3} h={0.12} c="#0c0a08" />
    </group>
  );
}

function Gurney() {
  return (
    <group>
      <Box p={[0, 0.75, 0]} s={[1.8, 0.08, 0.7]} c="#7a7e82" />
      <Box p={[0, 0.82, 0]} s={[1.7, 0.07, 0.62]} c="#b8b4a8" />
      {/* o volume sob o lençol */}
      <mesh position={[0, 0.94, 0]} castShadow>
        <capsuleGeometry args={[0.16, 1.1, 4, 8]} />
        <meshStandardMaterial color="#b8b4a8" roughness={1} />
      </mesh>
      {[[-0.7, -0.25], [0.7, -0.25], [-0.7, 0.25], [0.7, 0.25]].map(([x, z], i) => (
        <Cyl key={i} p={[x, 0.37, z]} rTop={0.03} rBot={0.03} h={0.74} c={metal} />
      ))}
    </group>
  );
}

function Reactor() {
  return (
    <group>
      <Cyl p={[0, 1.4, 0]} rTop={1.0} rBot={1.0} h={2.8} c="#46505a" seg={14} />
      <Cyl p={[0, 0.7, 0]} rTop={1.06} rBot={1.06} h={0.14} c="#2c343c" seg={14} />
      <Cyl p={[0, 2.1, 0]} rTop={1.06} rBot={1.06} h={0.14} c="#2c343c" seg={14} />
      <Glow position={[0, 1.4, 1.04]} color="#c04030" scale={0.3} opacity={0.7} />
    </group>
  );
}

function LabTank() {
  return (
    <group>
      <Cyl p={[0, 0.2, 0]} rTop={0.45} rBot={0.5} h={0.4} c={metal} seg={12} />
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 1.4, 12]} />
        <meshStandardMaterial color="#1c3026" transparent opacity={0.4} emissive="#16402a" emissiveIntensity={0.5} roughness={0.1} />
      </mesh>
      <Cyl p={[0, 1.95, 0]} rTop={0.45} rBot={0.45} h={0.3} c={metal} seg={12} />
    </group>
  );
}

function StoneLamp() {
  return (
    <group>
      <Cyl p={[0, 0.35, 0]} rTop={0.1} rBot={0.16} h={0.7} c={stone} seg={8} />
      <Box p={[0, 0.85, 0]} s={[0.45, 0.35, 0.45]} c={stone} />
      <mesh position={[0, 1.12, 0]} castShadow>
        <coneGeometry args={[0.36, 0.25, 4]} />
        <meshStandardMaterial color={stone} roughness={1} />
      </mesh>
      <Glow position={[0, 0.85, 0]} color="#caa86a" scale={0.45} opacity={0.4} />
    </group>
  );
}

// ---------- props de detalhe (entulho) ----------
function Detail({ pr, propColor }) {
  switch (pr.type) {
    case 'trash': return <Box p={[0, 0.07, 0]} s={[0.3, 0.14, 0.22]} c="#1c1a14" r={[0, pr.rot, 0.2]} />;
    case 'bottle': return <Cyl p={[0, 0.1, 0]} rTop={0.04} rBot={0.05} h={0.22} c="#2a3a2a" rot={[Math.PI / 2 * (pr.s > 1 ? 1 : 0), pr.rot, 0]} />;
    case 'flag': return <group rotation-y={pr.rot}><Cyl p={[0, 0.5, 0]} rTop={0.02} rBot={0.02} h={1} c={woodDark} /><Box p={[0.18, 0.85, 0]} s={[0.34, 0.22, 0.01]} c="#5a1c1c" /></group>;
    case 'seat': return <Box p={[0, 0.18, 0]} s={[0.4, 0.36, 0.4]} c="#26342a" r={[0, pr.rot, 0]} />;
    case 'box': case 'crate': return <Box p={[0, 0.22 * pr.s, 0]} s={[0.45 * pr.s, 0.45 * pr.s, 0.45 * pr.s]} c="#3a3226" r={[0, pr.rot, 0]} />;
    case 'pallet': return <Box p={[0, 0.06, 0]} s={[0.9, 0.12, 0.9]} c={woodDark} r={[0, pr.rot, 0]} />;
    case 'spill': case 'stain': return <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, pr.rot]}><circleGeometry args={[0.4 * pr.s, 8]} /><meshStandardMaterial color="#0a0806" roughness={0.4} /></mesh>;
    case 'wire': return <Box p={[0, 0.02, 0]} s={[0.8, 0.03, 0.04]} c="#101010" r={[0, pr.rot, 0]} />;
    case 'chair': return <group rotation={[pr.s > 1.1 ? Math.PI / 2 : 0, pr.rot, 0]} position={[0, pr.s > 1.1 ? 0.25 : 0, 0]}><Box p={[0, 0.25, 0]} s={[0.4, 0.06, 0.4]} c="#4a4030" /><Box p={[0, 0.5, -0.18]} s={[0.4, 0.5, 0.05]} c="#4a4030" />{[[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].map(([x, z], i) => <Cyl key={i} p={[x, 0.12, z]} rTop={0.02} rBot={0.02} h={0.24} c="#2c2418" />)}</group>;
    case 'rock': return <mesh position={[0, 0.12 * pr.s, 0]} rotation={[pr.rot, pr.rot, 0]} castShadow><dodecahedronGeometry args={[0.22 * pr.s, 0]} /><meshStandardMaterial color={stone} roughness={1} /></mesh>;
    case 'termite': return <mesh position={[0, 0.5 * pr.s, 0]} castShadow><coneGeometry args={[0.3 * pr.s, 1.1 * pr.s, 7]} /><meshStandardMaterial color="#4a3a26" roughness={1} /></mesh>;
    case 'bone': return <Box p={[0, 0.03, 0]} s={[0.35, 0.05, 0.06]} c="#b8b0a0" r={[0, pr.rot, 0]} />;
    case 'bush': return <mesh position={[0, 0.22, 0]} castShadow><sphereGeometry args={[0.32 * pr.s, 7, 5]} /><meshStandardMaterial color="#222a14" roughness={1} /></mesh>;
    case 'plank': return <Box p={[0, 0.03, 0]} s={[0.9, 0.05, 0.18]} c="#332a1e" r={[0, pr.rot, 0]} />;
    case 'net': return <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, pr.rot]}><planeGeometry args={[0.8, 0.6]} /><meshStandardMaterial color="#2a2c24" wireframe /></mesh>;
    case 'shell': return <mesh position={[0, 0.04, 0]}><sphereGeometry args={[0.07, 6, 4]} /><meshStandardMaterial color="#b0a890" /></mesh>;
    case 'hay': return <Box p={[0, 0.2, 0]} s={[0.6, 0.4, 0.45]} c="#6a5a2a" r={[0, pr.rot, 0]} />;
    case 'fence': return <group rotation-y={pr.rot}><Box p={[0, 0.4, 0]} s={[1.1, 0.06, 0.05]} c={woodDark} /><Cyl p={[-0.4, 0.25, 0]} rTop={0.03} rBot={0.03} h={0.5} c={woodDark} /><Cyl p={[0.4, 0.25, 0]} rTop={0.03} rBot={0.03} h={0.5} c={woodDark} /></group>;
    case 'barrel': return <Cyl p={[0, 0.35, 0]} rTop={0.26} rBot={0.26} h={0.7} c="#3c3428" seg={10} />;
    case 'pipe': return <Cyl p={[0, 0.12, 0]} rTop={0.1} rBot={0.1} h={1.2} c={metal} rot={[Math.PI / 2, 0, pr.rot]} />;
    case 'paperpile': return <Box p={[0, 0.04, 0]} s={[0.32, 0.08, 0.24]} c="#a89c80" r={[0, pr.rot, 0]} />;
    case 'flowerpot': return <group><Cyl p={[0, 0.12, 0]} rTop={0.12} rBot={0.08} h={0.24} c="#5a3420" /><Glow position={[0, 0.3, 0]} color="#c87820" scale={0.3} opacity={0.5} /></group>;
    case 'bench': return <group rotation-y={pr.rot}><Box p={[0, 0.25, 0]} s={[1.1, 0.07, 0.35]} c={woodDark} /><Box p={[-0.45, 0.12, 0]} s={[0.07, 0.24, 0.3]} c={woodDark} /><Box p={[0.45, 0.12, 0]} s={[0.07, 0.24, 0.3]} c={woodDark} /></group>;
    case 'skull': return <group rotation-y={pr.rot}><mesh position={[0, 0.08, 0]}><sphereGeometry args={[0.1, 8, 6]} /><meshStandardMaterial color="#c4bca8" roughness={0.8} /></mesh><Box p={[-0.035, 0.09, 0.08]} s={[0.03, 0.04, 0.02]} c="#080604" /><Box p={[0.035, 0.09, 0.08]} s={[0.03, 0.04, 0.02]} c="#080604" /></group>;
    case 'plate': return <Cyl p={[0, 0.02, 0]} rTop={0.12} rBot={0.1} h={0.03} c="#8a8478" seg={10} />;
    case 'ropecandle': return <group><Cyl p={[0, 0.15, 0]} rTop={0.04} rBot={0.05} h={0.3} c="#2c2420" /><Flame p={[0, 0.38, 0]} color="#aa3322" scale={0.22} /></group>;
    default: return <Box p={[0, 0.08, 0]} s={[0.25, 0.16, 0.2]} c="#1a1814" r={[0, pr.rot || 0, 0]} />;
  }
}

// ---------- prop principal ----------
function Prop({ pr, level }) {
  const propColor = level.palette.prop;
  if (pr.detail) return <group position={[pr.x, 0, pr.y]}><Detail pr={pr} propColor={propColor} /></group>;
  let inner = null;
  switch (pr.type) {
    case 'goal': inner = <Goal />; break;
    case 'scoreboard': inner = <Scoreboard />; break;
    case 'floodlight': inner = (
      <group>
        <Cyl p={[0, 2.6, 0]} rTop={0.09} rBot={0.14} h={5.2} c={metal} />
        <Box p={[0, 5.4, 0.1]} s={[1.2, 0.7, 0.25]} c="#16181a" r={[-0.5, 0, 0]} />
      </group>
    ); break;
    case 'bench3': inner = <Box p={[0, 0.3, 0]} s={[0.5, 0.12, 2.4]} c="#26342a" />; break;
    case 'cornerflag': inner = <Detail pr={{ ...pr, type: 'flag', rot: 0, s: 1 }} propColor={propColor} />; break;
    case 'cart': inner = <Cart />; break;
    case 'register': inner = (
      <group>
        <Box p={[0, 0.5, 0]} s={[0.7, 1, 1.6]} c="#3a4048" />
        <Box p={[0, 1.05, -0.4]} s={[0.5, 0.3, 0.4]} c="#22262c" />
      </group>
    ); break;
    case 'pallet': inner = <Box p={[0, 0.3, 0]} s={[1.1, 0.6, 1.1]} c="#42382a" />; break;
    case 'deskpile': inner = (
      <group>
        <Box p={[0, 0.4, 0]} s={[1.4, 0.8, 0.7]} c={woodDark} />
        <Box p={[0.2, 0.86, 0]} s={[0.4, 0.12, 0.3]} c="#a89c80" r={[0, 0.4, 0]} />
        <Box p={[-0.3, 0.86, 0.1]} s={[0.35, 0.08, 0.28]} c="#988c70" r={[0, -0.3, 0]} />
      </group>
    ); break;
    case 'deadlamp': inner = (
      <group position={[0, 2.3, 0]}>
        <Cyl p={[0, 0.07, 0]} rTop={0.02} rBot={0.02} h={0.3} c="#101010" />
        <Box p={[0, -0.1, 0]} s={[1.1, 0.07, 0.3]} c="#26262a" r={[0, 0, 0.12]} />
      </group>
    ); break;
    case 'fluorescent': inner = <Fluorescent />; break;
    case 'emergencylight': inner = (
      <group position={[0, 2.85, 0]}>
        <Box p={[0, 0, 0]} s={[0.3, 0.12, 0.18]} c="#33373c" e="#aa2222" ei={0.9} />
        <Glow position={[0, -0.1, 0]} color="#c03030" scale={0.9} opacity={0.4} />
      </group>
    ); break;
    case 'candle': inner = (
      <group>
        <Cyl p={[0, 0.12, 0]} rTop={0.045} rBot={0.055} h={0.24} c="#d8cca8" />
        <Flame p={[0, 0.33, 0]} />
      </group>
    ); break;
    case 'blackcandle': inner = (
      <group>
        <Cyl p={[0, 0.16, 0]} rTop={0.05} rBot={0.07} h={0.32} c="#16120e" />
        <Flame p={[0, 0.4, 0]} color="#aa3322" scale={0.24} />
      </group>
    ); break;
    case 'altar': inner = <Altar red={level.gen === 'temple'} />; break;
    case 'papelpicado': inner = (
      <group position={[0, 2.4, 0]}>
        {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
          <Box key={i} p={[x, -0.1 - Math.abs(x) * 0.18, 0]} s={[0.22, 0.16, 0.01]} c={['#8c2c4a', '#2c5a6a', '#9a7a1c', '#5a2c6a'][i]} />
        ))}
      </group>
    ); break;
    case 'cross': inner = <Cross />; break;
    case 'cross7': inner = <Cross seventh />; break;
    case 'cana': inner = <Cana pr={pr} />; break;
    case 'deadtree': inner = (
      <group>
        <Cyl p={[0, 1.1, 0]} rTop={0.08} rBot={0.18} h={2.2} c="#1c160e" seg={7} />
        <Cyl p={[0.3, 2.1, 0]} rTop={0.02} rBot={0.06} h={1.0} c="#1c160e" rot={[0, 0, -0.7]} />
        <Cyl p={[-0.25, 1.9, 0.1]} rTop={0.02} rBot={0.05} h={0.8} c="#1c160e" rot={[0.3, 0, 0.8]} />
      </group>
    ); break;
    case 'umbrella': inner = <Umbrella />; break;
    case 'redlantern': inner = <RedLantern />; break;
    case 'torii': inner = <Torii />; break;
    case 'stonelamp': inner = <StoneLamp />; break;
    case 'baobab': inner = <Baobab />; break;
    case 'firepit': inner = <Firepit />; break;
    case 'well': inner = <Well />; break;
    case 'drum': inner = (
      <group>
        <Cyl p={[0, 0.4, 0]} rTop={0.32} rBot={0.4} h={0.8} c="#4a3018" seg={10} />
        <Cyl p={[0, 0.81, 0]} rTop={0.33} rBot={0.33} h={0.04} c="#a89468" seg={10} />
      </group>
    ); break;
    case 'gurney': inner = <Gurney />; break;
    case 'console': inner = <Console />; break;
    case 'rocket': inner = <Rocket />; break;
    case 'table': inner = (
      <group>
        <Box p={[0, 0.55, 0]} s={[1.6, 0.08, 0.8]} c={woodDark} />
        {[[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].map(([x, z], i) => (
          <Cyl key={i} p={[x, 0.26, z]} rTop={0.04} rBot={0.04} h={0.52} c={woodDark} />
        ))}
      </group>
    ); break;
    case 'labtank': inner = <LabTank />; break;
    case 'reactor': inner = <Reactor />; break;
    case 'crate': inner = <Box p={[0, 0.4, 0]} s={[0.8, 0.8, 0.8]} c="#3a3226" />; break;
    case 'telescope': inner = (
      <group>
        <Cyl p={[0, 0.6, 0]} rTop={0.08} rBot={0.3} h={1.2} c={metal} seg={8} />
        <Cyl p={[0, 1.4, 0.2]} rTop={0.18} rBot={0.18} h={1.3} c="#2c3036" rot={[0.8, 0, 0]} seg={10} />
      </group>
    ); break;
    case 'tree': inner = <Tree dark />; break;
    case 'wreck': inner = <Wreck />; break;
    case 'lighthouse': inner = <Lighthouse />; break;
    case 'templeStairs': inner = (
      <group>
        {[0, 1, 2].map(i => <Box key={i} p={[0, -0.1 - i * 0.18, i * 0.4]} s={[1.6, 0.18, 0.4]} c={stone} />)}
      </group>
    ); break;
    case 'column': inner = <Cyl p={[0, 1.1, 0]} rTop={0.3} rBot={0.36} h={2.2} c="#3c4438" seg={10} />; break;
    case 'idol': inner = <Idol />; break;
    default: inner = <Box p={[0, 0.2, 0]} s={[0.4, 0.4, 0.4]} c={propColor} />;
  }
  return <group position={[pr.x, 0, pr.y]}>{inner}</group>;
}

export default function PropsLayer({ G }) {
  const props = useMemo(() => G.map.props, [G]);
  return (
    <>
      {props.map((pr, i) => <Prop key={i} pr={pr} level={G.level} />)}
    </>
  );
}
