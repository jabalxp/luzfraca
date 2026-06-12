# LUZ FRACA — Documento de Design do Jogo (GDD Completo)

> Jogo de terror em primeira pessoa, focado em coleta, sobrevivência e lore fragmentada.
> Versão do documento: 1.0 — Documento de referência completo para desenvolvimento.

---

# PARTE 1 — O PROMPT MELHORADO

Antes de tudo, aqui está a versão melhorada e expandida do seu prompt original.
Você pode usar este prompt para gerar o jogo, apresentar a ideia para alguém,
ou como base para programar tudo do zero.

## 1.1 — Prompt Melhorado (versão final)

"Crie um jogo de terror em primeira pessoa chamado **LUZ FRACA**, onde o jogador
enxerga apenas a própria mão segurando uma lanterna. O objetivo de cada fase é
coletar moedas espalhadas pelo mapa e encontrar **1 papel de lore escondido**,
tudo isso enquanto foge de monstros que caçam o jogador ativamente.

O jogo possui **10 fases**, cada uma em um cenário completamente diferente,
com dificuldade crescente:

1. **Estádio de Futebol abandonado** — 1 monstro
2. **Walmart fechado de madrugada** — 1 monstro
3. **Backrooms** — 1 monstro
4. **Vilarejo Mexicano no Dia dos Mortos** — 1 monstro
5. **Savana Africana com vila abandonada** — 2 monstros
6. **Interior do Paraguai (folclore guarani)** — 2 monstros
7. **Base da NASA evacuada** — 2 monstros
8. **Vila rural na Ásia** — 3 monstros
9. **Ilha misteriosa no meio do oceano** — 3 monstros
10. **Templo de um culto religioso extremista** — 3 monstros

Cada mapa tem identidade visual, sonora e de gameplay própria, sempre com
atmosfera opressora: escuridão quase total, sons ambientes perturbadores,
sussurros, e a lanterna como única fonte de luz confiável.

**Condições de fim de fase:**
- O jogador MORRE se for pego por um monstro (volta ao menu, mantém as moedas
  coletadas até 50% do valor, e o contador de mortes daquela fase aumenta).
- O jogador VENCE a fase ao encontrar o papel de lore e chegar à saída.
- O jogo é ZERADO ao coletar os 10 papéis de lore (um por fase).

**Economia:** as moedas coletadas são gastas na Loja em power-ups permanentes
e consumíveis, como Lanterna Melhorada, Maior Resistência, Visão Espectral
(ver o monstro por 5 segundos no início da fase), Tênis de Corrida, Passos
Silenciosos, Segunda Chance, Detector de Papéis, entre outros.

**Menu principal** com 4 botões:
- **Jogar** — grade com as 10 fases, mostrando quais estão desbloqueadas,
  quais estão bloqueadas (cadeado) e quantas vezes o jogador morreu em cada uma.
- **Lore** — modal com os 10 papéis; os encontrados podem ser lidos na íntegra
  (história do lugar, do monstro e de como era a vida antes da tragédia),
  os não encontrados aparecem como '???'.
- **Configurações** — controle de volume (geral, música, efeitos, sustos).
- **Loja** — compra de power-ups com as moedas coletadas.

**Direção de arte:** apenas a mão com a lanterna é visível do jogador; papéis
de lore amassados e manchados com texto manuscrito; monstros com design único
por fase, sempre humanoides distorcidos ou criaturas folclóricas corrompidas.
Paleta escura, granulado de filme (film grain), vinheta nas bordas da tela e
leve aberração cromática para dar sensação de VHS/found footage."

## 1.2 — Por que essa versão é melhor que a original

- Define um **nome** para o jogo (identidade).
- Especifica **condições de vitória e derrota** com clareza (o prompt original
  só dizia "pegar moedas até morrer").
- Define a **penalidade de morte** (perder 50% das moedas da run) — isso cria
  tensão real: quanto mais você coleta, mais você tem a perder.
- Distribui os monstros de forma progressiva (1 → 2 → 3) em vez de só dizer
  "as últimas têm 3".
- Dá direção de arte concreta (VHS, granulado, vinheta) em vez de só
  "pegada aterrorizante".
- Estrutura o conteúdo da Lore em 3 blocos fixos (lugar, monstro, vida antes),
  exatamente como você pediu, mas formalizado.
- Especifica o comportamento do menu de fases (cadeado + contador de mortes).

---

# PARTE 2 — VISÃO GERAL DO JOGO

## 2.1 — Ficha técnica

| Item | Descrição |
|---|---|
| Nome | LUZ FRACA |
| Gênero | Terror / Sobrevivência / Coleta |
| Perspectiva | Primeira pessoa (apenas mão + lanterna visíveis) |
| Fases | 10 fases temáticas, dificuldade crescente |
| Duração média por fase | 5 a 15 minutos |
| Duração total estimada | 2 a 4 horas (sem contar mortes) |
| Público-alvo | 14+ (terror psicológico, sustos, temas sombrios) |
| Plataforma sugerida | PC (navegador ou executável), com suporte a mobile |
| Save | Automático (moedas, power-ups, fases, mortes, papéis) |

## 2.2 — O conceito em uma frase

"Você é apenas uma mão e uma lanterna no escuro, juntando moedas para
sobreviver e papéis para entender por que o mundo ao seu redor apodreceu."

## 2.3 — Pilares de design

1. **A lanterna é vida** — sem ela você não vê nada; com ela, os monstros
   podem te ver. Todo o jogo gira em torno desse dilema: ligar ou não ligar.
2. **Ganância mata** — as moedas ficam em lugares cada vez mais perigosos.
   O jogador decide se arrisca por mais 10 moedas ou corre para a saída.
3. **A lore é a recompensa real** — moedas compram poder, mas os papéis
   compram entendimento. Quem quer "zerar de verdade" precisa dos 10 papéis.
4. **Cada fase é um pesadelo diferente** — nada de reaproveitar monstro,
   som ou estética. O jogador nunca sabe o que esperar da próxima fase.
5. **Morrer ensina** — cada morte revela um pouco do padrão do monstro.
   O contador de mortes não é vergonha: é cicatriz de aprendizado.

## 2.4 — Loop de gameplay (o ciclo que se repete)

1. Jogador escolhe uma fase desbloqueada no menu **Jogar**.
2. (Opcional) Gasta moedas na **Loja** antes de entrar.
3. Entra na fase: escuridão, sons ambientes, lanterna na mão.
4. Explora o mapa coletando **moedas** (brilho dourado fraco).
5. Escuta/observa pistas do(s) **monstro(s)** e desvia das rotas deles.
6. Encontra o **papel de lore** (sempre escondido na área mais perigosa).
7. Corre até a **saída** (que só abre depois de pegar o papel).
8. Vence → desbloqueia a próxima fase e libera a leitura do papel no menu Lore.
9. Morre → perde 50% das moedas da run, +1 no contador de mortes, volta ao menu.
10. Repete, agora mais forte (power-ups) e mais esperto (conhecimento do mapa).

---

# PARTE 3 — MECÂNICAS PRINCIPAIS

## 3.1 — Movimentação

- **Andar**: velocidade base 3,5 m/s. Faz pouco barulho.
- **Correr**: 6,5 m/s. Consome **estamina** e faz MUITO barulho
  (monstros com audição detectam corrida a até 25 metros).
- **Agachar**: 1,8 m/s. Quase silencioso. Permite passar sob mesas,
  prateleiras e entrar em esconderijos baixos.
- **Estamina**: barra invisível (o jogador "sente" pela respiração ofegante
  do personagem). Dura 5 segundos de corrida no nível base. Recupera em
  8 segundos parado ou andando.
- **Respiração**: quando a estamina zera, o personagem ofega alto por
  3 segundos — nesse período, monstros ouvem você a 15 metros.

## 3.2 — A Lanterna (mecânica central)

A lanterna é o coração do jogo. Regras:

- **Bateria**: dura 100 segundos de uso contínuo no nível base.
  Pilhas espalhadas pelo mapa recarregam 40%.
- **Ligar/desligar**: tecla F (ou toque no ícone, no mobile). O clique
  do botão da lanterna faz um som baixinho — monstros muito próximos
  (menos de 5 metros) podem ouvir.
- **Foco**: segurar o botão direito do mouse aperta o foco da luz,
  iluminando mais longe porém num cone mais estreito.
- **Luz atrai**: alguns monstros são atraídos pela luz (descrito em cada
  fase). Outros são cegos e só ouvem. O jogador precisa DESCOBRIR qual
  é qual — os papéis de lore dão dicas disso.
- **Tremor**: quando um monstro está a menos de 10 metros, a mão do
  jogador começa a tremer levemente e a luz oscila. Esse é o "radar
  natural" do jogo.
- **Lanterna fraca proposital**: no nível base, a luz alcança apenas
  6 metros, com halo amarelado e bordas escuras. Upgrades melhoram isso.

## 3.3 — Moedas

- Aparência: moedas antigas, enferrujadas, com um brilho dourado fraco
  que pulsa devagar (visível mesmo no escuro, a até 8 metros).
- Som ao coletar: um "clink" metálico abafado — cuidado, monstros a menos
  de 8 metros ouvem o clink.
