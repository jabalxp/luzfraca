// ============================================================
// LUZ FRACA — data.js : fases, monstros, lore, loja, conquistas
// ============================================================
'use strict';

// ---------- MONSTROS ----------
// sentidos: hearing (multiplicador de raio de ruído), vision {range,fov},
// lightAttract (lanterna acesa multiplica detecção visual), heat (raio que
// atravessa paredes), vibration (detecta movimento), smell (segue rastro),
// network (horda em rede)
const MONSTERS = {
  jogador12: {
    name: 'O 12º Jogador', color: '#e8e8e0', accent: '#dddddd',
    speeds: { patrol: 2.5, chase: 7.0, fury: 8.4 },
    hearing: 1.5, vision: { range: 5, fov: 1.2 }, lightAttract: 1.0,
    radarSound: 'claps', shape: 'jogador12',
    behavior: 'patrolLoop',
  },
  repositor: {
    name: 'O Repositor', color: '#2855a0', accent: '#3a6ec5',
    speeds: { patrol: 2.0, chase: 7.5, fury: 9.0 },
    hearing: 1.0, vision: { range: 18, fov: 0.5 }, lightAttract: 2.2,
    radarSound: 'cart', shape: 'repositor',
    behavior: 'patrolAnnounce',
  },
  errante: {
    name: 'O Errante', color: '#c9b765', accent: '#d8c977',
    speeds: { patrol: 2.2, chase: 6.8, fury: 8.2 },
    hearing: 0, vision: { range: 0, fov: 0 }, lightAttract: 0,
    vibration: { run: 40, walk: 10, crouch: 3 },
    radarSound: 'hum', shape: 'errante',
    behavior: 'wander',
  },
  chorona: {
    name: 'A Chorona', color: '#cfd4da', accent: '#eef2f6',
    speeds: { patrol: 2.0, chase: 7.2, fury: 8.6 },
    hearing: 0, vision: { range: 0, fov: 0 }, lightAttract: 0,
    heat: { start: 8, end: 16 },
    radarSound: 'crying', shape: 'chorona',
    behavior: 'wander',
  },
  impundulu: {
    name: 'O Impundulu', color: '#1a1a22', accent: '#cc3333',
    speeds: { patrol: 5.0, chase: 9.0, fury: 10.0 },
    hearing: 0, vision: { range: 26, fov: 2.2 }, lightAttract: 3.0,
    flying: true, radarSound: 'silence', shape: 'impundulu',
    behavior: 'flyPerch',
  },
  adze: {
    name: 'O Adze', color: '#c97b2c', accent: '#e8a050',
    speeds: { patrol: 1.8, chase: 5.5, fury: 6.6 },
    hearing: 0.3, vision: { range: 4, fov: 1.5 }, lightAttract: 0,
    smell: true, radarSound: 'buzz', shape: 'adze',
    behavior: 'trailHunter',
  },
  luison: {
    name: 'O Luison', color: '#6a6258', accent: '#8a8278',
    speeds: { patrol: 3.0, chase: 7.8, fury: 9.4 },
    hearing: 1.2, vision: { range: 4, fov: 1.0 }, lightAttract: 0,
    smell: true, smellRadius: 14, howls: true,
    radarSound: 'howl', shape: 'luison',
    behavior: 'perimeter',
  },
  pombero: {
    name: 'O Pombero', color: '#4a3a22', accent: '#caa84a',
    speeds: { patrol: 2.8, chase: 6.0, fury: 7.2 },
    hearing: 2.0, vision: { range: 8, fov: 1.4 }, lightAttract: 0,
    radarSound: 'whistle', shape: 'pombero',
    behavior: 'trickster',
  },
  astronauta: {
    name: 'SPEC-7, o Astronauta', color: '#d8d8d8', accent: '#aa2222',
    speeds: { patrol: 1.6, chase: 5.2, fury: 6.2 },
    hearing: 0.4, vision: { range: 6, fov: 1.0 }, lightAttract: 0,
    heat: { start: 8, end: 8 },
    radarSound: 'clonc', shape: 'astronauta',
    behavior: 'patrolLoop',
  },
  amostra: {
    name: 'A Amostra', color: '#0a0a0e', accent: '#202830',
    speeds: { patrol: 3.5, chase: 8.0, fury: 9.6 },
    hearing: 0, vision: { range: 0, fov: 0 }, lightAttract: 0,
    electric: 12, radarSound: 'drip', shape: 'amostra',
    behavior: 'ceiling',
  },
  dama: {
    name: 'A Dama do Andar de Cima', color: '#e8e4dc', accent: '#111111',
    speeds: { patrol: 2.4, chase: 7.6, fury: 9.1 },
    hearing: 0.3, vision: { range: 14, fov: 1.6 }, lightAttract: 1.5,
    sightCounter: 3, radarSound: 'silence', shape: 'dama',
    behavior: 'watcher',
  },
  monge: {
    name: 'O Monge Oco', color: '#3a3228', accent: '#b89240',
    speeds: { patrol: 1.0, chase: 0, fury: 0 },
    hearing: 0, vision: { range: 0, fov: 0 }, lightAttract: 0,
    gazeTrigger: 2.0, radarSound: 'sweep', shape: 'monge',
    behavior: 'gazeFollower',
  },
  karakasa: {
    name: 'Kara-Kasa', color: '#a02828', accent: '#c04040',
    speeds: { patrol: 0, chase: 8.5, fury: 8.5 },
    hearing: 0, vision: { range: 3, fov: 6.3 }, lightAttract: 0,
    ambush: 3, radarSound: 'silence', shape: 'karakasa',
    behavior: 'ambusher',
  },
  faroleiro: {
    name: 'O Faroleiro', color: '#b0a020', accent: '#d4c040',
    speeds: { patrol: 2.0, chase: 6.5, fury: 7.8 },
    hearing: 0.8, vision: { range: 10, fov: 1.2 }, lightAttract: 1.2,
    lighthouse: true, radarSound: 'hook', shape: 'faroleiro',
    behavior: 'coastPatrol',
  },
  sereia: {
    name: 'A Sereia Podre', color: '#3a6a5a', accent: '#6aa890',
    speeds: { patrol: 1.5, chase: 9.0, fury: 9.0 },
    hearing: 0.6, vision: { range: 12, fov: 2.0 }, lightAttract: 0,
    waterOnly: true, sings: true, radarSound: 'song', shape: 'sereia',
    behavior: 'waterHunter',
  },
  afogado: {
    name: 'Os Afogados', color: '#4a5a52', accent: '#6a7a6a',
    speeds: { patrol: 1.8, chase: 3.5, fury: 4.2 },
    hearing: 0.5, vision: { range: 5, fov: 1.8 }, lightAttract: 0.5,
    horde: true, radarSound: 'gurgle', shape: 'afogado',
    behavior: 'horde',
  },
  profeta: {
    name: 'O Profeta', color: '#f0ece4', accent: '#caa84a',
    speeds: { patrol: 2.6, chase: 7.4, fury: 8.9 },
    hearing: 2.5, vision: { range: 0, fov: 0 }, lightAttract: 0,
    sermon: true, radarSound: 'sermon', shape: 'profeta',
    behavior: 'patrolLoop',
  },
  fiel: {
    name: 'Os Fiéis', color: '#5a5244', accent: '#776a50',
    speeds: { patrol: 2.2, chase: 4.5, fury: 5.4 },
    hearing: 1.4, vision: { range: 0, fov: 0 }, lightAttract: 0,
    horde: true, choir: true, radarSound: 'murmur', shape: 'fiel',
    behavior: 'choir',
  },
  deuscego: {
    name: 'O Deus Cego', color: '#0c0a08', accent: '#3a2c1a',
    speeds: { patrol: 0, chase: 0, fury: 0 },
    hearing: 0, vision: { range: 0, fov: 0 }, lightAttract: 0,
    breathing: { inhale: 12, exhale: 3 },
    radarSound: 'breath', shape: 'deuscego',
    behavior: 'god',
  },
};

