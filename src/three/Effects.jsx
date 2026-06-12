// ============================================================
// LUZ FRACA — Effects.jsx : pós-processamento found-footage
// granulado, vinheta, aberração cromática e bloom fraco.
// (não passar ref aos efeitos: com React 19 o ref entra nas
// props e o wrapper interno faz JSON.stringify delas)
// ============================================================
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { SAVE } from '../game/save.js';

export default function Effects() {
  const { gl } = useThree();
  useFrame(() => {
    gl.toneMappingExposure = SAVE.settings.brightness / 100;
  });
  return (
    <EffectComposer>
      <Bloom intensity={0.55} luminanceThreshold={0.25} luminanceSmoothing={0.7} mipmapBlur />
      <ChromaticAberration offset={[0.0014, 0.0009]} radialModulation modulationOffset={0.4} />
      <Noise opacity={0.14} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.28} darkness={0.78} />
    </EffectComposer>
  );
}