- Quantidade por fase: aumenta com a dificuldade (ver tabela na Parte 7).
- Posicionamento: 60% das moedas em rotas seguras, 30% em rotas de
  patrulha dos monstros, 10% em "zonas de morte" (valem o dobro).
- **Morte = perde 50% das moedas coletadas NA RUN** (as moedas já salvas
  no banco, de runs anteriores, ficam intactas).
- **Vitória = mantém 100% + bônus de conclusão da fase.**

## 3.4 — Os Papéis de Lore

- 1 papel por fase, total de 10.
- Aparência: papel amassado, amarelado, manchado (sangue? café? mofo?),
  com texto manuscrito apressado. Cada fase tem uma "caligrafia" diferente,
  porque cada papel foi escrito por uma vítima diferente.
- Brilho: branco-azulado fraco, pulsando — diferente do dourado das moedas.
- Localização: SEMPRE na área mais perigosa do mapa (centro da patrulha
  do monstro, sala sem saída, local que exige rota arriscada).
- Ao pegar o papel: toca um sting sonoro grave, a frase "ENCONTRE A SAÍDA"
  aparece sussurrada na tela, e a saída da fase se abre (com um som de
  porta destrancando ecoando pelo mapa — os monstros também ouvem e ficam
  20% mais rápidos a partir desse momento: o "modo fúria").
- O papel só pode ser LIDO no menu Lore, depois de vencer a fase.
  Durante a fase, não dá tempo de ler — você precisa correr.

## 3.5 — Esconderijos

Cada mapa tem esconderijos temáticos (armários, geladeiras, arquibancadas,
caixotes, confessionários...). Regras:

- Entrar/sair leva 1 segundo (animação da mão abrindo a porta).
- Dentro do esconderijo, a visão fica por frestas (efeito de persiana).
- Se um monstro VIU você entrar, ele abre o esconderijo. Morte certa.
- Se ele apenas suspeita, ele para na frente, "fareja" por 4 segundos
  (momento de pavor máximo: respiração do monstro do outro lado da porta)
  e vai embora.
- Mecânica de **prender a respiração**: segurar espaço dentro do
  esconderijo silencia o personagem por até 6 segundos. Soltar tarde
  demais causa um arquejo ALTO que entrega sua posição.

## 3.6 — Detecção dos monstros (IA)

Todo monstro tem três sentidos, com pesos diferentes por criatura:

- **Visão**: cone de visão; luz da lanterna apontada para ele = detecção
  instantânea; jogador no escuro parado = quase invisível.
- **Audição**: passos, corrida, clink de moedas, clique da lanterna,
  arquejo, portas. Cada som tem um raio de alcance.
- **Faro/Instinto**: alguns monstros "sentem" o jogador se ele ficar
  parado no mesmo lugar por mais de 30 segundos (anti-camping).

Estados da IA:
1. **Patrulha** — rota fixa ou semialeatória, lenta.
2. **Suspeita** — ouviu/viu algo; investiga o ponto do estímulo.
3. **Caçada** — viu o jogador; persegue na velocidade máxima com música
   de perseguição exclusiva da fase.
4. **Fúria** — após o papel ser coletado; +20% velocidade, patrulha
   focada entre o jogador e a saída.

## 3.7 — Morte

- Animação curta em primeira pessoa, única por monstro (jumpscare).
- Tela corta para preto com som característico da fase.
- Estatística de mortes da fase +1 (mostrada no menu Jogar).
- Perde 50% das moedas coletadas naquela run.
- Mensagem de morte temática (ex.: no Estádio — "O jogo acabou para você.").

---

# PARTE 4 — POWER-UPS E LOJA

## 4.1 — Power-ups que você pediu (refinados)

### 1. Lanterna Melhorada (permanente, 3 níveis)
- **Nível 1 — Lanterna de Aço** (80 moedas): alcance 6m → 9m, bateria +30%.
- **Nível 2 — Lanterna Tática** (200 moedas): alcance 9m → 13m, luz mais
  branca, bateria +60%, foco mais apertado.
- **Nível 3 — Farol de Mão** (450 moedas): alcance 18m, bateria +100%,
  e o modo foco pode CEGAR monstros sensíveis à luz por 2 segundos
  (1 uso a cada 60 segundos).

### 2. Maior Resistência (permanente, 3 níveis)
- **Nível 1 — Fôlego de Corredor** (70 moedas): corrida 5s → 8s.
- **Nível 2 — Pulmões de Ferro** (180 moedas): corrida 8s → 12s,
  recuperação 8s → 5s.
- **Nível 3 — Maratonista do Medo** (400 moedas): corrida 12s → 16s,
  o arquejo pós-corrida fica 50% mais silencioso.

### 3. Visão Espectral (consumível, 1 uso por fase)
- **Custo:** 60 moedas por unidade (pode estocar até 5).
- Ao iniciar a fase, por **5 segundos**, todos os monstros aparecem com
  uma silhueta vermelha brilhando através das paredes, e suas rotas de
  patrulha são desenhadas no chão como rastros de fumaça.
- Nas fases com 3 monstros, é quase obrigatório.

## 4.2 — Novos power-ups (as ideias que você pediu)

### Permanentes (compra uma vez, vale para sempre)

4. **Tênis de Corrida** (150 moedas)
   - Velocidade de corrida +15%. Não afeta o barulho.

5. **Passos de Algodão** (220 moedas)
   - Raio de detecção dos seus passos cai 40%. Andar agachado fica
     100% silencioso. O power-up mais valioso para jogadores stealth.

6. **Ímã de Moedas** (130 moedas)
   - Moedas num raio de 3 metros voam até você. Além de cômodo,
     é estratégico: você pega moedas de zonas perigosas sem entrar nelas.
     E o melhor: moedas atraídas pelo ímã NÃO fazem o som de "clink".

7. **Coração Calmo** (250 moedas)
   - Remove o tremor da mão quando o monstro está perto... espera, isso
     seria ruim! Na verdade: reduz o tempo de "pânico" — depois de quase
     ser pego, a tela fica embaçada por 3s no jogo base; com este power-up,
     apenas 1s. Também aumenta o tempo de prender a respiração de 6s → 10s.

8. **Mapa Rabiscado** (300 moedas)
   - Desbloqueia um minimapa desenhado à mão (carvão sobre papel sujo)
     no canto da tela. Mostra apenas paredes e a SUA posição — nunca
     os monstros, nunca os itens. Some quando um monstro está em caçada
     (a mão guarda o mapa para correr).

9. **Bolsos Fundos** (350 moedas)
   - Ao morrer, você perde apenas 25% das moedas da run (em vez de 50%).

10. **Radar de Batimentos** (280 moedas)
    - Um batimento cardíaco grave toca quando qualquer monstro está a
      menos de 15 metros, acelerando conforme ele se aproxima.
      Funciona como sonar emocional — você nunca mais será pego "do nada",
      mas o som constante também aumenta SUA tensão.

11. **Pé de Coelho** (320 moedas)
    - 25% de chance de um monstro em estado de Caçada "perder seu rastro"
      ao virar uma esquina, voltando ao estado de Suspeita.

### Consumíveis (compra unidades, gasta ao usar)

12. **Pilha Reserva** (25 moedas)
    - Recarrega 50% da bateria da lanterna. Usável no meio da fase.
      Limite: 3 por fase.

13. **Segunda Chance** (120 moedas)
    - Se um monstro te pegar, em vez de morrer você é "jogado longe":
      tela pisca branca, você acorda a 20 metros, com 1 segundo de
      vantagem e o coração disparado. 1 uso por fase. Não funciona
      na fase 10 (o Deus Cego não dá segundas chances — e a loja avisa isso).

14. **Sino de Lata** (40 moedas)
    - Item arremessável. Joga em uma direção; o barulho atrai todos os
      monstros ouvintes para o ponto do impacto por 10 segundos.
      Limite: 2 por fase.

15. **Incenso Frio** (90 moedas)
    - Ao usar, você fica "sem cheiro" por 60 segundos: o sentido de
      Faro/Instinto dos monstros é desativado. Essencial contra
      criaturas que farejam (fases 5, 6 e 9).

16. **Adrenalina** (75 moedas)
    - Injeção de uso único: 5 segundos de corrida SEM gastar estamina
      e +30% de velocidade. O coração bate tão alto que TODOS os monstros
      do mapa sabem onde você está durante o efeito. Item de fuga
      desesperada, não de exploração.

17. **Bússola da Lore** (100 moedas)
    - Por 15 segundos, uma seta de fumaça azulada aponta a direção
      (não o caminho) do papel de lore. 1 uso por fase.

## 4.3 — Regras gerais da Loja

- A Loja é acessível pelo menu principal E na tela de preparação
  (entre escolher a fase e começar — "última chance de gastar").
- Itens permanentes mostram os 3 níveis com preços e o que cada um dá.
- Consumíveis mostram quantos você tem em estoque.
- Tudo é comprável com moedas do jogo. **Sem dinheiro real. Nunca.**
- Interface da loja: um balcão escuro, iluminado por uma vela, com um
  "Vendedor" que nunca aparece — só uma voz rouca que comenta as compras
  ("Boa escolha." / "Isso não vai te salvar lá embaixo." / "Volte vivo.").