// ---------- FASES ----------
const LEVELS = [
  {
    id: 0, name: 'APITO FINAL', place: 'Estádio de Futebol',
    stars: 1, coins: 60, bonus: 30, monsters: ['jogador12'],
    gen: 'arena', ambientLight: 0.055,
    palette: { wall: '#3a4434', wall2: '#2c3328', floor: '#1c2418', ceil: '#05060a', prop: '#4a5444' },
    desc: 'Um estádio abandonado desde o acidente. O placar travou em 2 x 1, minuto 89. Algo ainda treina no gramado.',
    deathMsg: 'O jogo acabou para você. Ele finalmente comemorou.',
    paperHint: 'O papel está no centro do gramado, sobre a marca do pênalti.',
    drone: 'wind', ambient: ['whistle90'], hideName: 'armário de aço',
    visitor: 'karakasa',
  },
  {
    id: 1, name: 'PREÇO BAIXO', place: 'Walmart fechado',
    stars: 2, coins: 75, bonus: 40, monsters: ['repositor'],
    gen: 'shelves', ambientLight: 0.07,
    palette: { wall: '#2e3a4a', wall2: '#26303c', floor: '#28241c', ceil: '#0a0c10', prop: '#3a4a5e' },
    desc: 'Um hipermercado às 3h da manhã. Rastreie o som do carrinho: carrinho rodando, você está seguro.',
    deathMsg: 'Obrigado por comprar conosco. Volte sempre. Você VAI voltar sempre.',
    paperHint: 'O papel está na sala do gerente, nos fundos do estoque.',
    drone: 'freezer', ambient: ['promo'], hideName: 'câmara fria',
    visitor: 'pombero',
  },
  {
    id: 2, name: 'FORA DO MAPA', place: 'Backrooms',
    stars: 2.5, coins: 85, bonus: 50, monsters: ['errante'],
    gen: 'maze', ambientLight: 0.42,
    palette: { wall: '#b0a050', wall2: '#988a42', floor: '#7a6e3a', ceil: '#c4b66a', prop: '#8a7c3e' },
    desc: 'Carpete úmido, zumbido de 60Hz, corredores que se reorganizam. O Mapa Rabiscado não funciona aqui.',
    deathMsg: 'Você sempre esteve fora do mapa. Agora o mapa está dentro de você.',
    paperHint: 'O papel está na sala escura — a única sala sem luz.',
    drone: 'hum60', ambient: ['steps-echo'], hideName: 'pilastra',
    noMap: true, visitor: 'chorona',
  },
  {
    id: 3, name: 'FLOR DE CEMPASÚCHIL', place: 'Vilarejo Mexicano',
    stars: 3, coins: 95, bonus: 60, monsters: ['chorona'],
    gen: 'village', ambientLight: 0.16,
    palette: { wall: '#7a4a2c', wall2: '#5e3a22', floor: '#3a2c1e', ceil: '#0a0608', prop: '#c97b2c' },
    desc: 'O Día de los Muertos parou no meio. Ouça o choro: alto significa longe. Silêncio significa corra.',
    deathMsg: 'Ela finalmente encontrou um de seus filhos.',
    paperHint: 'O papel está na igreja, sobre o altar de ofrendas — o único prédio sem velas.',
    drone: 'guitar', ambient: ['bells'], hideName: 'confessionário',
    candles: true, visitor: 'monge',
  },
  {
    id: 4, name: 'A NOITE SEM TAMBORES', place: 'Savana Africana',
    stars: 3.5, coins: 110, bonus: 75, monsters: ['impundulu', 'adze'],
    gen: 'savanna', ambientLight: 0.10,
    palette: { wall: '#5e4a30', wall2: '#4a3a26', floor: '#3e3422', ceil: '#0c1018', prop: '#7a6a44' },
    desc: 'Capim alto que esconde você — e eles. Os grilos calam quando o pássaro passa. O vagalume não é uma moeda.',
    deathMsg: 'Os tambores pararam. A vila tem um novo morador.',
    paperHint: 'O papel está no fundo do poço central. Descer leva tempo. Você ficará vulnerável.',
    drone: 'crickets', ambient: ['drum'], hideName: 'cabana',
    visitor: 'afogado',
  },
  {
    id: 5, name: 'SÉTIMO FILHO', place: 'Interior do Paraguai',
    stars: 4, coins: 120, bonus: 90, monsters: ['luison', 'pombero'],
    gen: 'village', ambientLight: 0.09,
    palette: { wall: '#6a4434', wall2: '#523428', floor: '#4a2c1c', ceil: '#0a0a12', prop: '#3e5a2e' },
    desc: 'Sete cruzes no quintal. Seis com nomes. O Pombero assusta, o Luison mata. Deixe a garrafa na clareira.',
    deathMsg: 'No interior, todo mundo sabe: à noite, a terra não é mais sua.',
    paperHint: 'O papel está pregado na sétima cruz — a sem nome.',
    drone: 'cicadas', ambient: ['gate'], hideName: 'capelinha',
    offerings: 3, visitor: 'errante',
  },
  {
    id: 6, name: 'CONTAGEM REGRESSIVA', place: 'Base da NASA',
    stars: 4.5, coins: 135, bonus: 110, monsters: ['astronauta', 'amostra'],
    gen: 'facility', ambientLight: 0.13,
    palette: { wall: '#5a6066', wall2: '#464c52', floor: '#33373c', ceil: '#16181c', prop: '#7a3030' },
    desc: 'O Astronauta vê seu calor no escuro. A Amostra vê sua lanterna acesa. Cada monstro pune uma estratégia.',
    deathMsg: 'O espaço sempre esteve vazio. Nós é que trouxemos companhia.',
    paperHint: 'O papel está na ala de quarentena, na mão de um corpo.',
    drone: 'machine', ambient: ['countdown'], hideName: 'duto de ventilação',
    blackout: 300, visitor: 'jogador12',
  },
  {
    id: 7, name: 'A VILA QUE REVERENCIA', place: 'Ásia rural',
    stars: 5, coins: 150, bonus: 140, monsters: ['dama', 'monge', 'karakasa'],
    gen: 'village', ambientLight: 0.14,
    palette: { wall: '#4a3c30', wall2: '#3a3026', floor: '#cfd4da', ceil: '#10141c', prop: '#a02828' },
    desc: 'Neve fina, lanternas vermelhas. Não deixe a Dama te ver três vezes. Não olhe para o Monge. Não confie nos guarda-chuvas.',
    deathMsg: 'A vila reverencia quem chega. A vila não deixa ninguém partir sem se curvar.',
    paperHint: 'O papel está no altar do templo, no topo da vila.',
    drone: 'snowwind', ambient: ['templebell'], hideName: 'casa de papel',
    snow: true, visitor: 'repositor',
  },
  {
    id: 8, name: 'A ILHA QUE CHAMA', place: 'Ilha no oceano',
    stars: 5.5, coins: 170, bonus: 170, monsters: ['faroleiro', 'sereia', 'afogado'],
    gen: 'island', ambientLight: 0.08,
    palette: { wall: '#3c4438', wall2: '#2e362c', floor: '#26221a', ceil: '#0a0e16', prop: '#5a6a5e' },
    desc: 'Seu barco naufragou. A maré sobe e desce como um pulmão. O templo abre na maré baixa.',
    deathMsg: 'A ilha chama. A ilha coleciona. Seu barco já está na praia, junto dos outros.',
    paperHint: 'O papel está no templo submerso — acessível apenas na maré baixa.',
    drone: 'ocean', ambient: ['foghorn'], hideName: 'casco de navio',
    tide: 240, visitor: 'luison',
  },
  {
    id: 9, name: 'O REBANHO DO DEUS CEGO', place: 'Templo do culto',
    stars: 6, coins: 200, bonus: 250, monsters: ['profeta', 'fiel', 'deuscego'],
    gen: 'temple', ambientLight: 0.06,
    palette: { wall: '#3a3026', wall2: '#2c241c', floor: '#221c14', ceil: '#080604', prop: '#8c2020' },
    desc: 'O fim. O Profeta sermoneia sem parar — quando ele cala, é porque ouviu você. Lá embaixo, algo respira.',
    deathMsg: 'O Deus Cego não precisa te ver. Você sempre esteve na palma da mão dele.',
    paperHint: 'O papel está no altar do Salão da Voz, sobre a língua de pedra do ídolo. Mova na inalação. Congele na exalação.',
    drone: 'chant', ambient: ['breath'], hideName: 'confessionário',
    noSecondChance: true, godHall: true, visitor: 'sereia',
  },
];

