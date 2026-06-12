// ============================================================
// LUZ FRACA — sprites.js : sprites procedurais (monstros, itens, props)
// Silhuetas legíveis em 0,5s de relance, uma cor de destaque cada.
// ============================================================
'use strict';

const SpriteCache = {};

function getSprite(key, w, h, drawFn) {
  if (SpriteCache[key]) return SpriteCache[key];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  drawFn(g, w, h);
  SpriteCache[key] = c;
  return c;
}

// ---------- monstros (64x128) ----------
function monsterSprite(shape) {
  return getSprite('mon_' + shape, 64, 128, (g, w, h) => {
    g.lineCap = 'round';
    switch (shape) {
      case 'jogador12': { // 2,3m, uniforme podre, sem rosto, nº 12
        g.fillStyle = '#1a1d18';
        g.fillRect(20, 14, 24, 22);                       // cabeça lisa
        g.fillStyle = '#d8d8d0'; g.fillRect(14, 36, 36, 44); // camisa
        g.fillStyle = '#22221e'; g.fillRect(18, 80, 12, 44); g.fillRect(34, 80, 12, 44); // pernas
        g.fillStyle = '#d8d8d0'; g.fillRect(6, 38, 10, 36); g.fillRect(48, 38, 10, 36);  // braços cadenciados
        g.fillStyle = '#3a2c28'; g.font = 'bold 26px monospace'; g.fillText('12', 17, 66);
        g.fillStyle = '#2a201c'; g.beginPath(); g.arc(32, 25, 7, 0, 7); g.fill(); // marca de bola no rosto
        break;
      }
      case 'repositor': { // colete azul, braços extras, sorriso esticado
        g.fillStyle = '#c8b8a0'; g.beginPath(); g.arc(32, 20, 11, 0, 7); g.fill();
        g.strokeStyle = '#5a1c10'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(32, 22, 8, 0.1, Math.PI - 0.1); g.stroke(); // sorriso até as orelhas
        g.fillStyle = '#111'; g.fillRect(26, 14, 3, 3); g.fillRect(36, 14, 3, 3); // olhos que não piscam
        g.fillStyle = '#2855a0'; g.fillRect(18, 32, 28, 40);  // colete azul
        g.fillStyle = '#1a1a18'; g.fillRect(22, 72, 8, 52); g.fillRect(36, 72, 8, 52);
        g.strokeStyle = '#c8b8a0'; g.lineWidth = 5;           // braços com articulações extras
        g.beginPath(); g.moveTo(18, 36); g.lineTo(6, 52); g.lineTo(14, 68); g.lineTo(4, 84); g.stroke();
        g.beginPath(); g.moveTo(46, 36); g.lineTo(58, 52); g.lineTo(50, 68); g.lineTo(60, 84); g.stroke();
        g.fillStyle = '#fff'; g.fillRect(20, 38, 10, 6); // crachá
        break;
      }
      case 'errante': { // figura amarela alongada cor das paredes
        g.fillStyle = '#c9b765';
        g.beginPath();
        g.ellipse(32, 16, 9, 14, 0, 0, 7); g.fill();
        g.fillRect(24, 26, 16, 70);
        g.fillRect(26, 96, 5, 30); g.fillRect(33, 96, 5, 30);
        g.fillStyle = '#b5a455'; g.fillRect(20, 34, 6, 50); g.fillRect(38, 34, 6, 50);
        break;
      }
      case 'chorona': { // vestido branco, cabelo preto, cavidades d'água
        g.fillStyle = '#111'; g.beginPath(); g.ellipse(32, 22, 13, 18, 0, 0, 7); g.fill(); // cabelo
        g.fillStyle = '#cfd4da';
        g.beginPath(); g.moveTo(22, 34); g.lineTo(10, 122); g.lineTo(54, 122); g.lineTo(42, 34); g.closePath(); g.fill(); // vestido
        g.fillStyle = '#d8cfc4'; g.beginPath(); g.ellipse(32, 24, 7, 9, 0, 0, 7); g.fill(); // rosto
        g.fillStyle = '#3a586a'; g.fillRect(28, 21, 3, 8); g.fillRect(34, 21, 3, 8); // cavidades vertendo água
        break;
      }
      case 'impundulu': { // ave do tamanho de um homem, olhos vermelhos
        g.fillStyle = '#1a1a22';
        g.beginPath(); g.moveTo(32, 10); g.lineTo(4, 60); g.lineTo(24, 56); g.lineTo(14, 100); g.lineTo(32, 80); g.lineTo(50, 100); g.lineTo(40, 56); g.lineTo(60, 60); g.closePath(); g.fill();
        g.fillStyle = '#cc3333'; g.fillRect(27, 22, 4, 4); g.fillRect(33, 22, 4, 4); // olhos
        g.strokeStyle = '#6a8aff'; g.lineWidth = 1; // faíscas estáticas
        for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(8 + i * 11, 40 + (i % 3) * 14); g.lineTo(13 + i * 11, 48 + (i % 3) * 14); g.stroke(); }
        g.fillStyle = '#888'; g.beginPath(); g.moveTo(28, 14); g.lineTo(36, 14); g.lineTo(32, 22); g.fill(); // bico
        break;
      }
      case 'adze': { // forma verdadeira: corpo seco, mandíbula de inseto
        g.fillStyle = '#4a3520';
        g.beginPath(); g.ellipse(32, 30, 12, 14, 0, 0, 7); g.fill();
        g.fillRect(22, 42, 20, 50);
        g.fillStyle = '#c97b2c'; g.beginPath(); g.arc(32, 60, 6, 0, 7); g.fill(); // brilho alaranjado no peito
        g.strokeStyle = '#2a1c10'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(24, 38); g.lineTo(16, 48); g.stroke(); // mandíbulas
        g.beginPath(); g.moveTo(40, 38); g.lineTo(48, 48); g.stroke();
        g.strokeStyle = '#4a3520'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(24, 92); g.lineTo(20, 124); g.stroke();
        g.beginPath(); g.moveTo(40, 92); g.lineTo(44, 124); g.stroke();
        break;
      }
      case 'luison': { // homem quebrado em forma de cão, olhos tristes
        g.fillStyle = '#6a6258';
        g.beginPath(); g.ellipse(32, 70, 22, 16, 0.3, 0, 7); g.fill(); // corpo curvado
        g.beginPath(); g.ellipse(48, 48, 10, 9, 0, 0, 7); g.fill();    // cabeça baixa
        g.fillStyle = '#3a342c'; // patas/braços
        g.fillRect(16, 82, 6, 40); g.fillRect(28, 84, 6, 40); g.fillRect(42, 82, 6, 40);
        g.fillStyle = '#aac4d4'; g.fillRect(46, 46, 3, 3); g.fillRect(52, 46, 3, 3); // olhos tristes
        g.strokeStyle = '#54483c'; g.lineWidth = 1; // pelos ralos
        for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(14 + i * 5, 58); g.lineTo(12 + i * 5, 50); g.stroke(); }
        break;
      }
      case 'pombero': { // baixinho 1,2m, chapéu de palha, pés invertidos
        g.fillStyle = '#caa84a';
        g.beginPath(); g.moveTo(8, 66); g.lineTo(56, 66); g.lineTo(32, 50); g.closePath(); g.fill(); // chapelão
        g.fillStyle = '#241a10'; g.beginPath(); g.arc(32, 72, 9, 0, 7); g.fill(); // rosto na sombra
        g.fillStyle = '#4a3a22'; g.fillRect(18, 80, 28, 28); // corpo atarracado peludo
        g.strokeStyle = '#382a16'; g.lineWidth = 1;
        for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(20 + i * 2.6, 108); g.lineTo(19 + i * 2.6, 114); g.stroke(); }
        g.fillStyle = '#382a16'; // pés virados para trás
        g.fillRect(20, 114, 10, 6); g.fillRect(34, 114, 10, 6);
        g.fillStyle = '#241a10'; g.fillRect(26, 116, 4, 4); g.fillRect(40, 116, 4, 4);
        break;
      }
      case 'astronauta': { // traje completo, visor rachado, coisas dentro
        g.fillStyle = '#d8d8d8';
        g.beginPath(); g.arc(32, 22, 14, 0, 7); g.fill();          // capacete
        g.fillRect(14, 36, 36, 50);                                 // traje
        g.fillRect(16, 86, 12, 38); g.fillRect(36, 86, 12, 38);
        g.fillRect(4, 40, 10, 34); g.fillRect(50, 40, 10, 34);
        g.fillStyle = '#181c20'; g.beginPath(); g.arc(32, 22, 9, 0, 7); g.fill(); // visor espelhado
        g.strokeStyle = '#3a444c'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(26, 16); g.lineTo(36, 28); g.stroke(); // rachadura
        g.fillStyle = '#aa2222'; g.fillRect(18, 44, 8, 4);          // patch da missão
        g.fillStyle = '#0c0e10'; // algo se movendo dentro (bolhas no pescoço)
        g.beginPath(); g.arc(26, 38, 3, 0, 7); g.fill(); g.beginPath(); g.arc(38, 39, 2.5, 0, 7); g.fill();
        break;
      }
      case 'amostra': { // silhueta humana de petróleo, dedos longos
        g.fillStyle = '#0a0a0e';
        g.beginPath(); g.ellipse(32, 20, 10, 13, 0, 0, 7); g.fill();
        g.beginPath(); g.moveTo(20, 30); g.lineTo(14, 124); g.lineTo(50, 124); g.lineTo(44, 30); g.closePath(); g.fill();
        g.strokeStyle = '#0a0a0e'; g.lineWidth = 3;
        for (let i = 0; i < 5; i++) { // dedos longos demais
          g.beginPath(); g.moveTo(14, 60); g.lineTo(2, 74 + i * 5); g.stroke();
          g.beginPath(); g.moveTo(50, 60); g.lineTo(62, 74 + i * 5); g.stroke();
        }
        g.fillStyle = '#202830'; // brilho líquido
        g.beginPath(); g.ellipse(28, 50, 3, 8, 0.4, 0, 7); g.fill();
        g.beginPath(); g.ellipse(38, 80, 2, 9, -0.3, 0, 7); g.fill();
        break;
      }
      case 'dama': { // kimono branco funerário, cabelo até o chão, de quatro
        g.fillStyle = '#111';
        g.fillRect(20, 4, 24, 100); // cabelo véu
        g.fillStyle = '#e8e4dc';
        g.beginPath(); g.moveTo(16, 40); g.lineTo(8, 120); g.lineTo(56, 120); g.lineTo(48, 40); g.closePath(); g.fill(); // kimono
        g.fillStyle = '#d8cfc4'; g.beginPath(); g.ellipse(32, 26, 8, 10, 0, 0, 7); g.fill();
        g.fillStyle = '#111'; g.fillRect(24, 8, 16, 14); // franja cobrindo
        g.fillStyle = '#5a1c10'; g.fillRect(30, 34, 4, 1.5); // boca mínima
        break;
      }
      case 'monge': { // sempre de costas, vassoura, vazio por dentro
        g.fillStyle = '#3a3228';
        g.beginPath(); g.arc(32, 18, 11, 0, 7); g.fill();            // cabeça raspada (nuca)
        g.beginPath(); g.moveTo(16, 30); g.lineTo(12, 124); g.lineTo(52, 124); g.lineTo(48, 30); g.closePath(); g.fill(); // manto
        g.fillStyle = '#0a0806'; g.beginPath(); g.ellipse(32, 70, 8, 20, 0, 0, 7); g.fill(); // fresta: escuridão interna
        g.fillStyle = '#b89240'; g.beginPath(); g.arc(32, 64, 3.5, 0, 7); g.fill(); // sino onde seria o coração
        g.strokeStyle = '#7a6a4a'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(52, 50); g.lineTo(60, 124); g.stroke(); // vassoura de bambu
        g.strokeStyle = '#9a8a5a'; g.lineWidth = 1;
        for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(60, 124); g.lineTo(54 + i * 2.4, 112); g.stroke(); }
        break;
      }
      case 'karakasa': { // guarda-chuva vermelho, uma perna, um olho
        g.fillStyle = '#a02828';
        g.beginPath(); g.moveTo(32, 8); g.lineTo(4, 52); g.quadraticCurveTo(32, 40, 60, 52); g.closePath(); g.fill();
        g.strokeStyle = '#5e1818'; g.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(32, 10); g.lineTo(8 + i * 12, 50); g.stroke(); }
        g.fillStyle = '#f0e8d8'; g.beginPath(); g.arc(32, 34, 7, 0, 7); g.fill(); // olho
        g.fillStyle = '#111'; g.beginPath(); g.arc(32, 34, 3, 0, 7); g.fill();
        g.strokeStyle = '#caa84a'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(32, 52); g.lineTo(32, 116); g.stroke(); // perna única
        g.fillStyle = '#caa84a'; g.fillRect(24, 114, 16, 8); // pé (geta)
        g.strokeStyle = '#5a1c10'; g.lineWidth = 2;
        g.beginPath(); g.arc(32, 46, 5, 0.2, Math.PI - 0.2); g.stroke(); // língua/sorriso
        break;
      }
      case 'faroleiro': { // 3m, capa de chuva amarela podre, gancho
        g.fillStyle = '#b0a020';
        g.beginPath(); g.moveTo(32, 4); g.lineTo(10, 20); g.lineTo(14, 124); g.lineTo(50, 124); g.lineTo(54, 20); g.closePath(); g.fill(); // capa
        g.beginPath(); g.moveTo(12, 22); g.lineTo(52, 22); g.lineTo(32, 2) ; g.closePath(); g.fill(); // capuz
        g.fillStyle = '#5a5a3a'; g.beginPath(); g.ellipse(32, 24, 8, 9, 0, 0, 7); g.fill(); // rosto coberto de cracas
        g.fillStyle = '#8a8a6a';
        for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(26 + (i % 3) * 6, 20 + ((i / 3) | 0) * 7, 2, 0, 7); g.fill(); }
        g.strokeStyle = '#6a6a52'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(54, 60); g.lineTo(60, 90); g.stroke();
        g.beginPath(); g.arc(58, 96, 7, -0.5, 2.4); g.stroke(); // gancho de atracação
        break;
      }
      case 'sereia': { // restos do que foi belo + cauda podre
        g.fillStyle = '#9aa48a';
        g.beginPath(); g.ellipse(32, 18, 9, 11, 0, 0, 7); g.fill();
        g.fillRect(22, 28, 20, 30);
        g.fillStyle = '#3a5a44'; // cabelo de algas
        g.fillRect(20, 6, 6, 34); g.fillRect(38, 6, 6, 34);
        g.fillStyle = '#3a6a5a';
        g.beginPath(); g.moveTo(22, 58); g.quadraticCurveTo(16, 90, 30, 124); g.lineTo(40, 124); g.quadraticCurveTo(50, 88, 42, 58); g.closePath(); g.fill(); // cauda
        g.fillStyle = '#6aa890'; // escamas caindo
        for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(26 + (i % 3) * 6, 66 + ((i / 3) | 0) * 14, 2.2, 0, 7); g.fill(); }
        g.fillStyle = '#1c2420'; g.fillRect(27, 15, 3, 4); g.fillRect(35, 15, 3, 4);
        break;
      }
      case 'afogado': { // corpo inchado de marinheiro
        g.fillStyle = '#4a5a52';
        g.beginPath(); g.arc(32, 18, 12, 0, 7); g.fill();
        g.beginPath(); g.ellipse(32, 64, 19, 30, 0, 0, 7); g.fill(); // corpo inchado
        g.fillRect(20, 92, 10, 32); g.fillRect(36, 92, 10, 32);
        g.fillStyle = '#2c3833'; g.fillRect(20, 10, 24, 6); // quepe
        g.fillStyle = '#1a2420'; g.fillRect(26, 18, 4, 4); g.fillRect(36, 18, 4, 4); // olhos vazios
        g.fillStyle = '#6a7a6a'; // bolhas/inchaço
        g.beginPath(); g.arc(22, 52, 4, 0, 7); g.fill(); g.beginPath(); g.arc(44, 70, 5, 0, 7); g.fill();
        break;
      }
      case 'profeta': { // batina branca imaculada, olhos costurados, 3º olho
        g.fillStyle = '#f0ece4';
        g.beginPath(); g.moveTo(20, 30); g.lineTo(14, 124); g.lineTo(50, 124); g.lineTo(44, 30); g.closePath(); g.fill();
        g.fillStyle = '#d8c8b0'; g.beginPath(); g.ellipse(32, 18, 9, 12, 0, 0, 7); g.fill();
        g.strokeStyle = '#5a1c10'; g.lineWidth = 1.5; // olhos costurados (X X)
        for (const ex of [27, 37]) {
          g.beginPath(); g.moveTo(ex - 2.5, 14); g.lineTo(ex + 2.5, 19); g.stroke();
          g.beginPath(); g.moveTo(ex + 2.5, 14); g.lineTo(ex - 2.5, 19); g.stroke();
        }
        g.strokeStyle = '#2a2420'; g.lineWidth = 1.2; // terceiro olho a carvão
        g.beginPath(); g.ellipse(32, 9, 4, 2.2, 0, 0, 7); g.stroke();
        g.fillStyle = '#2a2420'; g.beginPath(); g.arc(32, 9, 1.2, 0, 7); g.fill();
        break;
      }
      case 'fiel': { // túnica de estopa, venda nos olhos, ajoelhado
        g.fillStyle = '#5a5244';
        g.beginPath(); g.arc(32, 26, 10, 0, 7); g.fill();
        g.beginPath(); g.moveTo(20, 36); g.lineTo(14, 100); g.lineTo(50, 100); g.lineTo(44, 36); g.closePath(); g.fill();
        g.fillRect(16, 100, 32, 14); // ajoelhado (pernas dobradas)
        g.fillStyle = '#776a50'; g.fillRect(22, 22, 20, 6); // venda
        g.strokeStyle = '#3a3228'; g.lineWidth = 1;
        for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(18 + i * 5, 44); g.lineTo(17 + i * 5, 96); g.stroke(); } // estopa
        break;
      }
      case 'deuscego': { // só uma mão colossal saindo da escuridão
        const grad = g.createRadialGradient(32, 110, 4, 32, 70, 80);
        grad.addColorStop(0, '#3a2c1a'); grad.addColorStop(1, '#000');
        g.fillStyle = grad;
        // dedos do tamanho de pilares
        for (let i = 0; i < 5; i++) {
          const fx = 6 + i * 12;
          g.beginPath();
          g.moveTo(fx, 128); g.lineTo(fx + 2, 30 - Math.abs(i - 2) * 14); g.lineTo(fx + 9, 30 - Math.abs(i - 2) * 14); g.lineTo(fx + 11, 128);
          g.closePath(); g.fill();
        }
        break;
      }
    }
  });
}