- O Vendedor é, secretamente, parte da lore (ver Parte 6, papel 10).

## 4.4 — Tabela-resumo de preços

| Power-up | Tipo | Preço | Efeito-chave |
|---|---|---|---|
| Lanterna de Aço | Permanente N1 | 80 | Alcance 9m |
| Lanterna Tática | Permanente N2 | 200 | Alcance 13m |
| Farol de Mão | Permanente N3 | 450 | Alcance 18m + cegar |
| Fôlego de Corredor | Permanente N1 | 70 | Corrida 8s |
| Pulmões de Ferro | Permanente N2 | 180 | Corrida 12s |
| Maratonista do Medo | Permanente N3 | 400 | Corrida 16s |
| Visão Espectral | Consumível | 60 | Ver monstros 5s |
| Tênis de Corrida | Permanente | 150 | +15% velocidade |
| Passos de Algodão | Permanente | 220 | -40% ruído |
| Ímã de Moedas | Permanente | 130 | Coleta a 3m |
| Coração Calmo | Permanente | 250 | Fôlego 10s |
| Mapa Rabiscado | Permanente | 300 | Minimapa |
| Bolsos Fundos | Permanente | 350 | Perde só 25% |
| Radar de Batimentos | Permanente | 280 | Alerta sonoro |
| Pé de Coelho | Permanente | 320 | 25% escapar |
| Pilha Reserva | Consumível | 25 | +50% bateria |
| Segunda Chance | Consumível | 120 | Sobrevive 1 ataque |
| Sino de Lata | Consumível | 40 | Distração |
| Incenso Frio | Consumível | 90 | Anti-faro 60s |
| Adrenalina | Consumível | 75 | Fuga turbo |
| Bússola da Lore | Consumível | 100 | Aponta o papel |

---

# PARTE 5 — AS 10 FASES EM DETALHE

Estrutura de cada fase: ambientação, layout, sons, monstros (aparência,
comportamento, como sobreviver), moedas, localização do papel, e a
mensagem de morte temática.

---

## FASE 1 — "APITO FINAL" (Estádio de Futebol)

**Dificuldade:** ★☆☆☆☆ | **Monstros:** 1 | **Moedas no mapa:** 60

### Ambientação
Um estádio municipal abandonado desde "o acidente". Gramado morto e alto,
refletores quebrados (um deles pisca sozinho de vez em quando, iluminando
o campo por meio segundo — e às vezes revelando uma silhueta nas
arquibancadas). Vestiários alagados, túnel de acesso com pichações
desesperadas ("ELE AINDA TORCE", "NÃO COMEMORE"), placar travado em
**2 x 1, minuto 89**. Bandeiras rasgadas balançam sem vento.

### Layout
- **Campo central**: aberto, perigoso, cheio de moedas (tentação clássica).
- **Arquibancadas**: anéis superiores e inferiores, com corredores estreitos.
- **Vestiários + túnel**: labirinto apertado, esconderijos em armários de aço.
- **Cabines de imprensa**: ponto alto, ótimo para observar a patrulha.
- **Saída**: portão de manutenção atrás do gol sul (abre após pegar o papel).

### Sons
Vento entre as cadeiras, gotejamento nos vestiários, um apito de árbitro
distante que toca sozinho a cada ~90 segundos (sem relação com o monstro —
puro terror psicológico), e ocasionalmente... uma torcida. Uma fração de
segundo de 40 mil vozes gritando "GOL", cortada no meio.

### Monstro: O 12º JOGADOR
- **Aparência:** um corpo de 2,3 metros vestindo um uniforme de time
  encharcado e podre, número 12 nas costas. Não tem rosto — só uma
  superfície lisa de pele esticada, com a marca de uma bola estampada,
  como se tivesse levado uma bolada forte demais... para sempre.
  Corre como um atleta: postura perfeita, braços cadenciados. Isso é
  o pior: ele corre BONITO, e isso é profundamente errado.
- **Sentidos:** audição excelente (era torcedor: vive de som), visão ruim.
  A lanterna quase não o atrai. Corra perto dele e ele te acha.
- **Comportamento:** patrulha a linha lateral do campo dando voltas, como
  num aquecimento eterno. Quando ouve algo, ele PARA, vira a cabeça lisa
  na direção do som, e bate palmas três vezes (o som ecoa no estádio
  inteiro). Depois, corre em linha reta até o ponto.
- **Como sobreviver:** ande agachado pelas arquibancadas, nunca corra no
  campo aberto, use o apito ambiental para mascarar seus passos.
- **Mensagem de morte:** *"O jogo acabou para você. Ele finalmente comemorou."*

### Papel de lore
Escondido **no centro do gramado, sobre a marca do pênalti** — o lugar
mais exposto do mapa, dentro da rota de patrulha.

---

## FASE 2 — "PREÇO BAIXO" (Walmart)

**Dificuldade:** ★★☆☆☆ | **Monstros:** 1 | **Moedas no mapa:** 75

### Ambientação
Um hipermercado gigante, 3h da manhã, luzes 95% apagadas. As poucas
lâmpadas vivas piscam em setores aleatórios. Prateleiras de 4 metros
formam corredores-labirinto. Carrinhos abandonados no meio dos corredores
(esbarrar em um = barulho = morte). O sistema de som da loja ainda
funciona: a cada poucos minutos, uma voz distorcida e arrastada anuncia
*"Promoçããão... no corredor... sete..."* — e o monstro VAI até o corredor
anunciado. Use isso a seu favor.

### Layout
- **Corredores de mercado**: grade 8x6 de prateleiras altas.
- **Açougue/frios**: câmara fria com porta pesada (esconderijo, mas a porta
  faz barulho e o frio embaça a tela depois de 20 segundos lá dentro).
- **Estoque dos fundos**: empilhadeiras, caixas, escuridão total.
- **Caixas registradores**: zona aberta perto da saída; os caixas às vezes
  se abrem sozinhos com aquele "TRIM" — atraindo o monstro.
- **Saída**: doca de carga no estoque.

### Sons
Zumbido de freezer, lâmpada fluorescente estalando, rodinha de carrinho
girando sozinha em algum lugar, o jingle da loja tocando a 0,5x da
velocidade em volume baixíssimo.

### Monstro: O REPOSITOR
- **Aparência:** veste o colete azul da loja sobre um corpo magro demais,
  com braços que dobram em articulações extras. O crachá diz "FUNCIONÁRIO
  DO MÊS — 37 MESES SEGUIDOS". O rosto é um sorriso de atendimento ao
  cliente esticado até as orelhas, com olhos que não piscam. Anda
  empurrando um carrinho — e o som das rodinhas é como você o rastreia.
- **Sentidos:** visão boa em linha reta (corredores!), audição média.
  É ATRAÍDO pela lanterna: luz acesa em seu cone de visão = caçada.
- **Comportamento:** "repõe" produtos eternamente. Se vê o jogador,
  ABANDONA O CARRINHO (você ouve o carrinho parar — péssimo sinal,
  porque agora ele é silencioso) e dispara de quatro por cima das
  prateleiras.
- **Como sobreviver:** rastreie o som do carrinho. Carrinho rodando =
  você está seguro. Carrinho parado = esconda-se JÁ. Use os anúncios de
  "promoção" para saber para onde ele vai.
- **Mensagem de morte:** *"Obrigado por comprar conosco. Volte sempre.
  Você VAI voltar sempre."*

### Papel de lore
Na **sala do gerente**, nos fundos do estoque — a sala tem uma janela
interna de vidro: pegar o papel dispara o alarme silencioso (luz vermelha
girando, sem som) e o Repositor entra em fúria imediatamente.

---

## FASE 3 — "FORA DO MAPA" (Backrooms)

**Dificuldade:** ★★☆☆☆+ | **Monstros:** 1 | **Moedas no mapa:** 85

### Ambientação
O clássico: carpete úmido amarelo-mostarda, paredes de papel de parede
amarelado, lâmpadas fluorescentes zumbindo em um tom de 60Hz que nunca
para. Corredores que não fazem sentido arquitetônico. Aqui, a lanterna
é quase inútil (o ambiente é iluminado) — o terror é a MONOTONIA: tudo
é igual, e você nunca sabe se já passou por ali.

**Mecânica exclusiva da fase:** o mapa se **reorganiza** quando você não
está olhando. Corredores às vezes mudam atrás de você (com um som baixo
de "arrastar de mobília"). O Mapa Rabiscado (power-up) não funciona aqui —
o desenho aparece borrado, e a loja avisa isso antes.

### Layout
- Labirinto procedural de salas amarelas com 3 "âncoras" fixas:
  a **sala das pilastras**, a **sala alagada** (carpete encharcado — andar
  nela faz "splash") e a **sala escura** (única sala sem luz do mapa).
- **Saída**: um buraco rasgado na parede que só se torna visível depois
  do papel ("no-clip de volta").

### Sons
Zumbido eterno das lâmpadas (que MUDA DE TOM quando o monstro está a
menos de 20 metros — preste atenção), seus próprios passos no carpete,
e ocasionalmente passos idênticos aos seus, meio segundo atrasados.