// ---------- LORE (texto integral dos papéis) ----------
const LORE = [
  {
    title: 'Papel 1 — o ingresso rasgado do Estádio',
    before: 'Todo domingo o estádio lotava. Eu vendia pipoca no portão 3 há vinte anos. Conhecia cada torcedor pelo apelido. O Tonho da arquibancada norte nunca perdeu UM jogo. Nem doente, nem no enterro da mãe. Dizia que o time era a única coisa que tinha.',
    placeTx: 'Foi na final. Minuto 89, a gente ganhando de 2 a 1. O refletor principal caiu sobre a arquibancada norte. Disseram que foi manutenção barata. Fecharam o estádio no dia seguinte e nunca mais abriram. O placar ninguém teve coragem de desligar.',
    monsterTx: 'O Tonho não saiu. Eu vi nas câmeras antes de fugir: uma coisa de uniforme número 12 correndo em volta do campo, esperando o jogo recomeçar. Eles dizem que torcedor de verdade morre pelo time. O Tonho descobriu que dá pra fazer pior: dá pra NÃO morrer por ele.',
  },
  {
    title: 'Papel 2 — o crachá anotado do Walmart',
    before: 'O Vicente era o melhor funcionário que essa loja já teve. Trinta e sete meses seguidos como funcionário do mês. Cobria todo turno, todo feriado. O gerente vivia dizendo: "queria dez como você". A gente ria. O Vicente não ria. Ele anotava.',
    placeTx: 'A rede faliu de um dia pro outro. Mandaram todo mundo embora por mensagem de texto. A loja ficou trancada com o estoque dentro. Só esqueceram de avisar uma pessoa, porque uma pessoa nunca entregava o crachá: ela morava no estoque e ninguém sabia.',
    monsterTx: 'O Vicente continua trabalhando. Repõe as mesmas prateleiras há anos para clientes que não existem. O corpo dele entendeu que não precisava mais de casa, de comida, de forma humana — só precisava do turno. Se ele te ver, vai te atender. O atendimento dele agora é... definitivo.',
  },
  {
    title: 'Papel 3 — a planta rabiscada dos Backrooms',
    before: 'Eu era arquiteto. Projetava escritórios: carpete, divisória, luz fluorescente, repetir. Uma vez calculei que passei 94 mil horas da minha vida dentro de salas que eu mesmo desenhei e que eram todas iguais.',
    placeTx: 'Não é um prédio. É o que sobra quando todos os escritórios entediantes do mundo escorrem pelo ralo da realidade. Eu caí aqui atravessando uma porta que eu MESMO desenhei errada em 1997. O lugar cresce. Ele se alimenta de gente que anda em círculos.',
    monsterTx: 'Tem um outro aqui. Acho que foi gente. De tanto encostar nas paredes esperando o expediente acabar, a parede ficou com ele. Ele não é mau. Ele só quer que você fique parado também. Para sempre. Como num expediente que não termina.',
  },
  {
    title: 'Papel 4 — a estampa de pétalas do Vilarejo',
    before: 'Nosso povoado fazia o Día de los Muertos mais bonito da região. A Soledad liderava tudo: as ofrendas, as pétalas, as velas. Ela dizia que os mortos só se perdem quando os vivos param de iluminar o caminho. Ela perdeu os dois filhos no rio, anos atrás, e desde então acendia velas pelo povoado inteiro, toda noite.',
    placeTx: 'Naquele ano, a prefeitura proibiu a festa. "Risco de incêndio." Apagaram as velas da Soledad à força, na frente de todos. Naquela noite, sem nenhuma luz para guiar, algo seguiu o choro dela até aqui. E a festa nunca mais parou — só que agora ninguém vivo participa.',
    monsterTx: 'A Soledad chora procurando os filhos em cada rosto. Mas os olhos dela viraram água, e água não reconhece ninguém. Se o choro dela sumir, reze. O silêncio é o abraço dela chegando.',
  },
  {
    title: 'Papel 5 — o couro de tambor da Savana',
    before: 'Nossa vila tinha o melhor tocador de tambor do distrito, o velho Kwame. Os tambores dele espantavam a noite, dizia minha avó. Toda noite ele tocava até a última fogueira apagar, e nada de ruim atravessava o capim enquanto houvesse ritmo.',
    placeTx: 'O Kwame morreu dormindo, de velhice, em paz. A vila decidiu fazer uma noite de silêncio em homenagem. Uma noite só. Mas algumas coisas esperam gerações por uma única noite sem tambores.',
    monsterTx: 'Vieram dois. O pássaro-relâmpago, que sempre rondou o céu sem poder descer, e a coisa-vagalume, que se finge de luz pequena para chegar perto. Alguém ainda toca o tambor do Kwame em algum lugar da vila, tentando segurar a noite. Eu nunca descobri quem. Quando o tambor acelerar, corra.',
  },
  {
    title: 'Papel 6 — a fita de promessa do Paraguai',
    before: 'A estância dos Benítez era a mais próspera do departamento. Erva-mate, gado, sete filhos. Sete. A vizinhança toda avisou dona Benítez sobre a lenda do sétimo filho homem. Ela ria: "superstição de gente velha". Batizou o caçula de Ángel.',
    placeTx: 'O Ángel cresceu normal até os treze. Depois, as noites de lua cheia começaram a amanhecer com a porteira aberta e o curral mais vazio. A família foi embora numa madrugada, sem malas. Deixaram comida na mesa e seis cruzes no quintal — uma para cada irmão que tentou ficar para "cuidar" do Ángel.',
    monsterTx: 'São dois, e não se conhecem. O Luison é o Ángel: ele não caça por fome, caça por costume, e chora depois. O outro é mais antigo que a estância: o Pombero sempre foi o dono da noite ali — a família só pagava o respeito dele com caña e mel. Quando pararam de pagar, ele parou de proteger. Deixe a garrafa na clareira. Ele ainda aceita.',
  },
  {
    title: 'Papel 7 — o relatório com carimbo VAZADO da NASA',
    before: 'Eu fazia o café da sala de controle. Sério. Doze anos servindo café para gente que mandava coisas para o espaço. A missão SPEC-7 era o orgulho da base: trazer amostras de um asteroide. O comandante Reyes me prometeu trazer "poeira estelar" de lembrança. Todo mundo amava o Reyes.',
    placeTx: 'A cápsula voltou no horário. O Reyes saiu dela andando, acenando, tudo certo. Mas a balança da doca registrou o traje com 34 quilos a mais do que na decolagem. Quando a quarentena foi trancada, já era tarde: a amostra preta tinha aprendido a sair pelos ralos. Evacuaram a base em 40 minutos. Eu deixei a cafeteira ligada.',
    monsterTx: 'São dois, e foram um. O traje ainda anda os corredores com o que sobrou do Reyes dentro — cheio, ocupado, repetindo o rádio. E a parte líquida explora a base como a gente explorava o espaço: com curiosidade infinita e nenhum conceito do que é uma pessoa.',
  },
  {
    title: 'Papel 8 — o papel de arroz da Vila',
    before: 'Nossa vila vivia do templo. Peregrinos subiam a montanha o ano todo. Tínhamos três guardiões tradicionais: a senhora que cuidava do andar de cima da pousada, o monge que varria o caminho do templo, e o artesão de guarda-chuvas, que dizia que todo objeto usado com amor por cem anos ganha alma.',
    placeTx: 'O turismo acabou quando construíram o teleférico na montanha vizinha. A vila esvaziou em três invernos. Os três guardiões ficaram, cuidando de uma vila para ninguém — e objetos e pessoas que servem sem ninguém para servir azedam, viram reverência sem fim.',
    monsterTx: 'A senhora ainda procura hóspedes pelas janelas de cima — não a deixe te notar três vezes, ou ela vai descer para te "hospedar". O monge ainda varre o caminho — mas a vaidade de ser visto o corrompeu: não olhe. E o guarda-chuva centenário ganhou alma, como o artesão prometeu. Pena que ninguém usou ele com amor.',
  },
  {
    title: 'Papel 9 — a página de diário de bordo da Ilha',
    before: 'Eu era da guarda costeira. A ilha não consta em carta náutica nenhuma, mas a cada poucos anos um barco some naquela coordenada. Meu avô, faroleiro, dizia que a ilha é viva e que o templo no centro é a boca. O farol foi construído nos anos 1900 para AVISAR os navios — e funcionou, por três gerações de faroleiros da minha família.',
    placeTx: 'A ilha cansou de passar fome. Numa noite de tempestade, ela inverteu o farol: em vez de afastar, a luz começou a CHAMAR. Os naufrágios na praia preta não são acidente — são despensa. A maré que sobe e desce não é maré. É a ilha respirando.',
    monsterTx: 'Meu avô ainda opera o farol, com cracas no rosto e o juramento corrompido. A cantora da lagoa veio num naufrágio de 1922 — era atração de cabaré num cruzeiro, e a ilha gostou da voz. E os marinheiros que afundaram... a ilha não desperdiça nada. Se você está lendo isto: o templo abre na maré baixa. É lá que a ilha guarda o que NÃO digere — a verdade.',
  },
  {
    title: 'Papel 10 — escrito em papel de pele... de quê?',
    before: 'No começo éramos um retiro de gente cansada. Gente que perdeu alguém ou algo: um vendedor de pipoca que viu um refletor cair, um arquiteto que sonhava com corredores amarelos, uma irmã de estância paraguaia, o gerente de uma loja falida, o homem do café de uma base espacial. Cada um trouxe sua história. O Profeta ouvia todas. Ele era SÓ ISSO no início: um homem que ouvia.',
    placeTx: 'Então o Profeta costurou os próprios olhos e disse que enxergou: todas as nossas tragédias tinham a mesma causa. Um deus antigo, cego, que dorme sob o mundo e SONHA. Os monstros são os sonhos dele vazando: o torcedor eterno, o funcionário eterno, a mãe eterna, o guardião eterno. Toda dor que se repete sem fim é o Deus Cego sonhando com ela. E o culto decidiu acordá-lo... cantando.',
    monsterTx: 'Eles não entenderam que acordar o sonhador apaga os sonhos — e nós, o mundo inteiro, talvez sejamos o sonho. Eu fugi na noite do primeiro coro. Deixei este papel para quem coleciona histórias como eu colecionava. Sim, eu sei que você juntou os outros nove. Fui eu que os espalhei, um em cada ferida do mundo, como velas num caminho de pétalas. Eu sou o homem do balcão da loja onde você compra suas coragens. Volte vivo. Sempre achei que você voltaria vivo.',
  },
];

