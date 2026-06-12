// ============================================================
// LUZ FRACA — ui.js : menus, loja, lore, configurações, HUD
// ============================================================
'use strict';

let currentScreen = 'intro';
let prepLevelId = 0;
let shopTab = 'perm';
let shopFromPrep = false;
let menuAnim = null;

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  currentScreen = name;
  if (name === 'menu') { startMenuBg(); refreshMenuCounters(); }
  else stopMenuBg();
  if (name === 'play') buildPhaseGrid();
  if (name === 'lore') buildLore();
  if (name === 'settings') buildSettings();
  if (name === 'shop') buildShop();
}

function initUI() {
  document.querySelectorAll('[data-go]').forEach(b => {
    b.addEventListener('click', () => {
      AudioSys.uiClick();
      showScreen(b.dataset.go);
    });
  });
  document.getElementById('btn-intro-start').addEventListener('click', () => {
    AudioSys.init();
    AudioSys.uiClick();
    showScreen('menu');
  });
  document.getElementById('btn-shop-back').addEventListener('click', () => {
    AudioSys.uiClick();
    showScreen(shopFromPrep ? 'prep' : 'menu');
    shopFromPrep = false;
  });
  document.getElementById('btn-prep-shop').addEventListener('click', () => {
    shopFromPrep = true;
    showScreen('shop');
  });
  document.getElementById('btn-prep-enter').addEventListener('click', () => {
    const nightmare = document.getElementById('prep-nightmare').checked;
    startLevel(prepLevelId, nightmare);
  });
  document.getElementById('tab-perm').addEventListener('click', () => { shopTab = 'perm'; buildShop(); });
  document.getElementById('tab-cons').addEventListener('click', () => { shopTab = 'cons'; buildShop(); });
  document.getElementById('lore-close').addEventListener('click', () => {
    document.getElementById('lore-modal').classList.add('hidden');
  });
  document.getElementById('btn-reset-save').addEventListener('click', () => {
    if (confirm('Apagar TODO o progresso? (moedas, papéis, fases, mortes)')) {
      resetSave();
      showScreen('menu');
    }
  });
  document.getElementById('btn-resume').addEventListener('click', togglePause);
  document.getElementById('btn-giveup').addEventListener('click', giveUp);
  document.getElementById('btn-death-ok').addEventListener('click', () => { closeGame(); showScreen('play'); });
  document.getElementById('btn-win-ok').addEventListener('click', () => { closeGame(); showScreen('play'); });
  document.getElementById('btn-final-ok').addEventListener('click', () => { closeGame(); showScreen('menu'); });
}

function refreshMenuCounters() {
  document.getElementById('menu-coins').textContent = '🪙 ' + SAVE.coins;
  document.getElementById('menu-papers').textContent = '📜 ' + papersCount() + '/10';
  document.getElementById('menu-nightmare').classList.toggle('hidden', !SAVE.finished);
}

