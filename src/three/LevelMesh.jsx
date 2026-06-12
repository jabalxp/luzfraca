// ============================================================
// LUZ FRACA — LevelMesh.jsx : geometria 3D do mapa
// Paredes instanciadas, chão/teto texturizados, água, capim,
// porta de saída, esconderijos, neve e farol.
// ============================================================
import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TILE, MAP_W, MAP_H, isSolidTile } from '../game/mapgen.js';
import { grungeTexture, makeFloorTexture, glowTexture } from './textures.js';

export function wallHeight(level) {
  return { arena: 3.5, shelves: 2.4, maze: 2.8, village: 2.6, savanna: 2.2, facility: 3.0, island: 2.5, temple: 3.4 }[level.gen] || 3;
}

// re-renderiza quando a simulação muda o mapa (maré, backrooms, pétalas)
export function useMapVersion(G) {
  const [ver, setVer] = useState(G.mapVersion);
  useFrame(() => { if (G.mapVersion !== ver) setVer(G.mapVersion); });
  return ver;
}

// ---------- atmosfera: fundo, neblina e luz ----------
export function Atmosphere({ G }) {
  const { scene } = useThree();
  const ambRef = useRef();
  const level = G.level;
  useEffect(() => {
    const bg = new THREE.Color(level.palette.sky || level.palette.fog || '#020203');
    scene.background = bg;
    const far = 10 + level.ambientLight * 45 + (level.outdoor ? 8 : 0);
    scene.fog = new THREE.Fog(new THREE.Color(level.palette.fog || '#030303'), 2, far);
    return () => { scene.fog = null; scene.background = new THREE.Color('#000'); };
  }, [scene, level]);
  useFrame(() => {
    if (!ambRef.current) return;
    let target = level.ambientLight;
    if (G.darkRoomAt) target *= 0.08;
    if (G.blackoutActive) target *= 0.1;
    ambRef.current.intensity += (target - ambRef.current.intensity) * 0.1;
  });
  return (
    <>
      <ambientLight ref={ambRef} intensity={level.ambientLight} color={level.gen === 'maze' ? '#f0e6b8' : '#cfd8e8'} />
      {level.outdoor && <directionalLight position={[20, 30, 10]} intensity={0.05} color="#7080b0" />}
    </>
  );
}

// ---------- chão e teto ----------
export function Floor({ G }) {
  const ver = useMapVersion(G);
  const { texture, repaint } = useMemo(() => makeFloorTexture(G.map, G.level), [G]);
  useEffect(() => { repaint(); }, [ver, repaint]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[MAP_W / 2, 0, MAP_H / 2]} receiveShadow>
      <planeGeometry args={[MAP_W, MAP_H]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  );
}

export function Ceiling({ G }) {
  const level = G.level;
  const tex = useMemo(() => {
    const t = grungeTexture(level.palette.ceil, { noise: 0.3, stains: 14, seed: level.id * 31 + 3, lines: level.gen === 'maze' ? 12 : 0 });
    t.repeat.set(12, 12);
    return t;
  }, [level]);
  if (level.outdoor) return null;
  return (
    <mesh rotation-x={Math.PI / 2} position={[MAP_W / 2, wallHeight(level), MAP_H / 2]}>
      <planeGeometry args={[MAP_W, MAP_H]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  );
}

// ---------- paredes instanciadas ----------
function WallInstances({ G, tileType, colorHex, seed }) {
  const ver = useMapVersion(G);
  const level = G.level;
  const H = wallHeight(level);
  const tex = useMemo(() => {
    const t = grungeTexture(colorHex, { noise: 0.28, stains: 12, seed, lines: level.gen === 'facility' ? 6 : 0 });
    t.repeat.set(1, 1);
    return t;
  }, [colorHex, seed, level]);

  const positions = useMemo(() => {
    const m = G.map;
    const list = [];
    const solid = v => v === TILE.WALL || v === TILE.WALL2;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (m.t[y * MAP_W + x] !== tileType) continue;
        // só renderiza paredes com pelo menos um vizinho atravessável (corta o miolo)
        let exposed = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
        if (!exposed) {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (!solid(m.t[(y + dy) * MAP_W + (x + dx)])) { exposed = true; break; }
          }
        }
        if (exposed) list.push([x + 0.5, y + 0.5]);
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [G, tileType, ver]);

  const ref = useRef();
  useEffect(() => {
    const inst = ref.current;
    if (!inst) return;
    const mat = new THREE.Matrix4();
    positions.forEach(([x, z], i) => {
      mat.makeTranslation(x, H / 2, z);
      inst.setMatrixAt(i, mat);
    });
    inst.count = positions.length;
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }, [positions, H]);

  return (
    <instancedMesh ref={ref} args={[null, null, Math.max(1, positions.length)]} castShadow receiveShadow key={positions.length + ':' + ver}>
      <boxGeometry args={[1.001, H, 1.001]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </instancedMesh>
  );
}

export function Walls({ G }) {
  return (
    <>
      <WallInstances G={G} tileType={TILE.WALL} colorHex={G.level.palette.wall} seed={G.level.id * 7 + 1} />
      <WallInstances G={G} tileType={TILE.WALL2} colorHex={G.level.palette.wall2} seed={G.level.id * 7 + 2} />
    </>
  );
}

// ---------- água ----------
export function Water({ G }) {
  const ver = useMapVersion(G);
  const ref = useRef();
  const positions = useMemo(() => {
    const list = [];
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      if (G.map.t[y * MAP_W + x] === TILE.WATER) list.push([x + 0.5, y + 0.5]);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [G, ver]);
  useEffect(() => {
    const inst = ref.current;
    if (!inst) return;
    const mat = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    positions.forEach(([x, z], i) => {
      mat.makeTranslation(x, 0.07, z).multiply(rot);
      inst.setMatrixAt(i, mat);
    });
    inst.count = positions.length;
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
  }, [positions]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.opacity = 0.78 + Math.sin(clock.elapsedTime * 0.8) * 0.06;
  });
  if (!positions.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, Math.max(1, positions.length)]} key={positions.length + ':' + ver}>
      <planeGeometry args={[1.01, 1.01]} />
      <meshStandardMaterial color="#16363c" transparent opacity={0.8} roughness={0.15} metalness={0.4} />
    </instancedMesh>
  );
}