const LORE_SECRET_11 = '— queimado na madeira da mesa —\n\n"Você juntou as dez. Eu sabia. Quem volta vivo dez vezes não volta por moedas — volta porque precisa terminar a história. O balcão fica aberto. A vela fica acesa. E se um dia você ouvir um tambor calmo ao amanhecer... sou eu, pagando minha dívida com o velho Kwame. Volte vivo. Volte sempre. — O Vendedor"';

const LORE_SECRET_12 = {
  title: 'Papel 12 — o papel que escreveu você',
  text: 'A vida antes: "Houve uma mão que segurava outras mãos. Uma mão que acendia a luz do corredor para alguém dormir. Você não lembra do resto do corpo porque o resto não importava: você sempre foi a parte que segura, a parte que ilumina."\n\nO lugar: "Todos os lugares. Você atravessou os dez pesadelos porque eram seus. O estádio onde você não voltou. A loja onde você fechou. O corredor amarelo onde você esperou. O Deus Cego não sonha sozinho — ele só amplifica quem insiste em repetir."\n\nO monstro: "Não há monstro neste papel. Há um espelho. A mão que nunca solta a lanterna é a única criatura que apareceu nas dez fases. Mas, diferente das outras, você aprendeu a apagar a luz na hora certa. É isso que separa quem assombra de quem amanhece."',
};

