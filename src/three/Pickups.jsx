// ============================================================
// LUZ FRACA — Pickups.jsx : moedas, pilhas e o papel de lore
// ============================================================
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Glow } from './LevelMesh.jsx';

const tmpMat = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const AXIS_Y = new THREE.Vector3(0, 1, 0);

// moedas antigas: brilho dourado fraco pulsando (visível no escuro)
export function Coins({ G }) {
  const ref = useRef();
  const coins = G.map.coins;
  useFrame(({ clock }) => {
    const inst = ref.current;
    if (!inst) return;
    const t = clock.elapsedTime;
    coins.forEach((c, i) => {
      if (c.taken) {
        tmpS.setScalar(0.0001);
      } else {
        tmpS.setScalar(c.v > 1 ? 1.3 : 1);
      }
      tmpQ.setFromAxisAngle(AXIS_Y, t * 1.5 + i);
      tmpV.set(c.x, 0.18 + Math.sin(t * 2 + i * 1.7) * 0.04, c.y);
      tmpMat.compose(tmpV, tmpQ, tmpS);
      inst.setMatrixAt(i, tmpMat);
    });
    inst.instanceMatrix.needsUpdate = true;
    // pulso do brilho
    inst.material.emissiveIntensity = 0.5 + Math.sin(t * 2.2) * 0.25;
  });
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 12);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  return (
    <instancedMesh ref={ref} args={[geo, null, coins.length]} frustumCulled={false}>
      <meshStandardMaterial color="#8a6a1c" emissive="#caa030" emissiveIntensity={0.6} metalness={0.7} roughness={0.4} />
    </instancedMesh>
  );
}

export function Batteries({ G }) {
  return (
    <>
      {G.map.batteries.map((b, i) => <Battery key={i} b={b} />)}
    </>
  );
}

function Battery({ b }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = !b.taken;
    ref.current.rotation.y = clock.elapsedTime;
  });
  return (
    <group ref={ref} position={[b.x, 0.14, b.y]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 10]} />
        <meshStandardMaterial color="#2a4a2a" emissive="#3a7a3a" emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.03, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} />
      </mesh>
      <Glow position={[0, 0, 0]} color="#4a9a4a" scale={0.35} opacity={0.4} />
    </group>
  );
}

// o papel de lore: amassado, brilho branco-azulado pulsando
export function Paper({ G }) {
  const ref = useRef();
  const lightRef = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const visible = !G.paperTaken;
    ref.current.visible = visible;
    if (visible) {
      ref.current.position.set(G.map.paper.x, 0.3 + Math.sin(clock.elapsedTime * 1.4) * 0.05, G.map.paper.y);
      ref.current.rotation.y = clock.elapsedTime * 0.5;
      if (lightRef.current) lightRef.current.intensity = 0.8 + Math.sin(clock.elapsedTime * 1.8) * 0.4;
    }
  });
  // papel amassado = icosaedro achatado
  return (
    <group ref={ref} position={[G.map.paper.x, 0.3, G.map.paper.y]}>
      <mesh castShadow scale={[1, 0.35, 1.3]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#cfd4e2" emissive="#a8c0e8" emissiveIntensity={0.5} roughness={0.7} flatShading />
      </mesh>
      <Glow position={[0, 0, 0]} color="#a8c0e8" scale={1.1} opacity={0.45} />
      <pointLight ref={lightRef} color="#a8c0e8" intensity={0.8} distance={6} />
    </group>
  );
}