### Monstro: O ERRANTE
- **Aparência:** uma figura amarela e alongada, da cor exata das paredes,
  de 2,5 metros, sem características — como se alguém tivesse esculpido
  um humano usando o próprio papel de parede. Quando está parado encostado
  numa parede, é QUASE invisível.
- **Sentidos:** não vê e não ouve. Ele **sente vibração** no carpete.
  Correr = ele te localiza na hora. Andar = detecta a 10 metros.
  Agachado = 3 metros.
- **Comportamento:** vagueia aleatoriamente. Quando detecta vibração,
  não corre: ele **desliza** pelas paredes na sua direção, rápido e em
  silêncio total. O único aviso é o zumbido das lâmpadas mudando de tom.
- **Como sobreviver:** movimento lento e pausado. Pare totalmente a cada
  poucos segundos. Na sala alagada, cada passo é um alarme — atravesse-a
  só se necessário.
- **Mensagem de morte:** *"Você sempre esteve fora do mapa. Agora o mapa
  está dentro de você."*

### Papel de lore
Na **sala escura** — a única sala onde você PRECISA da lanterna, e onde
o Errante (da cor das paredes) é finalmente visível no facho... se ele
estiver lá dentro com você.

---

## FASE 4 — "FLOR DE CEMPASÚCHIL" (Vilarejo Mexicano)

**Dificuldade:** ★★★☆☆ | **Monstros:** 1 | **Moedas no mapa:** 95

### Ambientação
Um povoado mexicano na noite do Día de los Muertos — mas a festa parou
no meio. Mesas postas com comida intocada e apodrecida, papel picado
colorido balançando entre os postes, velas acesas POR TODA PARTE (única
fase com bastante luz ambiente, toda tremulante e laranja), caminhos de
pétalas de cempasúchil (a flor laranja dos mortos) cortando as ruas.
Caveiras de açúcar nas janelas — e todas viram o rosto para acompanhar
você quando passa (puro visual; elas não fazem nada... provavelmente).

**Mecânica exclusiva:** os **caminhos de pétalas** são as rotas que A
CHORONA não pisa (foram feitos para guiar os mortos, e ela se recusa a
segui-los). Andar sobre as pétalas é seguro... mas as pétalas se apagam
(murcham) atrás de você conforme as usa. Recurso finito.

### Sons
Um violão desafinado tocando sozinho em alguma casa, vento com sinos,
e o som-assinatura da fase: um choro de mulher, distante, que fica MAIS
BAIXO quanto mais perto ela está (lore real da Llorona — quando o choro
parece longe, ela está do seu lado).

### Monstro: A CHORONA (La Llorona reimaginada)
- **Aparência:** vestido branco de noiva encharcado, cabelo preto cobrindo
  o rosto, flutua a centímetros do chão deixando um rastro de água. Quando
  ergue o rosto, não há olhos — só duas cavidades vertendo água sem parar.
- **Sentidos:** ela não usa visão nem audição comuns. Ela sente **calor
  de gente viva** num raio que cresce conforme a fase avança (8m no
  início, 16m perto do fim). As velas confundem o sentido dela — ficar
  perto de velas reduz seu "calor" detectável pela metade.
- **Comportamento:** vagueia chorando pelas ruas procurando "seus filhos".
  Quando detecta o jogador, o choro PARA. Silêncio total. Então ela
  aparece flutuando rápido, em linha reta, atravessando cercas e muros
  baixos.
- **Como sobreviver:** ouça o volume do choro (alto = longe, baixo =
  PERTO, silêncio = CORRA), use os caminhos de pétalas com sabedoria
  e fique perto das velas.
- **Mensagem de morte:** *"Ela finalmente encontrou um de seus filhos."*

### Papel de lore
Dentro da **igreja do povoado**, sobre o altar de ofrendas — o único
prédio SEM velas acesas, onde o sentido de calor dela funciona a 100%.

---

## FASE 5 — "A NOITE SEM TAMBORES" (Savana Africana)

**Dificuldade:** ★★★☆☆+ | **Monstros:** 2 | **Moedas no mapa:** 110

### Ambientação
Uma vila rural na savana, abandonada há semanas. Capim alto até o peito
(esconde você... e esconde ELES), baobás retorcidos contra um céu
estrelado absurdo — a única fase com céu bonito, o que torna tudo pior.
Cabanas de barro com portas arrancadas PARA FORA. Um poço central com
uma corda que desce... e a corda está esticada, como se algo pendurado
nela ainda pesasse. Fogueiras apagadas com panelas cheias.

**Mecânica exclusiva:** o **capim alto** esconde o jogador da visão dos
monstros, mas o capim BALANÇA quando você anda nele — e o Adze enxerga
o balanço de cima.

### Sons
Insetos noturnos que CALAM em ondas (o silêncio viaja pelo mapa
acompanhando a posição do Impundulu — use os grilos como radar), vento
no capim, e um tambor. Um único tambor, batendo devagar, em algum lugar.
A batida acelera quando qualquer monstro entra em estado de caçada.

### Monstro 1: O IMPUNDULU (pássaro-relâmpago do folclore zulu)
- **Aparência:** uma ave do tamanho de um homem, penas pretas que soltam
  faíscas estáticas, garras de ferro. Pousado, parece um velho corcunda
  de casaco de penas. Voando, é uma sombra que apaga as estrelas.
- **Sentidos:** visão aérea excelente — vê o capim balançando e a luz da
  lanterna de muito longe. Surdo.
- **Comportamento:** circula o mapa voando. A cada 40-70 segundos, pousa
  num telhado ou baobá e VARRE a área com o olhar (os olhos dele brilham
  vermelho — você consegue ver para onde ele olha). Se te vê: mergulho
  em ataque, precedido por um trovão seco.
- **Como sobreviver:** lanterna APAGADA em áreas abertas, mover-se quando
  ele está voando longe, congelar quando ele pousa.

### Monstro 2: O ADZE (vagalume vampírico do folclore ewe)
- **Aparência:** na forma pequena, um vagalume de luz alaranjada doentia,
  voando baixo entre o capim — fácil confundir com uma MOEDA brilhando
  (armadilha de design proposital: olhe duas vezes antes de coletar).
  Quando chega perto da vítima, explode na forma verdadeira: um corpo
  seco e curvado, pele de couro, mandíbula de inseto.
- **Sentidos:** faro. Ele segue seu RASTRO pelo capim, farejando o caminho
  por onde você passou (o capim que você pisou fica levemente marcado).
- **Comportamento:** lento porém implacável — um caçador de trilha.
  Voltar pelo próprio caminho é entregar-se a ele.
- **Como sobreviver:** nunca refaça sua rota; ande em círculos amplos;
  o Incenso Frio (loja) anula o faro dele por 60 segundos.
- **Mensagem de morte (qualquer um):** *"Os tambores pararam. A vila tem
  um novo morador."*

### Papel de lore
**No fundo do poço central.** Você precisa descer pela corda (animação
lenta, 8 segundos, vulnerável) — e descobrir o que pesa na corda.

---

## FASE 6 — "SÉTIMO FILHO" (Interior do Paraguai)

**Dificuldade:** ★★★★☆ | **Monstros:** 2 | **Moedas no mapa:** 120

### Ambientação
Uma estância no interior paraguaio, madrugada de lua cheia, neblina baixa
cobrindo o chão de terra vermelha. Casarão colonial com varandas podres,
plantação de erva-mate crescida demais formando paredes vegetais, um
curral vazio com a porteira batendo no vento, e uma capelinha de beira
de estrada cheia de fitas e promessas. Cruzes de madeira improvisadas
no quintal — sete cruzes. Seis com nomes. Uma em branco.

A fase usa o folclore guarani DE VERDADE, o que a torna especial: aqui os
monstros são o **Luison** e o **Pombero**, lendas reais do Paraguai.

### Sons
Cigarras, a porteira rangendo, um assobio fino que imita pássaros (é o
Pombero — ele imita aves, mas sempre erra ligeiramente a melodia), e
nas noites de caçada, um uivo que não é de lobo nem de homem.

### Monstro 1: O LUISON (o sétimo filho amaldiçoado)
- **Aparência:** o lobisomem guarani — mas não um lobo bonito de filme:
  um homem quebrado dobrado em forma de cão, pelos ralos sobre pele
  cinzenta, cheiro de cemitério (a lenda diz que ele se alimenta nos
  cemitérios). Os olhos são tristes. É o único monstro do jogo que
  parece SOFRER por ser o que é.
- **Sentidos:** faro absurdo (melhor do jogo até aqui) e boa audição.
  Visão ruim — a forma dele é quase cega.
- **Comportamento:** patrulha o perímetro externo. Se fareja o jogador,
  uiva (alerta o mapa todo, incluindo o Pombero) e segue o cheiro.
- **Como sobreviver:** Incenso Frio, andar contra o vento (a fase TEM
  direção de vento, indicada pela neblina), atravessar o riacho da
  propriedade corta seu rastro de cheiro.

### Monstro 2: O POMBERO (o dueño de la noche)
- **Aparência:** baixinho (1,2m), atarracado, coberto de pelos, pés
  virados para trás (as pegadas dele apontam para a direção ERRADA —
  detalhe da lenda real usado como mecânica: rastrear as pegadas dele
  te leva para LONGE dele, ou seja, siga as pegadas!). Chapéu de palha
  enorme escondendo o rosto.