// ---------- LOJA ----------
const SHOP_PERM = [
  {
    id: 'lantern', name: 'Lanterna Melhorada', icon: '🔦',
    levels: [
      { name: 'Lanterna de Aço', price: 80, desc: 'Alcance 6m → 9m, bateria +30%.' },
      { name: 'Lanterna Tática', price: 200, desc: 'Alcance 13m, luz mais branca, bateria +60%, foco mais apertado.' },
      { name: 'Farol de Mão', price: 450, desc: 'Alcance 18m, bateria +100%, foco pode CEGAR monstros sensíveis à luz por 2s (1 uso/60s).' },
    ],
  },
  {
    id: 'stamina', name: 'Maior Resistência', icon: '🫁',
    levels: [
      { name: 'Fôlego de Corredor', price: 70, desc: 'Corrida 5s → 8s.' },
      { name: 'Pulmões de Ferro', price: 180, desc: 'Corrida 12s, recuperação 8s → 5s.' },
      { name: 'Maratonista do Medo', price: 400, desc: 'Corrida 16s, arquejo pós-corrida 50% mais silencioso.' },
    ],
  },
  { id: 'shoes', name: 'Tênis de Corrida', icon: '👟', price: 150, desc: 'Velocidade de corrida +15%. Não afeta o barulho.' },
  { id: 'cotton', name: 'Passos de Algodão', icon: '🧦', price: 220, desc: 'Raio de detecção dos passos -40%. Andar agachado fica 100% silencioso.' },
  { id: 'magnet', name: 'Ímã de Moedas', icon: '🧲', price: 130, desc: 'Moedas a 3m voam até você, sem fazer o som de "clink".' },
  { id: 'calm', name: 'Coração Calmo', icon: '🫀', price: 250, desc: 'Pânico pós-susto de 3s → 1s. Prender a respiração: 6s → 10s.' },
  { id: 'map', name: 'Mapa Rabiscado', icon: '🗺️', price: 300, desc: 'Minimapa a carvão: paredes e SUA posição. Some durante caçadas. Não funciona nos Backrooms.' },
  { id: 'pockets', name: 'Bolsos Fundos', icon: '👖', price: 350, desc: 'Ao morrer, perde apenas 25% das moedas da run (em vez de 50%).' },
  { id: 'radar', name: 'Radar de Batimentos', icon: '💓', price: 280, desc: 'Batimento cardíaco grave quando um monstro está a menos de 15m, acelerando com a proximidade.' },
  { id: 'rabbit', name: 'Pé de Coelho', icon: '🐇', price: 320, desc: '25% de chance de um monstro em Caçada perder seu rastro ao virar uma esquina.' },
];

