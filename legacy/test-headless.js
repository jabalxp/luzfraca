// Teste de fumaça headless: gera os 10 mapas e simula a IA dos monstros.
// Uso: node test-headless.js
'use strict';
const fs = require('fs');
const path = require('path');

// ---- stubs de browser ----
global.window = { addEventListener() {}, AudioContext: null };
global.document = {
  addEventListener() {},
  getElementById() { return null; },
  createElement() {
    return { width: 0, height: 0, getContext() { return new Proxy({}, { get: () => () => ({ addColorStop() {} }) }); } };
  },
  querySelectorAll() { return []; },
};
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.addCaption = () => {};

global.AudioSys = new Proxy({}, { get: (t, k) => (k === 'started' ? false : () => null) });
// concatena os arquivos num único escopo (const/let não vazam de eval indireto)
const src = ['data.js', 'save.js', 'map.js', 'entities.js']
  .map(f => fs.readFileSync(path.join(__dirname, 'js', f), 'utf8'))
  .join('\n');
const exported = new Function(src + `
  return { LEVELS, MONSTERS, TILE, MAP_W, MAP_H, generateMap, spawnMonsters, bfsNextStep, isSolidTile, randomFreePoint, lineOfSight, SAVE };
`)();
const { LEVELS, MONSTERS, TILE, MAP_W, MAP_H, generateMap, spawnMonsters, bfsNextStep, isSolidTile, randomFreePoint, lineOfSight } = exported;

let failures = 0;

for (const level of LEVELS) {
  for (const nightmare of [false, true]) {
    try {
      const map = generateMap(level, nightmare);
      // POIs gerados?
      if (!map.spawn || !map.paper || !map.exit) throw new Error('POI faltando');
      if (map.coins.length < level.coins * 0.9) throw new Error('moedas insuficientes: ' + map.coins.length);
      // papel alcançável?
      const step = bfsNextStep(map, map.spawn.x, map.spawn.y, map.paper.x, map.paper.y, false);
      if (!step && Math.hypot(map.spawn.x - map.paper.x, map.spawn.y - map.paper.y) > 2) {
        throw new Error('papel inalcançável');
      }
      // saída alcançável (com porta aberta)?
      const step2 = bfsNextStep(map, map.spawn.x, map.spawn.y, map.exit.x + 0.5, map.exit.y + 0.5, true);
      if (!step2 && Math.hypot(map.spawn.x - map.exit.x, map.spawn.y - map.exit.y) > 2) {
        throw new Error('saída inalcançável');
      }

      // jogo falso para a IA
      const G = {
        level, map, nightmare,
        player: { x: map.spawn.x, y: map.spawn.y, angle: 0, hidden: false, dead: false, moving: true, running: false, crouching: false, lanternOn: true, currentSpeed: 3.5 },
        time: 0, fury: false, exitOpen: false,
        incenseTimer: 0, trail: [], blackoutActive: false,
        hordeAlert: 0, hordeTarget: { x: 0, y: 0 },
        choirLock: 0, choirTarget: { x: 0, y: 0 },
        promoTarget: null, lighthouseActive: false,
        caughtCount: 0, chaseCount: 0,
        tileAt(x, y) { return map.t[Math.floor(y) * MAP_W + Math.floor(x)]; },
        caption() {},
        spatialTo() { return { pan: 0, vol: 0.5 }; },
        nearCandle() { return false; },
        emitNoise() {},
        onChaseStart() { this.chaseCount++; },
        onChaseEnd() {},
        onDamaSight() {},
        onCaught() { this.caughtCount++; this.player.x = map.spawn.x; this.player.y = map.spawn.y; },
        godStrike() {},
        startLighthouse() { this.lighthouseActive = true; },
      };
      G.monsters = spawnMonsters(G, level, nightmare);
      const expected = level.monsters.reduce((a, k) => a + (MONSTERS[k].horde ? (k === 'fiel' ? 12 : 9) : 1), 0) + (nightmare ? 1 : 0);
      if (G.monsters.length !== expected) throw new Error(`monstros: ${G.monsters.length} != ${expected}`);

      // simula 2000 frames com o jogador andando em círculos
      for (let f = 0; f < 2000; f++) {
        const dt = 0.05;
        G.time += dt;
        G.player.x = map.spawn.x + Math.cos(G.time * 0.5) * 3;
        G.player.y = map.spawn.y + Math.sin(G.time * 0.5) * 3;
        G.player.running = f % 200 < 40;
        G.trail.push({ x: G.player.x, y: G.player.y, t: G.time });
        if (G.trail.length > 120) G.trail.shift();
        if (f === 500) G.emitNoise(G.player.x, G.player.y, 25);
        if (f === 1000) G.fury = true;
        for (const mo of G.monsters) mo.update(dt);
        // monstros dentro dos limites?
        for (const mo of G.monsters) {
          if (!isFinite(mo.x) || !isFinite(mo.y)) throw new Error(mo.key + ' saiu do espaço: ' + mo.x + ',' + mo.y);
        }
      }
      console.log(`OK  fase ${level.id + 1} ${nightmare ? '(pesadelo)' : '         '} — ${G.monsters.length} monstros, ${map.coins.length} moedas, caçadas: ${G.chaseCount}, capturas: ${G.caughtCount}`);
    } catch (e) {
      failures++;
      console.log(`ERRO fase ${level.id + 1} ${nightmare ? '(pesadelo)' : ''}: ${e.message}\n${e.stack.split('\n')[1] || ''}`);
    }
  }
}

console.log(failures ? `\n${failures} FALHAS` : '\nTodos os testes passaram.');
process.exit(failures ? 1 : 0);