// ---------- itens e props (32x32 / 48x64) ----------
function itemSprite(type, colorblind) {
  const key = 'item_' + type + (colorblind ? '_cb' : '');
  return getSprite(key, 32, 32, (g) => {
    switch (type) {
      case 'coin': {
        g.fillStyle = '#b8923a';
        if (colorblind) { g.beginPath(); g.moveTo(16, 4); g.lineTo(28, 16); g.lineTo(16, 28); g.lineTo(4, 16); g.closePath(); g.fill(); }
        else { g.beginPath(); g.arc(16, 16, 9, 0, 7); g.fill(); }
        g.strokeStyle = '#7a5e22'; g.lineWidth = 2;
        g.beginPath(); g.arc(16, 16, 6, 0, 7); g.stroke();
        break;
      }
      case 'coin2': { // moeda de zona de morte (vale 2)
        g.fillStyle = '#e0b34a';
        if (colorblind) { g.fillRect(6, 6, 20, 20); }
        else { g.beginPath(); g.arc(16, 16, 11, 0, 7); g.fill(); }
        g.strokeStyle = '#8a6a26'; g.lineWidth = 2;
        g.beginPath(); g.arc(16, 16, 7, 0, 7); g.stroke();
        break;
      }
      case 'paper': {
        g.fillStyle = '#c8d8e8';
        g.save(); g.translate(16, 16); g.rotate(0.2);
        if (colorblind) { g.beginPath(); g.moveTo(0, -12); g.lineTo(10, 10); g.lineTo(-10, 10); g.closePath(); g.fill(); }
        else g.fillRect(-8, -11, 16, 22);
        g.strokeStyle = '#4a6a8a'; g.lineWidth = 1;
        for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-5, -7 + i * 4); g.lineTo(5, -7 + i * 4); g.stroke(); }
        g.restore();
        break;
      }
      case 'battery': {
        g.fillStyle = '#3a5a3a'; g.fillRect(10, 6, 12, 22);
        g.fillStyle = '#8a8a8a'; g.fillRect(13, 3, 6, 4);
        g.fillStyle = '#c0c0a0'; g.font = '9px monospace'; g.fillText('+', 13, 20);
        break;
      }
      case 'cana': {
        g.fillStyle = '#7a5a2a'; g.fillRect(12, 8, 8, 20);
        g.fillStyle = '#4a3318'; g.fillRect(14, 3, 4, 6);
        break;
      }
    }
  });
}