const SHOP_CONS = [
  { id: 'spectral', name: 'Visão Espectral', icon: '👁️', price: 60, max: 5, desc: 'No início da fase, por 5s, monstros aparecem em silhueta vermelha através das paredes.' },
  { id: 'battery', name: 'Pilha Reserva', icon: '🔋', price: 25, max: 9, perPhase: 3, desc: 'Recarrega 50% da bateria. Limite: 3 por fase.' },
  { id: 'second', name: 'Segunda Chance', icon: '🕊️', price: 120, max: 3, perPhase: 1, desc: 'Em vez de morrer, você é jogado longe. 1 uso por fase. NÃO funciona na fase 10 — o Deus Cego não dá segundas chances.' },
  { id: 'bell', name: 'Sino de Lata', icon: '🔔', price: 40, max: 6, perPhase: 2, desc: 'Arremessável. O barulho atrai os monstros ouvintes por 10s. Limite: 2 por fase.' },
  { id: 'incense', name: 'Incenso Frio', icon: '🕯️', price: 90, max: 5, desc: 'Você fica sem cheiro por 60s. Essencial contra criaturas que farejam (fases 5, 6 e 9).' },
  { id: 'adrenaline', name: 'Adrenalina', icon: '💉', price: 75, max: 5, desc: '5s de corrida sem estamina e +30% velocidade. TODOS os monstros sabem onde você está durante o efeito.' },
  { id: 'compass', name: 'Bússola da Lore', icon: '🧭', price: 100, max: 5, perPhase: 1, desc: 'Por 15s, uma seta azulada aponta a DIREÇÃO do papel. 1 uso por fase.' },
];