- **Sentidos:** audição sobrenatural. Ele é o dono dos sons da noite.
- **Comportamento:** o mais INTELIGENTE até aqui: ele não patrulha —
  ele ARMA EMBOSCADAS. Apaga velas, fecha portas que você deixou
  abertas, derruba objetos longe de você para te assustar e te fazer
  CORRER (e aí o Luison ouve a corrida). Os dois caçam em dupla sem
  saber: o Pombero assusta, o Luison mata.
- **Como sobreviver (lenda real):** deixar uma **oferenda**. A fase tem
  3 garrafas de caña (aguardente) e potes de mel escondidos; deixar um
  numa clareira faz o Pombero parar 90 segundos para "aceitar o presente".
- **Mensagem de morte:** *"No interior, todo mundo sabe: à noite, a terra
  não é mais sua."*

### Papel de lore
Pregado na **sétima cruz** (a sem nome) do quintal — bem no cruzamento
das rotas dos dois monstros.

---

## FASE 7 — "CONTAGEM REGRESSIVA" (Base da NASA)

**Dificuldade:** ★★★★☆+ | **Monstros:** 2 | **Moedas no mapa:** 135

### Ambientação
Um centro de lançamento evacuado às pressas: café ainda nos copos,
crachás no chão, telas de monitoramento piscando "SINAL PERDIDO — SPEC-7".
Corredores estéreis com luz de emergência vermelha girando, hangar
gigante com um foguete inacabado nas sombras, sala de controle com
dezenas de monitores (alguns mostram CÂMERAS DO PRÓPRIO MAPA — dá para
ver os monstros por elas!), e a quarentena: uma ala selada com plástico,
de onde vem um som de respiração mecânica.

**Mecânica exclusiva:** a **sala de controle** permite ver 6 câmeras do
mapa, mas usar as câmeras deixa você parado e cego ao redor. Além disso,
a cada 5 minutos, a base inicia uma "contagem regressiva" nos alto-falantes
(10... 9... 8...) e ao chegar no zero TODAS as luzes apagam por 20 segundos
— os 20 segundos mais perigosos do jogo até aqui.

### Monstro 1: SPEC-7, "O ASTRONAUTA"
- **Aparência:** um traje espacial completo andando devagar, visor
  espelhado e rachado. Algo se move DENTRO do traje de um jeito que
  não combina com um corpo humano — como se várias coisas pequenas
  preenchessem o uniforme. Do rádio do traje, sai uma transmissão em
  loop: *"Houston... estamos... tão... cheios..."*
- **Sentidos:** o visor escaneia em infravermelho — ele vê SEU CALOR
  através de paredes finas a até 8 metros. Audição abafada pelo capacete.
- **Comportamento:** patrulha lenta e pesada (passos magnéticos: CLONC...
  CLONC...). Impossível de despistar pelo som — você sempre sabe onde
  ele está, e ele quase sempre sabe onde você está. Um jogo de xadrez.
- **Como sobreviver:** a câmara fria do refeitório e os dutos de
  ventilação mascaram seu calor.

### Monstro 2: A AMOSTRA (o que voltou no contêiner)
- **Aparência:** uma massa negra brilhante e líquida que escorre por
  dutos, ralos e frestas. Nas câmeras, aparece como interferência.
  Forma um "corpo" só na hora de atacar: uma silhueta humana de petróleo
  com dedos longos demais.
- **Sentidos:** percebe ELETRICIDADE — sua lanterna LIGADA é um farol
  para ela. Com a lanterna apagada, ela é praticamente cega a você.
- **Comportamento:** viaja pelo teto e pelas paredes (você ouve um
  gotejar viscoso acima de você — OLHE PARA CIMA). Ela ADORA a contagem
  regressiva: no apagão, ela desce para o chão e varre os corredores.
- **Como sobreviver:** dilema cruel — a lanterna te protege do escuro
  mas atrai a Amostra; o Astronauta vê seu calor mesmo no escuro.
  Cada monstro pune uma estratégia. O jogador precisa alternar.
- **Mensagem de morte:** *"O espaço sempre esteve vazio. Nós é que
  trouxemos companhia."*

### Papel de lore
Dentro da **ala de quarentena**, presa na mão de um corpo em um leito —
atravessando o plástico, na zona onde a respiração mecânica fica alta
demais para você ouvir qualquer monstro chegando.

---

## FASE 8 — "A VILA QUE REVERENCIA" (Ásia rural)

**Dificuldade:** ★★★★★ | **Monstros:** 3 | **Moedas no mapa:** 150

### Ambientação
Uma vila de montanha no leste asiático, inverno, neve fina caindo sem
parar. Lanternas de papel vermelhas acesas (quem as acende?), torii e
santuários de pedra cobertos de musgo, casas de madeira e papel de
arroz — **as paredes de papel mostram SOMBRAS do que está do outro
lado**, mecânica central da fase: você vê silhuetas dos monstros através
das paredes, e eles veem a SUA. Um sino de templo no alto da vila toca
sozinho de hora em hora. A neve guarda PEGADAS — suas e deles.

### Os três monstros caçam em ecossistema:

### Monstro 1: A DAMA DO ANDAR DE CIMA
- **Aparência:** mulher de kimono branco funerário, cabelo preto até o
  chão, que anda APENAS pelos telhados e andares superiores, de quatro,
  com movimentos de stop-motion travado.
- **Sentidos/comportamento:** olha pelas janelas de cima para baixo,
  procurando movimento nas ruas. Nunca desce ao térreo... até a fase
  final dela: se ela te vê três vezes (mesmo de relance), na terceira
  ela DESCE — e aí não para mais. Um contador de "olhares" discreto
  (três pétalas brancas no canto da tela) marca quantas vezes ela te viu.

### Monstro 2: O MONGE OCO
- **Aparência:** um monge de costas, sempre de costas, varrendo neve com
  uma vassoura de bambu, em pontos aleatórios da vila. Por dentro do
  manto, não há nada — só escuridão e um sino pendurado onde seria o
  coração.
- **Sentidos/comportamento:** ele NÃO reage a som nem luz. Ele reage a
  SER VISTO: se o seu olhar (centro da tela) ficar sobre ele por mais
  de 2 segundos acumulados, o sino interno dele toca uma vez... e ele
  começa a te seguir, sempre de costas, sempre varrendo, cada vez mais
  perto a cada vez que você desvia o olhar. Não olhe para o monge.
- **Inspiração:** terror de "não olhe" (estilo Weeping Angels invertido).

### Monstro 3: KARA-KASA (o guarda-chuva)
- **Aparência:** um guarda-chuva de papel óleo vermelho, parado na neve.
  Há centenas de guarda-chuvas decorativos na vila. Um deles tem uma
  perna única e um olho. Ele se mistura aos outros.
- **Sentidos/comportamento:** fica imóvel entre os guarda-chuvas normais.
  Quando o jogador passa a menos de 3 metros do FALSO, ele dá um bote.
  Dica de sobrevivência: o Kara-Kasa derrete a neve embaixo de si —
  procure o único guarda-chuva SEM neve acumulada em cima.
- **Mensagem de morte (qualquer um):** *"A vila reverencia quem chega.
  A vila não deixa ninguém partir sem se curvar."*

### Papel de lore
No **altar do templo no topo da vila** — subir até lá significa cruzar
o território dos três, e o sino do templo toca quando você pega o papel,
colocando os TRÊS em fúria para a descida.

---

## FASE 9 — "A ILHA QUE CHAMA" (Ilha suspeita no oceano)

**Dificuldade:** ★★★★★+ | **Monstros:** 3 | **Moedas no mapa:** 170

### Ambientação
Uma ilha que não está em mapa nenhum. Seu barco naufragou (cutscene de
abertura: a mão segurando a lanterna emergindo da água). Praia de areia
preta com DEZENAS de outros barcos naufragados de épocas diferentes —
um navio a vapor, um pesqueiro, um iate moderno. Floresta fechada,
um farol APAGADO no penhasco (que acende sozinho em momentos-chave,
varrendo a ilha com luz — a luz do farol REVELA você para os monstros
se te pegar no facho), e no centro da ilha... degraus de pedra descendo
para um templo submerso que respira: a água do poço central sobe e
desce como um pulmão.

**Mecânica exclusiva:** a **maré**. A cada 4 minutos a maré sobe ou
desce, mudando quais áreas do mapa são acessíveis e onde os Afogados
podem andar.

### Monstro 1: O FAROLEIRO
- **Aparência:** uma figura imensa (3m) de capa de chuva amarela
  apodrecida, rosto coberto por cracas, carregando um gancho de
  atracação. Anda devagar pela costa.
- **Comportamento:** controla o farol. Quando ele entra na torre, o
  farol acende e varre a ilha por 30 segundos — ser pego pelo facho
  marca sua posição para TODOS os monstros. Fora da torre, ele patrulha
  a praia entre os naufrágios.

### Monstro 2: A SEREIA PODRE
- **Aparência:** da cintura para cima, restos do que foi belo; da
  cintura para baixo, cauda de peixe em decomposição. Vive nas áreas
  alagadas e na lagoa central.