function propSprite(type) {
  return getSprite('prop_' + type, 48, 64, (g) => {
    switch (type) {
      case 'candle': {
        g.fillStyle = '#d8cBa0'; g.fillRect(21, 38, 6, 18);
        g.fillStyle = '#ffb84a'; g.beginPath(); g.ellipse(24, 33, 3, 6, 0, 0, 7); g.fill();
        g.fillStyle = '#fff0c0'; g.beginPath(); g.ellipse(24, 34, 1.2, 3, 0, 0, 7); g.fill();
        break;
      }
      case 'blackcandle': {
        g.fillStyle = '#1c1c1c'; g.fillRect(21, 38, 6, 18);
        g.fillStyle = '#8a4aff'; g.beginPath(); g.ellipse(24, 33, 2.5, 5, 0, 0, 7); g.fill();
        break;
      }
      case 'cross': case 'cross7': {
        g.strokeStyle = type === 'cross7' ? '#bfb49a' : '#6a5a44'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(24, 10); g.lineTo(24, 58); g.stroke();
        g.beginPath(); g.moveTo(12, 24); g.lineTo(36, 24); g.stroke();
        break;
      }
      case 'umbrella': {
        g.fillStyle = '#8a2222';
        g.beginPath(); g.moveTo(24, 8); g.lineTo(6, 30); g.quadraticCurveTo(24, 24, 42, 30); g.closePath(); g.fill();
        g.strokeStyle = '#caa84a'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(24, 30); g.lineTo(24, 58); g.stroke();
        g.fillStyle = '#e8e8f0'; g.fillRect(8, 6, 32, 3); // neve acumulada
        break;
      }
      case 'baobab': case 'tree': {
        g.fillStyle = '#3a2c1c'; g.fillRect(18, 28, 12, 36);
        g.fillStyle = type === 'baobab' ? '#2a2418' : '#1c2c1c';
        g.beginPath(); g.ellipse(24, 20, 20, 16, 0, 0, 7); g.fill();
        break;
      }
      case 'well': {
        g.fillStyle = '#5a5a52'; g.fillRect(8, 36, 32, 20);
        g.fillStyle = '#0a0a0a'; g.beginPath(); g.ellipse(24, 38, 14, 5, 0, 0, 7); g.fill();
        g.strokeStyle = '#4a3a26'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(10, 36); g.lineTo(14, 10); g.moveTo(38, 36); g.lineTo(34, 10); g.moveTo(12, 12) ; g.lineTo(36, 12); g.stroke();
        g.strokeStyle = '#8a7a5a'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(24, 12); g.lineTo(24, 38); g.stroke(); // a corda esticada
        break;
      }
      case 'goal': {
        g.strokeStyle = '#c0c0c0'; g.lineWidth = 3;
        g.strokeRect(6, 16, 36, 40);
        g.strokeStyle = '#888'; g.lineWidth = 0.6;
        for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(6 + i * 7, 16); g.lineTo(6 + i * 7, 56); g.stroke(); }
        break;
      }
      case 'scoreboard': {
        g.fillStyle = '#181818'; g.fillRect(4, 8, 40, 26);
        g.fillStyle = '#c97b2c'; g.font = 'bold 12px monospace'; g.fillText('2-1', 14, 22);
        g.font = '8px monospace'; g.fillText("89'", 17, 31);
        break;
      }
      case 'cart': {
        g.strokeStyle = '#9aa0a8'; g.lineWidth = 2;
        g.strokeRect(8, 24, 30, 18);
        g.beginPath(); g.moveTo(38, 24); g.lineTo(44, 14); g.stroke();
        g.fillStyle = '#666'; g.beginPath(); g.arc(14, 48, 4, 0, 7); g.fill(); g.beginPath(); g.arc(32, 48, 4, 0, 7); g.fill();
        break;
      }
      case 'gurney': {
        g.fillStyle = '#7a8088'; g.fillRect(6, 30, 36, 8);
        g.fillStyle = '#d8d8d8'; g.fillRect(8, 22, 32, 8); // lençol... com forma
        g.fillStyle = '#b8b8b8'; g.beginPath(); g.arc(14, 24, 5, 0, 7); g.fill();
        break;
      }
      case 'console': {
        g.fillStyle = '#2a2e34'; g.fillRect(6, 20, 36, 24);
        g.fillStyle = '#5a8a5a'; g.fillRect(10, 24, 12, 8);
        g.fillStyle = '#8a3a3a'; g.fillRect(26, 24, 12, 8);
        g.fillStyle = '#c0c0c0'; g.font = '5px monospace'; g.fillText('SINAL PERDIDO', 8, 40);
        break;
      }
      case 'rocket': {
        g.fillStyle = '#b8bcc4';
        g.beginPath(); g.moveTo(24, 2); g.lineTo(34, 28); g.lineTo(34, 56); g.lineTo(14, 56); g.lineTo(14, 28); g.closePath(); g.fill();
        g.fillStyle = '#8a2a2a'; g.fillRect(14, 44, 20, 5);
        break;
      }
      case 'lighthouse': {
        g.fillStyle = '#a8a098';
        g.beginPath(); g.moveTo(18, 64); g.lineTo(21, 10); g.lineTo(27, 10); g.lineTo(30, 64); g.closePath(); g.fill();
        g.fillStyle = '#4a4540'; g.fillRect(19, 4, 10, 8);
        g.fillStyle = '#2a2825'; g.fillRect(18, 26, 12, 5); g.fillRect(18, 44, 12, 5);
        break;
      }
      case 'wreck': {
        g.fillStyle = '#3c3830';
        g.beginPath(); g.moveTo(4, 50); g.quadraticCurveTo(24, 38, 44, 46); g.lineTo(40, 58); g.lineTo(8, 58); g.closePath(); g.fill();
        g.strokeStyle = '#2a2620'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(20, 42); g.lineTo(16, 16); g.stroke(); // mastro quebrado
        break;
      }
      case 'templeStairs': {
        g.fillStyle = '#5a5a52';
        for (let i = 0; i < 5; i++) g.fillRect(10 + i * 3, 28 + i * 6, 28 - i * 6, 5);
        break;
      }
      case 'idol': {
        g.fillStyle = '#2c241c';
        g.beginPath(); g.ellipse(24, 24, 16, 20, 0, 0, 7); g.fill();
        g.strokeStyle = '#8c6a20'; g.lineWidth = 2; // olho fechado dentro de um sol
        g.beginPath(); g.arc(24, 22, 9, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(17, 22); g.quadraticCurveTo(24, 27, 31, 22); g.stroke();
        for (let a = 0; a < 8; a++) {
          g.beginPath();
          g.moveTo(24 + Math.cos(a * 0.785) * 11, 22 + Math.sin(a * 0.785) * 11);
          g.lineTo(24 + Math.cos(a * 0.785) * 15, 22 + Math.sin(a * 0.785) * 15);
          g.stroke();
        }
        g.fillStyle = '#3a3026'; g.fillRect(16, 44, 16, 16); // língua de pedra
        break;
      }
      case 'altar': {
        g.fillStyle = '#4a3a2a'; g.fillRect(8, 36, 32, 22);
        g.fillStyle = '#c97b2c'; g.beginPath(); g.ellipse(24, 32, 3, 5, 0, 0, 7); g.fill();
        break;
      }
      case 'drum': {
        g.fillStyle = '#6a4a2a'; g.fillRect(14, 30, 20, 26);
        g.fillStyle = '#c8b89a'; g.beginPath(); g.ellipse(24, 30, 10, 4, 0, 0, 7); g.fill();
        break;
      }
    }
  });
}

// vagalume do Adze (forma pequena — parece moeda!)
function fireflySprite() {
  return getSprite('firefly', 16, 16, (g) => {
    g.fillStyle = '#e8a050';
    g.beginPath(); g.arc(8, 8, 3, 0, 7); g.fill();
    g.fillStyle = 'rgba(232,160,80,0.3)';
    g.beginPath(); g.arc(8, 8, 7, 0, 7); g.fill();
  });
}