const VENDOR_LINES = {
  buy: ['Boa escolha.', 'Isso não vai te salvar lá embaixo.', 'Volte vivo.', 'Gasta bem quem volta pra gastar de novo.', 'Eu já vi essa luz apagar em mãos melhores.'],
  poor: 'Volte quando tiver mais.',
  enter: ['O que vai ser hoje?', 'A vela está quase no fim. Você também?', 'Sente o cheiro? É medo velho. O meu balcão é feito disso.'],
  secondChanceWarn: 'Aviso de quem já desceu: lá embaixo, no templo, isso não funciona. Ele não dá segundas chances.',
  mapWarn: 'Esse mapa fica... confuso... naquele lugar amarelo. Não diga que não avisei.',
};

// ---------- CONQUISTAS ----------
const ACHIEVEMENTS = [
  { id: 'peQuente', name: 'Pé Quente', desc: 'Vença qualquer fase sem morrer nenhuma vez nela.' },
  { id: 'paoDuro', name: 'Pão-duro', desc: 'Vença uma fase coletando TODAS as moedas dela.' },
  { id: 'cego', name: 'Cego por Opção', desc: 'Vença a fase 3 sem acender a lanterna.' },
  { id: 'prodigio', name: 'Filho Pródigo', desc: 'Deixe as 3 oferendas para o Pombero na mesma run.' },
  { id: 'leitor', name: 'Leitor Voraz', desc: 'Colete os 10 papéis (zere o jogo).' },
  { id: 'maoFirme', name: 'Mão Firme', desc: 'Zere o jogo com menos de 30 mortes totais.' },
  { id: 'cliente', name: 'Cliente Fiel', desc: 'Compre todos os itens da loja.' },
  { id: 'maratonista', name: 'Maratonista do Pesadelo', desc: 'Zere o Modo Pesadelo.' },
];

const FINAL_TEXT = 'A mão apaga a lanterna.\nVoluntariamente. Pela primeira vez.\n\nNo escuro total do Salão da Voz, a respiração colossal desacelera...\ndesacelera...\n\nNinguém traz luz. Ninguém traz som.\nO Deus Cego volta a dormir.\n\n— · —\n\nDo lado de fora do templo, a mão acende a lanterna\numa última vez — contra a primeira luz do sol\nde todo o jogo.\n\nO tambor do velho Kwame toca, em algum lugar.\nCalmo, agora.\n\nLUZ FRACA\n\nVocê deixou o mundo dormir em paz.\n\n☠ MODO PESADELO DESBLOQUEADO ☠';