// ---------- capim alto (savana) ----------
export function Grass({ G }) {
  const blades = useMemo(() => {
    const list = [];
    const rng = () => Math.random();
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      if (G.map.t[y * MAP_W + x] === TILE.GRASS) {
        for (let i = 0; i < 3; i++) list.push([x + rng(), y + rng(), rng() * Math.PI]);
      }
    }
    return list;
  }, [G]);
  const ref = useRef();
  useEffect(() => {
    const inst = ref.current;
    if (!inst) return;
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    blades.forEach(([x, z, rot], i) => {
      q.setFromAxisAngle(up, rot);
      mat.compose(new THREE.Vector3(x, 0.55, z), q, new THREE.Vector3(1, 1, 1));
      inst.setMatrixAt(i, mat);
    });
    inst.count = blades.length;
    inst.instanceMatrix.needsUpdate = true;
  }, [blades]);
  if (!blades.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, Math.max(1, blades.length)]}>
      <planeGeometry args={[0.7, 1.1]} />
      <meshStandardMaterial color="#4a4c1e" side={THREE.DoubleSide} transparent opacity={0.92} roughness={1} />
    </instancedMesh>
  );
}

// ---------- saída ----------
export function ExitDoor({ G }) {
  const ver = useMapVersion(G);
  const e = G.map.exit;
  const H = wallHeight(G.level);
  const open = G.exitOpen;
  const lightRef = useRef();
  useFrame(({ clock }) => {
    if (lightRef.current && open) {
      lightRef.current.intensity = 2.2 + Math.sin(clock.elapsedTime * 6) * 0.5;
    }
  });
  return (
    <group position={[e.x + 0.5, 0, e.y + 0.5]} key={ver}>
      {/* batente */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[1.06, H, 1.06]} />
        <meshStandardMaterial color="#15120e" roughness={0.9} />
      </mesh>
      {/* folha da porta / fresta de luz */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.1, 2.2, 1.1]} />
        <meshStandardMaterial
          color={open ? '#3a3424' : '#1c1814'}
          emissive={open ? '#d8c890' : '#420c0c'}
          emissiveIntensity={open ? 0.9 : 0.25}
          roughness={0.8}
        />
      </mesh>
      {open && <pointLight ref={lightRef} position={[0, 1.4, 0]} color="#e8d8a8" intensity={2.2} distance={9} />}
    </group>
  );
}

// ---------- esconderijos (armário/caixote temático) ----------
export function Hides({ G }) {
  const color = G.level.palette.prop;
  return (
    <>
      {G.map.hides.map((h, i) => (
        <group key={i} position={[h.x + 0.5, 0, h.y + 0.5]} rotation-y={(i % 4) * Math.PI / 2}>
          <mesh position={[0.28, 1, 0]} castShadow>
            <boxGeometry args={[0.42, 2, 0.9]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {/* frestas da porta */}
          {[0.6, 1.0, 1.4].map(y => (
            <mesh key={y} position={[0.06, y, 0]}>
              <boxGeometry args={[0.02, 0.04, 0.7]} />
              <meshStandardMaterial color="#050505" />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ---------- neve caindo (Ásia) ----------
export function Snowfall({ G }) {
  const N = 900;
  const ref = useRef();
  const data = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = Math.random() * MAP_W;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = Math.random() * MAP_H;
      speed[i] = 0.4 + Math.random() * 0.7;
    }
    return { pos, speed };
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] -= data.speed[i] * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 2 + i) * dt * 0.3;
      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  if (!G.level.snow) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#cfd6e2" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ---------- facho do farol (ilha) ----------
export function LighthouseBeam({ G }) {
  const groupRef = useRef();
  const lh = useMemo(() => G.map.props.find(p => p.type === 'lighthouse'), [G]);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = !!G.lighthouseActive;
    groupRef.current.rotation.y = clock.elapsedTime * 0.9;
  });
  if (!lh) return null;
  return (
    <group ref={groupRef} position={[lh.x, 6.4, lh.y]} visible={false}>
      <mesh position={[7, 0, 0]} rotation-z={Math.PI / 2}>
        <coneGeometry args={[2.2, 14, 16, 1, true]} />
        <meshBasicMaterial color="#e8e0a0" transparent opacity={0.13} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color="#e8e0a0" intensity={3} distance={26} />
    </group>
  );
}

// ---------- sprite de brilho reutilizável ----------
export function Glow({ position, color = '#ffffff', scale = 0.5, opacity = 0.7 }) {
  const tex = glowTexture();
  return (
    <sprite position={position} scale={[scale, scale, scale]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
}