- **Sentidos/comportamento:** ela CANTA. O canto dela inverte seus
  controles levemente (efeito de confusão crescente quanto mais perto).
  Com fones de ouvido, é a experiência mais perturbadora do jogo.
  Ela não persegue em terra — mas qualquer água com mais de 30cm é
  domínio dela, e a maré sempre está mudando o que é "terra segura".

### Monstro 3: OS AFOGADOS (horda)
- **Aparência:** não é UM monstro — são 9 corpos inchados de marinheiros
  de várias épocas, andando devagar, espalhados pela ilha. Individualmente
  lentos e quase cegos. O problema: quando um te detecta, ele emite um
  borbulhar alto e TODOS convergem para você de direções diferentes.
- **Comportamento:** transforma a fase num jogo de cerco — não é "fuja
  do monstro", é "não se deixe cercar".
- **Mensagem de morte (qualquer um):** *"A ilha chama. A ilha coleciona.
  Seu barco já está na praia, junto dos outros."*

### Papel de lore
No **templo submerso**, acessível apenas na maré baixa, com tempo
contado: a maré começa a subir assim que você pega o papel. A subida
de volta com a água nos joelhos enquanto a Sereia canta é o momento
mais tenso do jogo até aqui.

---

## FASE 10 — "O REBANHO DO DEUS CEGO" (Culto extremista)

**Dificuldade:** ★★★★★★ (máxima) | **Monstros:** 3 | **Moedas no mapa:** 200

### Ambientação
O final. Um complexo religioso isolado: capela torta construída com
madeira de TODOS os lugares anteriores (você reconhece cadeiras do
estádio, prateleiras do mercado, papel de parede amarelo...), dormitórios
com beliches e pertences abandonados, um refeitório com 100 pratos
servidos e intactos, um celeiro-templo, e túneis cavados à mão descendo
para o "Salão da Voz". Velas pretas. Símbolos: um olho fechado dentro
de um sol. Esta fase REVELA a lore inteira: o culto é a ORIGEM de tudo
que você viu nas 9 fases anteriores.

### Monstro 1: O PROFETA
- **Aparência:** um homem alto de batina branca imaculada (a única coisa
  limpa do jogo todo), com os próprios olhos costurados e um TERCEIRO
  olho desenhado a carvão na testa — que pisca.
- **Sentidos/comportamento:** cego de verdade, audição divina. Ele anda
  pelos corredores SERMONANDO em voz alta sem parar (você sempre sabe
  onde ele está)... mas quando ele PARA de falar, é porque ouviu você.
  O silêncio dele é o alarme.

### Monstro 2: OS FIÉIS (horda coordenada)
- **Aparência:** 12 cultistas de túnica de estopa e vendas nos olhos,
  ajoelhados em pontos de oração espalhados pelo mapa, murmurando.
- **Comportamento:** cegos, mas ouvem em REDE: se um detecta você, não
  ataca — ele AVISA cantando uma nota, e os outros respondem, triangulando
  sua posição em coro. Quando o coro afina em uníssono, todos se levantam
  e caminham exatamente para onde você está. A mecânica transforma som
  em cerco: cada barulho seu vira uma nota no coro deles.

### Monstro 3: O DEUS CEGO
- **Aparência:** a coisa no Salão da Voz. Nunca aparece inteira — o jogo
  só mostra partes: uma mão do tamanho de um carro saindo da escuridão,
  uma respiração que move o cabelo da sua... espera, você é só uma mão
  e uma lanterna. A respiração dele APAGA SUA LANTERNA quando ele exala
  (a cada 15 segundos, sua luz morre por 3 segundos, no mapa inteiro
  do subsolo).
- **Comportamento:** não persegue. Ele OCUPA o salão final onde está o
  último papel. O trecho final é atravessar o corpo/território dele no
  ritmo da respiração: mover na inalação, congelar na exalação.
  Errar o ritmo uma vez = a mão desce. Sem Segunda Chance (a loja avisa).
- **Mensagem de morte:** *"O Deus Cego não precisa te ver. Você sempre
  esteve na palma da mão dele."*

### Papel de lore
No **altar do Salão da Voz**, literalmente sobre a língua de pedra do
ídolo central. O papel 10 amarra TODAS as histórias (ver Parte 6).
Ao pegá-lo, não há fuga em fúria — há a cutscene final.

---

# PARTE 6 — A LORE COMPLETA (os 10 papéis)

Cada papel, lido no menu Lore, tem os 3 blocos que você pediu:
**a história do lugar**, **a história do monstro** e **como era a vida
antes do que aconteceu**. Abaixo, o texto integral de cada papel,
escrito como manuscrito de uma vítima.

## Papel 1 — encontrado no Estádio
> **A vida antes:** "Todo domingo o estádio lotava. Eu vendia pipoca no
> portão 3 há vinte anos. Conhecia cada torcedor pelo apelido. O Tonho
> da arquibancada norte nunca perdeu UM jogo. Nem doente, nem no enterro
> da mãe. Dizia que o time era a única coisa que tinha."
>
> **O lugar:** "Foi na final. Minuto 89, a gente ganhando de 2 a 1.
> O refletor principal caiu sobre a arquibancada norte. Disseram que foi
> manutenção barata. Fecharam o estádio no dia seguinte e nunca mais
> abriram. O placar ninguém teve coragem de desligar."
>
> **O monstro:** "O Tonho não saiu. Eu vi nas câmeras antes de fugir:
> uma coisa de uniforme número 12 correndo em volta do campo, esperando
> o jogo recomeçar. Eles dizem que torcedor de verdade morre pelo time.
> O Tonho descobriu que dá pra fazer pior: dá pra NÃO morrer por ele."

## Papel 2 — encontrado no Walmart
> **A vida antes:** "O Vicente era o melhor funcionário que essa loja
> já teve. Trinta e sete meses seguidos como funcionário do mês. Cobria
> todo turno, todo feriado. O gerente vivia dizendo: 'queria dez como
> você'. A gente ria. O Vicente não ria. Ele anotava."
>
> **O lugar:** "A rede faliu de um dia pro outro. Mandaram todo mundo
> embora por mensagem de texto. A loja ficou trancada com o estoque
> dentro. Só esqueceram de avisar uma pessoa, porque uma pessoa nunca
> entregava o crachá: ela morava no estoque e ninguém sabia."
>
> **O monstro:** "O Vicente continua trabalhando. Repõe as mesmas
> prateleiras há anos para clientes que não existem. O corpo dele
> entendeu que não precisava mais de casa, de comida, de forma humana —
> só precisava do turno. Se ele te ver, vai te atender. O atendimento
> dele agora é... definitivo."

## Papel 3 — encontrado nos Backrooms
> **A vida antes:** "Eu era arquiteto. Projetava escritórios: carpete,
> divisória, luz fluorescente, repetir. Uma vez calculei que passei
> 94 mil horas da minha vida dentro de salas que eu mesmo desenhei
> e que eram todas iguais."
>
> **O lugar:** "Não é um prédio. É o que sobra quando todos os
> escritórios entediantes do mundo escorrem pelo ralo da realidade.
> Eu caí aqui atravessando uma porta que eu MESMO desenhei errada em
> 1997. O lugar cresce. Ele se alimenta de gente que anda em círculos."
>
> **O monstro:** "Tem um outro aqui. Acho que foi gente. De tanto
> encostar nas paredes esperando o expediente acabar, a parede ficou
> com ele. Ele não é mau. Ele só quer que você fique parado também.
> Para sempre. Como num expediente que não termina."

## Papel 4 — encontrado no Vilarejo Mexicano
> **A vida antes:** "Nosso povoado fazia o Día de los Muertos mais
> bonito da região. A Soledad liderava tudo: as ofrendas, as pétalas,
> as velas. Ela dizia que os mortos só se perdem quando os vivos param
> de iluminar o caminho. Ela perdeu os dois filhos no rio, anos atrás,
> e desde então acendia velas pelo povoado inteiro, toda noite."
>
> **O lugar:** "Naquele ano, a prefeitura proibiu a festa. 'Risco de
> incêndio.' Apagaram as velas da Soledad à força, na frente de todos.
> Naquela noite, sem nenhuma luz para guiar, algo seguiu o choro dela
> até aqui. E a festa nunca mais parou — só que agora ninguém vivo
> participa."
>
> **O monstro:** "A Soledad chora procurando os filhos em cada rosto.
> Mas os olhos dela viraram água, e água não reconhece ninguém. Se o
> choro dela sumir, reze. O silêncio é o abraço dela chegando."

## Papel 5 — encontrado na Savana
> **A vida antes:** "Nossa vila tinha o melhor tocador de tambor do
> distrito, o velho Kwame. Os tambores dele espantavam a noite, dizia
> minha avó. Toda noite ele tocava até a última fogueira apagar, e
> nada de ruim atravessava o capim enquanto houvesse ritmo."
>
> **O lugar:** "O Kwame morreu dormindo, de velhice, em paz. A vila
> decidiu fazer uma noite de silêncio em homenagem. Uma noite só.
> Mas algumas coisas esperam gerações por uma única noite sem tambores."
>
> **O monstro:** "Vieram dois. O pássaro-relâmpago, que sempre rondou
> o céu sem poder descer, e a coisa-vagalume, que se finge de luz
> pequena para chegar perto. Alguém ainda toca o tambor do Kwame em
> algum lugar da vila, tentando segurar a noite. Eu nunca descobri quem.
> Quando o tambor acelerar, corra."

