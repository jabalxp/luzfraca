# Plano de Implementação — Refatoração Visual, Spawn de Notas e Atmosfera Sombria

Este documento apresenta o plano detalhado para substituir a geometria procedural do jogo **Luz Fraca** por modelos 3D ricos (arquivos `.glb` presentes em `models/mockups3d`), além de refinar a atmosfera e a lógica de posicionamento das notas.

---

## Análise de Arquivos e Dependências
1. **Modelos 3D Disponíveis (`models/mockups3d/`)**:
   - `level_01_apito_final_stadium.glb` até `level_10_rebanho_deus_cego_temple.glb` (fases 1 a 10, IDs 0 a 9).
   - `player_first_person_hand_flashlight.glb` (mão e lanterna em primeira pessoa).
2. **Configuração de Bundler (`vite.config.js`)**:
   - Necessário adicionar `assetsInclude: ['**/*.glb']` para que o Vite exporte as URLs corretas dos assets `.glb` ao importá-los.
3. **Mapeamento de Renderização (`src/screens/GameScreen.jsx`)**:
   - Substituição de `<Floor>`, `<Ceiling>`, `<Walls>` e `<PropsLayer>` pelo componente unificado do modelo GLB da fase atual.
   - Integração do `<Suspense fallback={null}>` no Canvas para gerenciar o carregamento assíncrono promovido pelo `useGLTF`.

---

## Proposta de Alterações

### 1. Configuração do Vite

#### [MODIFY] [vite.config.js](file:///c:/Users/TDS26/Desktop/luzfraca-1/vite.config.js)
- Adicionar o campo `assetsInclude: ['**/*.glb']` nas opções do defineConfig para que possamos importar os arquivos `.glb` como URLs de assets estáticos no React.

---

### 2. Carregamento dos Modelos dos Níveis

#### [MODIFY] [LevelMesh.jsx](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/three/LevelMesh.jsx)
- Importar os 10 arquivos `.glb` dos níveis.
- Adicionar o componente `LevelModel` que usa `useGLTF` de `@react-three/drei` para carregar o modelo correspondente à fase ativa (`G.level.id`).
- Configurar no modelo propriedades de sombras: habilitar `castShadow` e `receiveShadow` ao percorrer os nós da cena (`traverse`).
- Ajustar a escala/posicionamento se necessário para coincidir com o grid físico 48x48.
- **Importante:** Desativar a renderização dos componentes `Floor`, `Ceiling`, `Walls` procedurais nas fases onde o modelo GLB for renderizado (ou seja, em todas as 10 fases).

---

### 3. Primeira Pessoa do Player (Mão e Lanterna)

#### [MODIFY] [PlayerRig.jsx](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/three/PlayerRig.jsx)
- Importar o asset `player_first_person_hand_flashlight.glb`.
- Substituir o grupo procedural de malhas da mão (`capsuleGeometry`, `boxGeometry`, etc.) por um componente `HandModel` que carrega a malha 3D via `useGLTF`.
- No `useFrame`, buscar o subobjeto da lente/lâmpada (procurando meshes cujo nome ou material contenha `"lens"`, `"lente"`, `"glass"` ou `"light"`) e ajustar a cor e emissividade conforme o estado da lanterna (`G.player.lanternOn`).
- Ajustar escala, rotação e translação fina para alinhar a orientação da lanterna carregada com o facho de luz do `spotLight`.

---

### 4. Iluminação Geral e Neblina (Visual Mais Sombrio)

#### [MODIFY] [LevelMesh.jsx](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/three/LevelMesh.jsx)
- Modificar o componente `Atmosphere` para tornar a neblina significativamente mais próxima do jogador:
  - Encurtar o parâmetro `far` do `THREE.Fog` para diminuir a visibilidade do jogador sob o breu total (ex: de um máximo original de `55` tiles para cerca de `15-20` tiles).
  - Escurecer a cor de fundo e da neblina padrão.
  - Atenuar a intensidade da luz ambiente global (`ambientLight`) em cerca de 50% para aumentar o contraste de sombras.

#### [MODIFY] [PlayerRig.jsx](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/three/PlayerRig.jsx)
- Limitar o alcance do facho de luz da lanterna:
  - Reduzir o multiplicador de `distance` da lanterna (tanto focado quanto aberto).
  - Diminuir um pouco a abertura da `spotLight` (`angle`) de `0.42` para algo próximo de `0.36`, concentrando a luz.
  - Atenuar a intensidade da `spotLight` de `60` para `40-45` e aumentar o `penumbra` para um fade-off mais suave nas bordas.

---

### 5. Spawn Refinado das Notas de Lore

#### [MODIFY] [mapgen.js](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/game/mapgen.js)
- Alterar a lógica de posicionamento do `m.paper` no final de `placeEntities` (aplicando a todas as dificuldades e fases):
  - Filtrar os `freeTiles` elegíveis para que a nota seja colocada a pelo menos 15 blocos de distância do spawn do jogador (`m.spawn`).
  - Filtrar para que o tile tenha pelo menos 1 vizinho do tipo parede (`TILE.WALL` ou `TILE.WALL2`), garantindo que fique "escondido" perto de uma parede/canto.
  - Se nenhum tile satisfizer a distância de 15, reduzir iterativamente o limiar (ex: para 10, depois para 5) para evitar travamentos ou ausência de spawn.
  - Definir a nota nesse local selecionado de forma robusta e procedural.

---

### 6. Estética do Papel de Lore (Nota)

#### [MODIFY] [Pickups.jsx](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/three/Pickups.jsx)
- Refatorar o componente `Paper`:
  - Substituir o icosaedro flutuante giratório por um plano 2D (`planeGeometry`) deitado próximo ao chão (`y = 0.015`), ligeiramente rotacionado para simular uma folha caída no chão (e evitar Z-fighting).
  - Remover o componente `<Glow>` pulsante exagerado.
  - Reduzir drasticamente a pointLight associada ao papel para um valor mínimo (ex: `intensity = 0.03`, `distance = 1.2`), criando apenas uma luminescência muito fraca e misteriosa que o jogador só nota se passar a lanterna diretamente por cima.

---

### 7. Ajuste na Árvore de Componentes

#### [MODIFY] [GameScreen.jsx](file:///c:/Users/TDS26/Desktop/luzfraca-1/src/screens/GameScreen.jsx)
- Importar `Suspense` de React.
- Envolver os componentes 3D no Canvas (ou o próprio Canvas) em `<Suspense fallback={null}>` para prevenir falhas de renderização síncronas causadas pelo carregamento de GLB do `useGLTF`.
- Ocultar/remover condicionalmente `<Floor>`, `<Ceiling>`, `<Walls>` e `<PropsLayer>` e adicionar o novo `<LevelModel G={G} />`.

---

## Plano de Verificação

### Testes Manuais no Navegador
1. Rodar `npm run dev` localmente.
2. Iniciar o jogo e confirmar que o novo modelo de primeira pessoa (mão e lanterna carregada) renderiza na tela de forma correta e sem falhas de carregamento.
3. Avançar as fases e inspecionar se os modelos de cada nível (`level_01.glb` a `level_10.glb`) estão posicionados perfeitamente sobre o grid 2D do mapa.
4. Testar a lanterna (ligar/desligar com `F`, focar com botão direito do mouse) e verificar se o material do filamento do mockup GLTF acende e apaga.
5. Inspecionar a nota de lore nas fases: confirmar que ela está caída no chão, rente às paredes, sem brilho excessivo e a uma distância saudável do ponto de spawn do jogador.
6. Avaliar a visibilidade sob a nova neblina escura e confirmar o clima mais sombrio.
