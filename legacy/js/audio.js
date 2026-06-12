// ============================================================
// LUZ FRACA — audio.js : todo o som é sintetizado via WebAudio
// Buses: master → music / fx / scare  (70% do terror é som)
// ============================================================
'use strict';

const AudioSys = {
  ctx: null, master: null, music: null, fx: null, scare: null,
  droneNodes: [], chaseNodes: [], heartbeat: null, started: false,
  noiseBuf: null,

  init() {
    if (this.started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    for (const b of ['music', 'fx', 'scare']) {
      this[b] = this.ctx.createGain();
      this[b].connect(this.master);
    }
    // buffer de ruído branco reutilizável (2s)
    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.started = true;
    this.applyVolumes();
  },

  applyVolumes() {
    if (!this.started) return;
    const s = SAVE.settings;
    this.master.gain.value = (s.volMaster / 100) ** 1.5;
    this.music.gain.value = s.volMusic / 100;
    this.fx.gain.value = s.volFx / 100;
    this.scare.gain.value = s.volScare / 100;
  },

  now() { return this.ctx ? this.ctx.currentTime : 0; },

  // ---------- utilitários ----------
  noise(bus, dur, { freq = 800, q = 1, gain = 0.3, attack = 0.01, type = 'bandpass', pan = 0 } = {}) {
    if (!this.started) return;
    const t = this.now();
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf; src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = this.ctx.createStereoPanner(); p.pan.value = pan;
    src.connect(f); f.connect(g); g.connect(p); p.connect(bus);
    src.start(t); src.stop(t + dur + 0.1);
  },

  tone(bus, dur, { freq = 440, type = 'sine', gain = 0.2, attack = 0.01, slide = 0, pan = 0 } = {}) {
    if (!this.started) return;
    const t = this.now();
    const o = this.ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = this.ctx.createStereoPanner(); p.pan.value = pan;
    o.connect(g); g.connect(p); p.connect(bus);
    o.start(t); o.stop(t + dur + 0.1);
  },

  // pan/volume espacial a partir de posição relativa ao jogador
  spatial(dx, dy, angle, maxDist) {
    const dist = Math.hypot(dx, dy);
    if (dist > maxDist) return null;
    const rel = Math.atan2(dy, dx) - angle;
    return { pan: Math.max(-1, Math.min(1, Math.sin(rel))), vol: Math.max(0.02, 1 - dist / maxDist) };
  },

  // ---------- sons do jogo ----------
  uiClick() { this.tone(this.fx, 0.06, { freq: 900, type: 'square', gain: 0.05 }); },
  coinClink(quiet) { // clink metálico abafado
    this.tone(this.fx, 0.12, { freq: 2400, type: 'triangle', gain: quiet ? 0.03 : 0.12 });
    this.tone(this.fx, 0.18, { freq: 3170, type: 'sine', gain: quiet ? 0.02 : 0.07 });
  },
  batteryPickup() { this.tone(this.fx, 0.2, { freq: 600, type: 'square', gain: 0.07, slide: 300 }); },
  lanternClick() { this.noise(this.fx, 0.04, { freq: 3000, gain: 0.1, q: 3 }); },
  footstep(running, surface) {
    const f = surface === 'water' ? 500 : surface === 'snow' ? 1800 : 150;
    this.noise(this.fx, running ? 0.13 : 0.09, { freq: f + Math.random() * 60, gain: running ? 0.16 : 0.06, q: 0.8, type: surface === 'water' ? 'bandpass' : 'lowpass' });
  },
  gasp() { // arquejo de estamina zerada
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.noise(this.fx, 0.4, { freq: 900, gain: 0.12, q: 1.5, attack: 0.1 }), i * 500);
    }
  },
  breathRelease() { this.noise(this.fx, 0.5, { freq: 700, gain: 0.2, q: 1, attack: 0.02 }); },
  paperSting() { // sting grave do papel
    this.tone(this.scare, 1.8, { freq: 65, type: 'sawtooth', gain: 0.35, slide: -30 });
    this.tone(this.scare, 1.8, { freq: 67, type: 'sawtooth', gain: 0.3, slide: -32 });
    this.whisper('encontre a saída');
  },
  doorUnlock() { // eco pelo mapa
    this.tone(this.fx, 0.4, { freq: 120, type: 'square', gain: 0.25, slide: -60 });
    setTimeout(() => this.noise(this.fx, 1.5, { freq: 200, gain: 0.15, q: 0.5, attack: 0.3 }), 300);
  },
  whisper(txt) { // sussurro = ruído filtrado modulado
    const n = Math.min(8, Math.ceil(txt.length / 3));
    for (let i = 0; i < n; i++) {
      setTimeout(() => this.noise(this.scare, 0.18, { freq: 2000 + Math.random() * 2500, gain: 0.06, q: 6 }), i * 130);
    }
  },
  jumpscare() {
    this.noise(this.scare, 0.8, { freq: 400, gain: 0.65, q: 0.4, attack: 0.005 });
    this.tone(this.scare, 0.9, { freq: 1100, type: 'sawtooth', gain: 0.4, slide: -900 });
    this.tone(this.scare, 1.2, { freq: 55, type: 'sawtooth', gain: 0.5 });
  },
  secondChance() {
    this.tone(this.scare, 0.5, { freq: 2000, type: 'sine', gain: 0.25, slide: -1500 });
    this.noise(this.fx, 0.6, { freq: 3000, gain: 0.2, q: 0.7 });
  },
  bellThrow() {
    for (let i = 0; i < 4; i++) setTimeout(() => this.tone(this.fx, 0.5, { freq: 2100 - i * 80, type: 'triangle', gain: 0.18 }), i * 160);
  },
  adrenalineFx() { this.tone(this.fx, 0.3, { freq: 300, type: 'square', gain: 0.15, slide: 500 }); },
  vendor() { this.noise(this.fx, 0.5, { freq: 250, gain: 0.07, q: 2, attack: 0.1 }); },
  winSound() {
    [220, 277, 330, 440].forEach((f, i) => setTimeout(() => this.tone(this.music, 1.2, { freq: f, type: 'sine', gain: 0.12 }), i * 350));
  },

  // sons-radar diegéticos dos monstros (chamados com posição espacial)
  radar(kind, sp, intensity = 1) {
    if (!sp) return;
    const g = sp.vol * intensity;
    switch (kind) {
      case 'claps': // 3 palmas ecoando
        for (let i = 0; i < 3; i++) setTimeout(() => this.noise(this.fx, 0.25, { freq: 1200, gain: 0.4 * g, q: 2, pan: sp.pan }), i * 420);
        break;
      case 'cart':
        this.noise(this.fx, 0.35, { freq: 3200 + Math.random() * 800, gain: 0.08 * g, q: 8, pan: sp.pan });
        break;
      case 'crying': // choro: MAIS BAIXO quanto mais perto (invertido!)
        this.tone(this.fx, 0.9, { freq: 600 + Math.random() * 200, type: 'sine', gain: 0.1 * (1.05 - sp.vol), attack: 0.3, slide: -150, pan: sp.pan });
        break;
      case 'hum': break; // tratado pelo drone (mudança de tom)
      case 'buzz':
        this.tone(this.fx, 0.4, { freq: 170 + Math.random() * 40, type: 'sawtooth', gain: 0.05 * g, pan: sp.pan });
        break;
      case 'howl':
        this.tone(this.scare, 2.2, { freq: 300, type: 'sawtooth', gain: 0.25 * g, attack: 0.4, slide: -160, pan: sp.pan });
        break;
      case 'whistle': // assobio que erra a melodia
        [880, 990, 870 + Math.random() * 100].forEach((f, i) => setTimeout(() => this.tone(this.fx, 0.22, { freq: f, type: 'sine', gain: 0.09 * g, pan: sp.pan }), i * 240));
        break;
      case 'clonc':
        this.noise(this.fx, 0.3, { freq: 90, gain: 0.5 * g, q: 1.5, type: 'lowpass', pan: sp.pan });
        break;
      case 'drip':
        this.tone(this.fx, 0.12, { freq: 1700, type: 'sine', gain: 0.12 * g, slide: -900, pan: sp.pan });
        break;
      case 'sweep':
        this.noise(this.fx, 0.5, { freq: 500, gain: 0.07 * g, q: 1, pan: sp.pan });
        break;
      case 'hook':
        this.noise(this.fx, 0.4, { freq: 220, gain: 0.2 * g, q: 3, type: 'lowpass', pan: sp.pan });
        break;
      case 'song': // canto da sereia
        [523, 622, 587, 466].forEach((f, i) => setTimeout(() => this.tone(this.music, 0.8, { freq: f * (1 + (Math.random() - 0.5) * 0.02), type: 'sine', gain: 0.13 * g, attack: 0.2, pan: sp.pan }), i * 600));
        break;
      case 'gurgle':
        this.noise(this.fx, 0.5, { freq: 300, gain: 0.2 * g, q: 4, pan: sp.pan });
        break;
      case 'sermon': // sermão grave contínuo
        this.tone(this.fx, 0.5, { freq: 110 + Math.random() * 50, type: 'sawtooth', gain: 0.07 * g, attack: 0.1, pan: sp.pan });
        break;
      case 'murmur':
        this.noise(this.fx, 0.6, { freq: 400 + Math.random() * 300, gain: 0.04 * g, q: 5, pan: sp.pan });
        break;
      case 'choirNote': // nota do coro dos Fiéis
        this.tone(this.scare, 1.4, { freq: 220 * Math.pow(2, (Math.random() * 5 | 0) / 12), type: 'triangle', gain: 0.2 * g, attack: 0.3, pan: sp.pan });
        break;
      case 'breath': // respiração do Deus Cego
        this.noise(this.scare, 2.5, { freq: 60, gain: 0.5 * g, q: 0.5, type: 'lowpass', attack: 0.8 });
        break;
      case 'thunder':
        this.noise(this.scare, 1.2, { freq: 80, gain: 0.5 * g, q: 0.5, type: 'lowpass', attack: 0.01, pan: sp.pan });
        break;
      case 'drum':
        this.tone(this.music, 0.25, { freq: 70, type: 'sine', gain: 0.3 * g, slide: -25, pan: sp.pan });
        break;
      case 'bellToll':
        this.tone(this.fx, 2.5, { freq: 160, type: 'triangle', gain: 0.25 * g, attack: 0.01, pan: sp.pan });
        this.tone(this.fx, 2.5, { freq: 403, type: 'sine', gain: 0.1 * g, pan: sp.pan });
        break;
    }
  },

  // ---------- drone ambiente por fase (loop contínuo) ----------
  startDrone(kind) {
    this.stopDrone();
    if (!this.started) return;
    const mk = (type, freq, gain, lfoFreq = 0, lfoAmt = 0) => {
      const o = this.ctx.createOscillator();
      o.type = type; o.frequency.value = freq;
      const g = this.ctx.createGain(); g.gain.value = gain;
      if (lfoFreq) {
        const lfo = this.ctx.createOscillator(); lfo.frequency.value = lfoFreq;
        const lg = this.ctx.createGain(); lg.gain.value = lfoAmt;
        lfo.connect(lg); lg.connect(g.gain); lfo.start();
        this.droneNodes.push(lfo);
      }
      o.connect(g); g.connect(this.music); o.start();
      this.droneNodes.push(o, g);
      return o;
    };
    const mkNoise = (freq, q, gain, type = 'bandpass') => {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf; src.loop = true;
      const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = this.ctx.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(this.music); src.start();
      this.droneNodes.push(src, g);
      return f;
    };
    switch (kind) {
      case 'wind': mkNoise(400, 0.6, 0.05, 'lowpass'); mk('sine', 48, 0.05, 0.12, 0.03); break;
      case 'freezer': mk('sawtooth', 49, 0.035); mk('sine', 98, 0.025, 0.3, 0.01); mkNoise(8000, 5, 0.008); break;
      case 'hum60': this.humOsc = mk('sawtooth', 60, 0.05); mk('sine', 120, 0.02); break;
      case 'guitar': mk('triangle', 82, 0.025, 0.08, 0.015); mkNoise(600, 0.5, 0.02, 'lowpass'); break;
      case 'crickets': this.cricketGain = (() => { const f = mkNoise(4200, 8, 0.025); return this.droneNodes[this.droneNodes.length - 1]; })(); mk('sine', 55, 0.04); break;
      case 'cicadas': mkNoise(3400, 6, 0.03); mk('sine', 60, 0.035, 0.07, 0.02); break;
      case 'machine': mk('square', 50, 0.02); mk('sine', 100, 0.03, 1.2, 0.015); mkNoise(2000, 2, 0.008); break;
      case 'snowwind': mkNoise(900, 0.4, 0.045, 'lowpass'); mk('sine', 220, 0.008, 0.05, 0.006); break;
      case 'ocean': mkNoise(250, 0.4, 0.07, 'lowpass'); mk('sine', 40, 0.05, 0.08, 0.04); break;
      case 'chant': mk('triangle', 65, 0.04, 0.1, 0.02); mk('triangle', 98, 0.025); mkNoise(150, 1, 0.02, 'lowpass'); break;
    }
  },
  stopDrone() {
    for (const n of this.droneNodes) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} }
    this.droneNodes = []; this.humOsc = null; this.cricketGain = null;
  },
  // Errante: zumbido muda de tom quando perto
  setHumProximity(p) { // p: 0 longe → 1 colado
    if (this.humOsc) this.humOsc.frequency.value = 60 + p * 35;
  },
  setCricketSilence(p) { // grilos calam perto do Impundulu
    if (this.cricketGain) this.cricketGain.gain.value = 0.025 * (1 - p);
  },

  // ---------- música de caçada ----------
  startChase(levelId) {
    if (this.chaseNodes.length || !this.started) return;
    const tempoMap = [150, 140, 120, 130, 160, 145, 125, 135, 140, 110];
    const bpm = tempoMap[levelId] || 140;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55;
    const g = this.ctx.createGain(); g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(0.16, this.now() + 0.6);
    const lfo = this.ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = bpm / 60;
    const lg = this.ctx.createGain(); lg.gain.value = 0.1;
    lfo.connect(lg); lg.connect(g.gain);
    o.connect(g); g.connect(this.music);
    o.start(); lfo.start();
    const o2 = this.ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 58.3;
    const g2 = this.ctx.createGain(); g2.gain.value = 0.07;
    o2.connect(g2); g2.connect(this.music); o2.start();
    this.chaseNodes = [o, lfo, o2, g, g2];
  },
  stopChase() {
    for (const n of this.chaseNodes) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} }
    this.chaseNodes = [];
  },

  // ---------- batimentos (Radar de Batimentos / tensão) ----------
  heartbeatPulse(rate) { // rate: 0 desliga, 1 = lento, 2 = rápido
    const t = this.now();
    if (!this._lastBeat) this._lastBeat = 0;
    const interval = rate >= 2 ? 0.4 : 0.85;
    if (t - this._lastBeat > interval) {
      this._lastBeat = t;
      this.tone(this.fx, 0.12, { freq: 55, type: 'sine', gain: 0.3, slide: -15 });
      setTimeout(() => this.tone(this.fx, 0.1, { freq: 48, type: 'sine', gain: 0.2, slide: -12 }), 140);
    }
  },

  silenceAll() { this.stopDrone(); this.stopChase(); },
};