## Papel 6 — encontrado no Paraguai
> **A vida antes:** "A estância dos Benítez era a mais próspera do
> departamento. Erva-mate, gado, sete filhos. Sete. A vizinhança toda
> avisou dona Benítez sobre a lenda do sétimo filho homem. Ela ria:
> 'superstição de gente velha'. Batizou o caçula de Ángel."
>
> **O lugar:** "O Ángel cresceu normal até os treze. Depois, as noites
> de lua cheia começaram a amanhecer com a porteira aberta e o curral
> mais vazio. A família foi embora numa madrugada, sem malas. Deixaram
> comida na mesa e seis cruzes no quintal — uma para cada irmão que
> tentou ficar para 'cuidar' do Ángel."
>
> **O monstro:** "São dois, e não se conhecem. O Luison é o Ángel: ele
> não caça por fome, caça por costume, e chora depois. O outro é mais
> antigo que a estância: o Pombero sempre foi o dono da noite ali —
> a família só pagava o respeito dele com caña e mel. Quando pararam
> de pagar, ele parou de proteger. Deixe a garrafa na clareira.
> Ele ainda aceita."

## Papel 7 — encontrado na NASA
> **A vida antes:** "Eu fazia o café da sala de controle. Sério. Doze
> anos servindo café para gente que mandava coisas para o espaço.
> A missão SPEC-7 era o orgulho da base: trazer amostras de um
> asteroide. O comandante Reyes me prometeu trazer 'poeira estelar'
> de lembrança. Todo mundo amava o Reyes."
>
> **O lugar:** "A cápsula voltou no horário. O Reyes saiu dela andando,
> acenando, tudo certo. Mas a balança da doca registrou o traje com
> 34 quilos a mais do que na decolagem. Quando a quarentena foi
> trancada, já era tarde: a amostra preta tinha aprendido a sair pelos
> ralos. Evacuaram a base em 40 minutos. Eu deixei a cafeteira ligada."
>
> **O monstro:** "São dois, e foram um. O traje ainda anda os corredores
> com o que sobrou do Reyes dentro — cheio, ocupado, repetindo o rádio.
> E a parte líquida explora a base como a gente explorava o espaço:
> com curiosidade infinita e nenhum conceito do que é uma pessoa."

## Papel 8 — encontrado na Vila Asiática
> **A vida antes:** "Nossa vila vivia do templo. Peregrinos subiam a
> montanha o ano todo. Tínhamos três guardiões tradicionais: a senhora
> que cuidava do andar de cima da pousada, o monge que varria o caminho
> do templo, e o artesão de guarda-chuvas, que dizia que todo objeto
> usado com amor por cem anos ganha alma."
>
> **O lugar:** "O turismo acabou quando construíram o teleférico na
> montanha vizinha. A vila esvaziou em três invernos. Os três guardiões
> ficaram, cuidando de uma vila para ninguém — e objetos e pessoas que
> servem sem ninguém para servir azedam, viram reverência sem fim."
>
> **O monstro:** "A senhora ainda procura hóspedes pelas janelas de
> cima — não a deixe te notar três vezes, ou ela vai descer para te
> 'hospedar'. O monge ainda varre o caminho — mas a vaidade de ser
> visto o corrompeu: não olhe. E o guarda-chuva centenário ganhou alma,
> como o artesão prometeu. Pena que ninguém usou ele com amor."

## Papel 9 — encontrado na Ilha
> **A vida antes:** "Eu era da guarda costeira. A ilha não consta em
> carta náutica nenhuma, mas a cada poucos anos um barco some naquela
> coordenada. Meu avô, faroleiro, dizia que a ilha é viva e que o
> templo no centro é a boca. O farol foi construído nos anos 1900
> para AVISAR os navios — e funcionou, por três gerações de faroleiros
> da minha família."
>
> **O lugar:** "A ilha cansou de passar fome. Numa noite de tempestade,
> ela inverteu o farol: em vez de afastar, a luz começou a CHAMAR.
> Os naufrágios na praia preta não são acidente — são despensa.
> A maré que sobe e desce não é maré. É a ilha respirando."
>
> **O monstro:** "Meu avô ainda opera o farol, com cracas no rosto e
> o juramento corrompido. A cantora da lagoa veio num naufrágio de
> 1922 — era atração de cabaré num cruzeiro, e a ilha gostou da voz.
> E os marinheiros que afundaram... a ilha não desperdiça nada.
> Se você está lendo isto: o templo abre na maré baixa. É lá que a
> ilha guarda o que NÃO digere — a verdade."

## Papel 10 — encontrado no Culto (o papel que amarra tudo)
> **A vida antes:** "No começo éramos um retiro de gente cansada.
> Gente que perdeu alguém ou algo: um vendedor de pipoca que viu um
> refletor cair, um arquiteto que sonhava com corredores amarelos,
> uma irmã de estância paraguaia, o gerente de uma loja falida, o
> homem do café de uma base espacial. Cada um trouxe sua história.
> O Profeta ouvia todas. Ele era SÓ ISSO no início: um homem que ouvia."
>
> **O lugar:** "Então o Profeta costurou os próprios olhos e disse
> que enxergou: todas as nossas tragédias tinham a mesma causa. Um
> deus antigo, cego, que dorme sob o mundo e SONHA. Os monstros são
> os sonhos dele vazando: o torcedor eterno, o funcionário eterno,
> a mãe eterna, o guardião eterno. Toda dor que se repete sem fim é
> o Deus Cego sonhando com ela. E o culto decidiu acordá-lo... cantando."
>
> **O monstro:** "Eles não entenderam que acordar o sonhador apaga os
> sonhos — e nós, o mundo inteiro, talvez sejamos o sonho. Eu fugi
> na noite do primeiro coro. Deixei este papel para quem coleciona
> histórias como eu colecionava. Sim, eu sei que você juntou os outros
> nove. Fui eu que os espalhei, um em cada ferida do mundo, como velas
> num caminho de pétalas. Eu sou o homem do balcão da loja onde você
> compra suas coragens. Volte vivo. Sempre achei que você voltaria vivo."

### O final do jogo
Ao coletar o papel 10, cutscene final: a mão do jogador apaga a
lanterna VOLUNTARIAMENTE pela primeira vez, dentro do Salão da Voz.
No escuro total, ouve-se a respiração do Deus Cego desacelerando —
ele volta a dormir profundamente quando ninguém traz luz nem som ao
salão. Tela final: a mão acende a lanterna do lado de fora do templo,
ao amanhecer (primeira luz do sol do jogo inteiro). Créditos sobem
ao som do tambor do velho Kwame, agora calmo. Desbloqueia o
**Modo Pesadelo** (ver Parte 9).

---

# PARTE 7 — TABELAS DE BALANCEAMENTO

## 7.1 — Progressão de dificuldade por fase

| # | Fase | Monstros | Moedas | Bônus de vitória | Tempo médio | Mortes esperadas |
|---|---|---|---|---|---|---|
| 1 | Estádio | 1 | 60 | +30 | 5 min | 1–2 |
| 2 | Walmart | 1 | 75 | +40 | 6 min | 2–3 |
| 3 | Backrooms | 1 | 85 | +50 | 7 min | 2–3 |
| 4 | México | 1 | 95 | +60 | 8 min | 3–4 |
| 5 | África | 2 | 110 | +75 | 9 min | 3–5 |
| 6 | Paraguai | 2 | 120 | +90 | 10 min | 4–6 |
| 7 | NASA | 2 | 135 | +110 | 11 min | 4–6 |
| 8 | Ásia | 3 | 150 | +140 | 12 min | 5–8 |
| 9 | Ilha | 3 | 170 | +170 | 13 min | 6–9 |
| 10 | Culto | 3 | 200 | +250 | 15 min | 8–12 |

## 7.2 — Curva econômica planejada
- Total de moedas coletáveis no jogo (uma run perfeita de cada fase):
  ~1.200 + ~1.015 de bônus = **~2.215 moedas**.
- Custo de TODOS os permanentes: **~2.750 moedas**.
- Conclusão: o jogador NÃO consegue comprar tudo numa primeira zerada —
  precisa repetir fases (rejogabilidade) ou escolher uma "build":
  build de luz (lanternas), build furtiva (passos/coração), build de
  fuga (tênis/resistência) ou build de informação (radar/mapa/visão).
- Fases já vencidas podem ser rejogadas: rendem 50% das moedas
  (anti-farm exagerado, mas ainda vale a pena).

## 7.3 — Velocidades (referência para programar)