// ---------- fundo do menu: mão+lanterna iluminando o título ----------
function startMenuBg() {
  const cv = document.getElementById('menu-canvas');
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const cx = cv.getContext('2d');
  let t = 0, silhouetteTimer = 8 + Math.random() * 20, silhouette = null;
  stopMenuBg();
  const loop = () => {
    t += 0.016;
    cx.fillStyle = '#020202';
    cx.fillRect(0, 0, cv.width, cv.height);
    // facho de lanterna oscilando na "parede úmida"
    const fx = cv.width / 2 + Math.sin(t * 0.5) * 40;
    const fy = cv.height * 0.36 + Math.cos(t * 0.7) * 20;
    const flick = 0.85 + Math.random() * 0.15;
    const gr = cx.createRadialGradient(fx, fy, 20, fx, fy, cv.width * 0.33);
    gr.addColorStop(0, `rgba(225,205,150,${0.13 * flick})`);
    gr.addColorStop(0.6, `rgba(160,140,90,${0.05 * flick})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = gr;
    cx.fillRect(0, 0, cv.width, cv.height);
    // manchas da parede
    cx.fillStyle = 'rgba(30,26,18,0.25)';
    for (let i = 0; i < 8; i++) {
      cx.beginPath();
      cx.ellipse((i * 211) % cv.width, (i * 137) % cv.height, 60 + i * 12, 30 + i * 8, i, 0, 7);
      cx.fill();
    }
    // silhueta de um monstro já enfrentado passa no limite do facho
    silhouetteTimer -= 0.016;
    if (silhouetteTimer <= 0) {
      const faced = LEVELS.filter(l => SAVE.cleared[l.id] || SAVE.deaths[l.id] > 0).flatMap(l => l.monsters);
      if (faced.length) {
        silhouette = { key: faced[(Math.random() * faced.length) | 0], x: -80, sp: 6 + Math.random() * 5 };
      }
      silhouetteTimer = 25 + Math.random() * 15;
    }
    if (silhouette) {
      silhouette.x += silhouette.sp;
      const img = monsterSprite(MONSTERS[silhouette.key].shape);
      cx.save();
      cx.globalAlpha = 0.16;
      cx.drawImage(img, silhouette.x, cv.height * 0.45, 90, 180);
      cx.restore();
      if (silhouette.x > cv.width + 100) silhouette = null;
    }
    menuAnim = requestAnimationFrame(loop);
  };
  loop();
}
function stopMenuBg() { if (menuAnim) { cancelAnimationFrame(menuAnim); menuAnim = null; } }

// ---------- seleção de fases ----------
function buildPhaseGrid() {
  const grid = document.getElementById('phase-grid');
  grid.innerHTML = '';
  const maxUnlocked = unlockedUpTo();
  for (const lv of LEVELS) {
    const card = document.createElement('div');
    const unlocked = lv.id <= maxUnlocked;
    card.className = 'phase-card' + (unlocked ? '' : ' locked');
    if (unlocked) {
      const stars = '★'.repeat(Math.floor(lv.stars)) + (lv.stars % 1 ? '+' : '') + '☆'.repeat(Math.max(0, 5 - Math.ceil(lv.stars)));
      const d = SAVE.deaths[lv.id];
      // riscos de giz em grupos de 5
      let tally = '';
      for (let k = 0; k < d; k++) tally += '❘' + ((k + 1) % 5 === 0 ? ' ' : '');
      const bt = SAVE.bestTimes[lv.id];
      const btTxt = bt ? `${Math.floor(bt / 60)}:${String(Math.floor(bt % 60)).padStart(2, '0')}` : '—';
      card.innerHTML = `
        <div class="ph-art" style="background:linear-gradient(120deg,${lv.palette.wall},${lv.palette.floor})"></div>
        <div class="ph-num">FASE ${lv.id + 1}</div>
        <div class="ph-name">${lv.name}</div>
        <div class="ph-stars">${stars}</div>
        <div class="ph-deaths">Mortes: ${d === 0 ? '0' : d + '  ' + tally.trim()}</div>
        <div class="ph-time">melhor tempo: ${btTxt}</div>
        ${SAVE.papers[lv.id] ? '<div class="ph-paper">PAPEL<br>ENCONTRADO</div>' : ''}`;
      card.addEventListener('click', () => openPrep(lv.id));
    } else {
      card.innerHTML = `<div class="ph-lock">🔒</div><div class="ph-locktext">Sobreviva à fase anterior</div>`;
    }
    grid.appendChild(card);
  }
  // conquistas
  const bar = document.getElementById('achievements-bar');
  bar.innerHTML = '';
  for (const a of ACHIEVEMENTS) {
    const el = document.createElement('div');
    el.className = 'ach' + (SAVE.ach[a.id] ? ' done' : '');
    el.textContent = (SAVE.ach[a.id] ? '🏆 ' : '· ') + a.name;
    el.title = a.desc;
    bar.appendChild(el);
  }
}

function openPrep(id) {
  prepLevelId = id;
  const lv = LEVELS[id];
  document.getElementById('prep-title').textContent = `FASE ${id + 1} — ${lv.name}`;
  document.getElementById('prep-desc').textContent = lv.desc;
  let warn = '';
  if (lv.noSecondChance && SAVE.cons.second > 0) warn = '⚠ A Segunda Chance NÃO funciona nesta fase. O Deus Cego não dá segundas chances.';
  if (lv.noMap && SAVE.perm.map) warn = '⚠ O Mapa Rabiscado não funciona aqui — o desenho aparece borrado.';
  document.getElementById('prep-warning').textContent = warn;
  const box = document.getElementById('prep-consumables');
  box.innerHTML = '';
  for (const item of SHOP_CONS) {
    const n = SAVE.cons[item.id] || 0;
    const el = document.createElement('div');
    el.className = 'prep-cons';
    el.innerHTML = `${item.icon} ${item.name}: <b>${n}</b>`;
    box.appendChild(el);
  }
  const nm = document.getElementById('prep-nightmare-row');
  nm.classList.toggle('hidden', !SAVE.finished);
  document.getElementById('prep-nightmare').checked = false;
  showScreen('prep');
}

// ---------- lore ----------
function buildLore() {
  const grid = document.getElementById('lore-grid');
  grid.innerHTML = '';
  LORE.forEach((paper, i) => {
    const card = document.createElement('div');
    if (SAVE.papers[i]) {
      card.className = 'lore-paper-card';
      card.innerHTML = `<h4>${paper.title.split('—')[0]}</h4><div class="lp-excerpt">${paper.before.slice(0, 90)}…</div>`;
      card.addEventListener('click', () => openLorePaper(i));
    } else {
      card.className = 'lore-paper-card unknown';
      card.innerHTML = `<div>???</div><small>fase ${i + 1}</small>`;
      card.addEventListener('click', () => { // a vela tremula e nada acontece
        card.style.transition = 'filter 0.15s';
        card.style.filter = 'brightness(1.6)';
        setTimeout(() => card.style.filter = '', 200);
      });
    }
    grid.appendChild(card);
  });
  // os 10 papéis formam o olho fechado + epílogo do Vendedor
  const secret = document.getElementById('lore-secret');
  if (papersCount() >= 10) {
    secret.classList.remove('hidden');
    let txt = LORE_SECRET_11;
    if (SAVE.paper12) txt += '\n\n———\n\n' + LORE_SECRET_12.title + '\n' + LORE_SECRET_12.text;
    secret.textContent = txt;
  } else secret.classList.add('hidden');
}

function openLorePaper(i) {
  const paper = LORE[i];
  document.getElementById('lore-paper-title').textContent = paper.title;
  document.getElementById('lore-paper-text').innerHTML =
    `<b>A vida antes:</b> "${paper.before}"\n\n<b>O lugar:</b> "${paper.placeTx}"\n\n<b>O monstro:</b> "${paper.monsterTx}"`;
  document.getElementById('lore-modal').classList.remove('hidden');
  AudioSys.whisper(paper.title);
}

// ---------- configurações ----------
function buildSettings() {
  const s = SAVE.settings;
  const bind = (id, key, isCheck) => {
    const el = document.getElementById('set-' + key);
    if (isCheck) {
      el.checked = s[key];
      el.onchange = () => { s[key] = el.checked; saveGame(); };
    } else {
      el.value = s[key];
      const span = el.parentElement.querySelector('span');
      if (span) span.textContent = s[key];
      el.oninput = () => {
        s[key] = +el.value;
        if (span) span.textContent = el.value;
        saveGame();
        AudioSys.applyVolumes();
      };
    }
  };
  for (const k of ['volMaster', 'volMusic', 'volFx', 'volScare', 'brightness', 'sensitivity']) bind(0, k, false);
  for (const k of ['invertY', 'colorblind', 'captions']) bind(0, k, true);
}

// ---------- loja ----------
function buildShop() {
  document.getElementById('shop-coins').textContent = '🪙 ' + SAVE.coins;
  document.getElementById('tab-perm').classList.toggle('active', shopTab === 'perm');
  document.getElementById('tab-cons').classList.toggle('active', shopTab === 'cons');
  if (!buildShop._greeted) {
    buildShop._greeted = true;
    setVendorLine(VENDOR_LINES.enter[(Math.random() * VENDOR_LINES.enter.length) | 0]);
  }
  const box = document.getElementById('shop-items');
  box.innerHTML = '';
  if (shopTab === 'perm') {
    for (const item of SHOP_PERM) {
      const el = document.createElement('div');
      el.className = 'shop-item';
      if (item.levels) {
        const lvl = SAVE.perm[item.id];           // 0..3
        const next = item.levels[lvl];
        const track = item.levels.map((L, i) => (i < lvl ? '✓' : '·') + ' N' + (i + 1) + ' ' + L.name + ' (' + L.price + ')').join('<br>');
        el.innerHTML = `<span class="si-icon">${item.icon}</span><h4>${item.name}</h4>
          <div class="si-track">${track}</div>
          <div class="si-desc">${next ? 'Próximo: ' + next.name + ' — ' + next.desc : 'NÍVEL MÁXIMO.'}</div>`;
        const btn = document.createElement('button');
        if (next) {
          btn.textContent = `COMPRAR — ${next.price} moedas`;
          btn.disabled = SAVE.coins < next.price;
          btn.onclick = () => buyPerm(item, next.price, () => SAVE.perm[item.id]++);
        } else { btn.textContent = 'COMPLETO'; btn.disabled = true; }
        el.appendChild(btn);
      } else {
        const owned = SAVE.perm[item.id];
        el.innerHTML = `<span class="si-icon">${item.icon}</span><h4>${item.name}</h4><div class="si-desc">${item.desc}</div>`;
        const btn = document.createElement('button');
        if (owned) { btn.textContent = 'ADQUIRIDO'; btn.disabled = true; }
        else {
          btn.textContent = `COMPRAR — ${item.price} moedas`;
          btn.disabled = SAVE.coins < item.price;
          btn.onclick = () => buyPerm(item, item.price, () => SAVE.perm[item.id] = true);
        }
        el.appendChild(btn);
      }
      box.appendChild(el);
    }
  } else {
    for (const item of SHOP_CONS) {
      const el = document.createElement('div');
      el.className = 'shop-item';
      const n = SAVE.cons[item.id] || 0;
      el.innerHTML = `<span class="si-icon">${item.icon}</span><h4>${item.name}</h4>
        <div class="si-desc">${item.desc}</div>
        <div class="si-stock">Em estoque: ${n} / ${item.max}</div>`;
      const btn = document.createElement('button');
      if (n >= item.max) { btn.textContent = 'ESTOQUE CHEIO'; btn.disabled = true; }
      else {
        btn.textContent = `COMPRAR — ${item.price} moedas`;
        btn.disabled = SAVE.coins < item.price;
        btn.onclick = () => {
          if (SAVE.coins < item.price) { setVendorLine(VENDOR_LINES.poor); return; }
          SAVE.coins -= item.price;
          SAVE.cons[item.id] = n + 1;
          saveGame();
          AudioSys.vendor();
          let line = VENDOR_LINES.buy[(Math.random() * VENDOR_LINES.buy.length) | 0];
          if (item.id === 'second') line = VENDOR_LINES.secondChanceWarn;
          setVendorLine(line);
          buildShop();
        };
      }
      el.appendChild(btn);
      box.appendChild(el);
    }
  }
}

function buyPerm(item, price, apply) {
  if (SAVE.coins < price) { setVendorLine(VENDOR_LINES.poor); return; }
  SAVE.coins -= price;
  apply();
  saveGame();
  AudioSys.vendor();
  let line = VENDOR_LINES.buy[(Math.random() * VENDOR_LINES.buy.length) | 0];
  if (item.id === 'map') line = VENDOR_LINES.mapWarn;
  setVendorLine(line);
  checkClienteFiel();
  buildShop();
}

function setVendorLine(txt) {
  document.getElementById('vendor-line').textContent = '"' + txt + '"';
}

// ---------- HUD ----------
function addCaption(txt) {
  if (!SAVE.settings.captions) return;
  const box = document.getElementById('hud-captions');
  if (!box) return;
  const el = document.createElement('div');
  el.textContent = txt;
  box.appendChild(el);
  setTimeout(() => el.remove(), 4000);
  while (box.children.length > 4) box.firstChild.remove();
}

function showHudMessage(txt) {
  const el = document.getElementById('hud-message');
  el.classList.remove('hidden');
  el.textContent = txt;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

let coinTimer = null;
function showCoinCounter() {
  const el = document.getElementById('hud-coins');
  el.classList.remove('hidden');
  el.style.opacity = 1;
  el.textContent = '🪙 ' + G.runCoins;
  clearTimeout(coinTimer);
  coinTimer = setTimeout(() => { el.style.opacity = 0; }, 2000);
}

function updateHudSlots() {
  const box = document.getElementById('hud-slots');
  box.innerHTML = '';
  G.consSlots.forEach((id, i) => {
    const el = document.createElement('div');
    el.className = 'hud-slot';
    if (id) {
      const item = SHOP_CONS.find(c => c.id === id);
      el.innerHTML = `${item.icon}<small>${SAVE.cons[id] || 0}</small>`;
      el.title = item.name;
    } else el.innerHTML = '·';
    const key = document.createElement('span');
    key.className = 'key';
    key.textContent = i + 1;
    el.appendChild(key);
    box.appendChild(el);
  });
}

function updatePetals(n) { // contador de olhares da Dama
  const el = document.getElementById('hud-petals');
  el.classList.remove('hidden');
  el.textContent = '🌸'.repeat(n) + '·'.repeat(Math.max(0, 3 - n));
}
