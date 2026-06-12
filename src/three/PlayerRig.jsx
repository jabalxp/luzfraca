// ============================================================
// LUZ FRACA — PlayerRig.jsx : câmera em 1ª pessoa, a mão com a
// lanterna (a única parte de você que existe) e o facho de luz.
// ============================================================
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SAVE } from '../game/save.js';

const EYE_STAND = 1.62, EYE_CROUCH = 1.0;

export default function PlayerRig({ G }) {
  const { camera } = useThree();
  const handGroup = useRef();
  const handInner = useRef();
  const spotRef = useRef();
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  const haloRef = useRef();
  const eyeY = useRef(EYE_STAND);
  const dirV = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const p = G.player;
    const t = state.clock.elapsedTime;

    // altura dos olhos + bob de caminhada
    const targetEye = p.crouching || p.hidden ? EYE_CROUCH : EYE_STAND;
    eyeY.current += (targetEye - eyeY.current) * Math.min(1, dt * 8);
    const bob = p.moving && !p.hidden ? Math.sin(p.bob) * 0.045 : 0;
    const sway = p.moving && !p.hidden ? Math.cos(p.bob * 0.5) * 0.02 : 0;

    // tremor de susto/caçada
    let shakeX = 0, shakeY = 0;
    if (G.shake > 0) {
      shakeX = (Math.random() - 0.5) * 0.05 * G.shake;
      shakeY = (Math.random() - 0.5) * 0.05 * G.shake;
    }
    // tremor de proximidade (o "radar natural")
    const near = G.nearestMonsterDist < 10 ? (1 - G.nearestMonsterDist / 10) : 0;
    if (near > 0) {
      shakeX += (Math.random() - 0.5) * 0.012 * near;
      shakeY += (Math.random() - 0.5) * 0.012 * near;
    }

    camera.position.set(p.x + sway + shakeX, eyeY.current + bob + shakeY, p.y);
    // olhar: yaw (p.angle no plano) + pitch
    const cp = Math.cos(p.pitch);
    dirV.set(Math.cos(p.angle) * cp, Math.sin(p.pitch), Math.sin(p.angle) * cp);
    camera.lookAt(camera.position.x + dirV.x, camera.position.y + dirV.y, camera.position.z + dirV.z);

    // a mão acompanha a câmera
    if (handGroup.current) {
      handGroup.current.position.copy(camera.position);
      handGroup.current.quaternion.copy(camera.quaternion);
      handGroup.current.visible = !p.dead;
      if (handInner.current) {
        // balanço da mão + tremor de medo
        handInner.current.position.set(
          0.26 + Math.cos(p.bob * 0.5) * 0.008 + (near > 0 ? (Math.random() - 0.5) * 0.02 * near : 0),
          -0.22 + Math.sin(p.bob) * 0.012 + (near > 0 ? (Math.random() - 0.5) * 0.02 * near : 0),
          -0.45
        );
        handInner.current.rotation.z = Math.sin(t * 0.8) * 0.02;
      }
    }

    // lanterna
    if (spotRef.current) {
      const on = p.lanternOn && !G.lanternKilled && !p.hidden;
      const range = G.lanternRange();
      const flick = G.lanternFlicker;
      spotRef.current.visible = on;
      spotRef.current.position.copy(camera.position);
      spotTarget.position.set(
        camera.position.x + dirV.x * 10,
        camera.position.y + dirV.y * 10,
        camera.position.z + dirV.z * 10
      );
      spotTarget.updateMatrixWorld();
      if (on) {
        const lvl = SAVE.perm.lantern;
        spotRef.current.angle = p.focusing ? 0.22 : 0.42 - lvl * 0.02;
        spotRef.current.distance = range * (p.focusing ? 2.4 : 1.7);
        spotRef.current.intensity = (95 + lvl * 40) * flick * (0.4 + p.battery * 0.6);
        spotRef.current.color.set(lvl >= 2 ? '#e8e4d8' : '#e8cf9a');
        spotRef.current.penumbra = 0.55;
      }
      if (haloRef.current) {
        haloRef.current.visible = on;
        haloRef.current.position.copy(camera.position).addScaledVector(dirV, 0.5);
        haloRef.current.intensity = on ? 1.6 * flick : 0;
      }
    }
  });

  return (
    <>
      {/* facho principal (com sombras — o coração do visual) */}
      <spotLight
        ref={spotRef}
        castShadow
        angle={0.42}
        penumbra={0.55}
        distance={11}
        intensity={60}
        color="#e8cf9a"
        decay={1.15}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.002}
        target={spotTarget}
      />
      <primitive object={spotTarget} />
      {/* halo fraco em volta da mão para não ficar 100% breu colado */}
      <pointLight ref={haloRef} intensity={0.5} distance={2.6} color="#caa86a" />

      {/* ===== a mão com a lanterna ===== */}
      <group ref={handGroup}>
        <group ref={handInner} position={[0.26, -0.22, -0.45]} rotation={[0.1, -0.18, 0]} scale={0.62}>
          {/* antebraço */}
          <mesh position={[0.05, -0.12, 0.18]} rotation={[0.5, 0, 0.1]}>
            <capsuleGeometry args={[0.035, 0.22, 4, 8]} />
            <meshStandardMaterial color="#7a6450" roughness={0.9} />
          </mesh>
          {/* mão fechada */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.07, 0.08, 0.1]} />
            <meshStandardMaterial color="#8a705c" roughness={0.85} />
          </mesh>
          {/* dedos em volta do corpo da lanterna */}
          {[-0.025, 0, 0.025].map((x, i) => (
            <mesh key={i} position={[x, 0.045, -0.02]} rotation={[0.3, 0, 0]}>
              <capsuleGeometry args={[0.011, 0.045, 3, 6]} />
              <meshStandardMaterial color="#8a705c" roughness={0.85} />
            </mesh>
          ))}
          {/* polegar */}
          <mesh position={[-0.045, 0.01, -0.01]} rotation={[0, 0, 0.9]}>
            <capsuleGeometry args={[0.012, 0.04, 3, 6]} />
            <meshStandardMaterial color="#8a705c" roughness={0.85} />
          </mesh>
          {/* corpo da lanterna */}
          <mesh position={[0, 0.045, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.028, 0.22, 12]} />
            <meshStandardMaterial color="#2c2c30" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* cabeça da lanterna */}
          <mesh position={[0, 0.045, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.034, 0.06, 12]} />
            <meshStandardMaterial color="#3a3a40" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* lente acesa */}
          <LensDisc G={G} />
        </group>
      </group>
    </>
  );
}

function LensDisc({ G }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const p = G.player;
    const on = p.lanternOn && !G.lanternKilled && !p.hidden;
    ref.current.material.emissiveIntensity = on ? 3.2 * G.lanternFlicker : 0.02;
  });
  return (
    <mesh ref={ref} position={[0, 0.045, -0.252]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.038, 0.038, 0.005, 12]} />
      <meshStandardMaterial color="#fff8e0" emissive="#ffeebb" emissiveIntensity={3.2} />
    </mesh>
  );
}