| Entidade | Patrulha | Caçada | Fúria |
|---|---|---|---|
| Jogador andando | 3,5 m/s | — | — |
| Jogador correndo | 6,5 m/s | — | — |
| 12º Jogador | 2,5 | 7,0 | 8,4 |
| Repositor | 2,0 | 7,5 | 9,0 |
| Errante | 2,2 | 6,8 (deslize) | 8,2 |
| Chorona | 2,0 | 7,2 (flutua) | 8,6 |
| Impundulu | 5,0 (voo) | 9,0 (mergulho) | 10,0 |
| Adze | 1,8 | 5,5 | 6,6 |
| Luison | 3,0 | 7,8 | 9,4 |
| Pombero | 2,8 | 6,0 | 7,2 |
| Astronauta | 1,6 | 5,2 | 6,2 |
| Amostra | 3,5 (paredes) | 8,0 | 9,6 |
| Dama de Cima | 2,4 (telhados) | 7,6 | 9,1 |
| Monge Oco | = velocidade do jogador + 0,2 | — | — |
| Kara-Kasa | 0 (emboscada) | 8,5 (bote 3m) | — |
| Faroleiro | 2,0 | 6,5 | 7,8 |
| Sereia Podre | 1,5 (terra) / 9,0 (água) | — | — |
| Afogados (cada) | 1,8 | 3,5 | 4,2 |
| Profeta | 2,6 | 7,4 | 8,9 |
| Fiéis (cada) | 2,2 | 4,5 | 5,4 |
| Deus Cego | — (estático, ataque por ritmo) | — | — |

Regra de ouro do balanceamento: **em caçada, todo monstro é mais rápido
que o jogador correndo** (exceto Afogados e Fiéis, que vencem por
número). Fugir em linha reta nunca funciona — o jogador DEVE usar
esconderijos, quebra de linha de visão, distrações ou mecânicas da fase.

---

# PARTE 8 — INTERFACE, MENUS E TELAS

## 8.1 — Menu principal
- Fundo: a mão com a lanterna acesa apontada para o título **LUZ FRACA**
  pintado numa parede úmida. A cada ~30 segundos, algo passa correndo
  no limite do facho de luz (um monstro aleatório dentre os já
  enfrentados — o menu evolui com o progresso).
- Botões em fonte manuscrita suja: **JOGAR**, **LORE**, **CONFIGURAÇÕES**,
  **LOJA**. Hover: a lanterna do fundo vira e ilumina o botão.
- Canto superior direito: contador de moedas (ícone de moeda enferrujada)
  e contador de papéis ("7/10").

## 8.2 — Tela JOGAR (seleção de fases)
- Grade 5x2 de cartões de fase. Cada cartão mostra:
  - **Desbloqueada:** arte da fase em miniatura, nome, dificuldade em
    estrelas, **contador de mortes** ("Mortes: 14" escrito como riscos
    de giz, em grupos de 5), melhor tempo, e selo de "PAPEL ENCONTRADO"
    se aplicável.
  - **Bloqueada:** cartão preto com um cadeado enferrujado e a frase
    "Sobreviva à fase anterior". Nada da arte é revelado (preserva a
    surpresa).
- Ao clicar numa fase: **tela de preparação** com a descrição em uma
  frase, seus consumíveis equipados, atalho para a Loja, e o botão
  "ENTRAR" (que treme levemente).

## 8.3 — Modal LORE
- Visual: uma mesa de madeira vista de cima, iluminada por uma vela,
  com os 10 papéis espalhados.
- Papéis encontrados: legíveis; clicar dá zoom no manuscrito com a
  textura real do papel da fase (cada um com caligrafia, mancha e
  rasgo diferentes) e narração opcional em voz sussurrada.
- Papéis não encontrados: viram para baixo, escrito "???" no verso,
  com o número da fase. Clicar neles: a vela tremula e nada acontece.
- Ao coletar os 10: os papéis se reorganizam sozinhos na mesa formando
  o símbolo do olho fechado — e um 11º texto secreto aparece queimado
  na madeira da mesa (epílogo do Vendedor).

## 8.4 — Tela CONFIGURAÇÕES
- **Volume Geral** (0–100)
- **Volume da Música** (0–100)
- **Volume dos Efeitos** (0–100)
- **Volume dos Sustos** (0–100) — sim, um slider só para jumpscares,
  acessibilidade real para quem tem problemas cardíacos/sensibilidade.
- **Brilho** (com a clássica imagem de calibração: "ajuste até o símbolo
  da esquerda ficar quase invisível").
- **Sensibilidade do mouse/toque**, **inverter eixo Y**.
- **Modo Daltonismo** (muda o brilho das moedas/papéis para formas
  distintas além de cores).
- **Legendas de som** (ex.: [passos pesados à esquerda], [choro distante]) —
  acessibilidade para surdos, e útil para todo mundo nas fases sonoras.

## 8.5 — Tela LOJA
- Balcão escuro, vela, e a voz do Vendedor (ver 4.3).
- Abas: **PERMANENTES** | **CONSUMÍVEIS**.
- Cada item: ícone desenhado a carvão, nome, descrição, preço, botão
  COMPRAR (cinza se faltar moeda, com a voz: "Volte quando tiver mais.").
- Itens de nível mostram a trilha N1 → N2 → N3.

## 8.6 — HUD durante o jogo (minimalista de propósito)
- **SEM barra de vida** (morte é instantânea — vida não existe).
- **SEM contador de bateria numérico**: a lanterna escurece e pisca
  conforme a pilha acaba (informação diegética).
- Moedas da run: contador discreto que aparece 2s ao coletar e some.
- Estamina: comunicada só pela respiração (áudio) e leve embaçado.
- Consumíveis equipados: 3 slots pequenos no canto inferior (teclas 1-3).
- Quando o papel é coletado: "ENCONTRE A SAÍDA" sussurrado + rabisco
  na tela apontando vagamente a direção por 2 segundos.

---

# PARTE 9 — DIREÇÃO DE ARTE, ÁUDIO E EXTRAS

## 9.1 — Direção de arte geral
- **A mão + lanterna:** único elemento do corpo visível. A mão CONTA
  HISTÓRIA: começa limpa na fase 1 e acumula arranhões, sujeira,
  curativos improvisados e tremores permanentes conforme as fases
  avançam (e conforme as mortes acumulam — a mão de quem morreu 30
  vezes treme mais). Na fase 10, a mão está enfaixada e suja de terra.
- **Filtro de imagem:** granulado de filme, vinheta escura, leve
  aberração cromática, e 1 frame de "ruído VHS" aleatório a cada
  poucos minutos (às vezes escondendo um rosto — 1 em 50 de chance).
- **Papéis de lore:** cada um com identidade física (o do estádio é um
  ingresso rasgado escrito no verso; o da NASA é um relatório oficial
  com carimbo VAZADO; o do culto é escrito em papel de pele... de quê?).
- **Monstros:** silhuetas legíveis no escuro (design lê-se em 0,5
  segundo de relance), cada um com UMA cor de destaque (12º Jogador:
  branco do uniforme; Repositor: azul do colete; Adze: laranja doente;
  Profeta: branco imaculado...).

## 9.2 — Áudio (o verdadeiro motor do terror)
- Regra: **70% do terror do jogo é som**. Cada fase tem:
  - 1 drone ambiente exclusivo (zumbido, vento, cigarras, respiração...);
  - 1 "som-radar" diegético que informa a posição do monstro (carrinho,
    choro, sermão, sino, tambor, passos magnéticos);
  - 1 música de caçada exclusiva (sempre com o instrumento-tema da fase:
    apito, jingle distorcido, violão, tambor, koto, coro gregoriano...);
  - silêncios planejados — o jogo corta TODO o som 3 segundos antes de
    alguns sustos.
- Áudio 3D/binaural obrigatório. O jogo recomenda fones na abertura:
  *"Jogue com fones. Eles ouvem você. É justo que você os ouça também."*

## 9.3 — Sistema de conquistas (extra)
- **Pé Quente:** vença qualquer fase sem morrer nenhuma vez nela.
- **Pão-duro:** vença uma fase coletando TODAS as moedas dela.
- **Cego por Opção:** vença a fase 3 sem acender a lanterna.
- **Filho Pródigo:** deixe as 3 oferendas para o Pombero na mesma run.
- **Leitor Voraz:** colete os 10 papéis (zere o jogo).
- **Mão Firme:** zere o jogo com menos de 30 mortes totais.
- **Cliente Fiel:** compre todos os itens da loja.
- **Maratonista do Pesadelo:** zere o Modo Pesadelo.

## 9.4 — Modo Pesadelo (pós-game)
Desbloqueado ao zerar. Modificadores: monstros 15% mais rápidos, metade
das pilhas no mapa, papéis em NOVOS esconderijos, e cada fase ganha
+1 monstro "visitante" de outra fase (o Pombero aparece no Walmart
apagando as luzes; a Chorona vaga pelos Backrooms...). Recompensa:
skin dourada para a lanterna e o 12º papel secreto, contando a história
do PRÓPRIO JOGADOR — quem é essa mão, afinal, e por que ela nunca
solta a lanterna.

## 9.5 — Resumo final
LUZ FRACA é um jogo sobre olhar para o escuro com a menor luz possível:
10 pesadelos diferentes, 18 monstros com regras próprias, uma economia
que pune a ganância, uma loja com um vendedor que sabe demais, e uma
lore que transforma 10 papéis amassados em uma única história — a de um
deus que sonha as nossas piores repetições, e a de uma mão teimosa que
decidiu juntar moedas, juntar histórias e, no fim, apagar a própria
lanterna para deixar o mundo dormir em paz.
