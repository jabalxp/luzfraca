// ============================================================
// LUZ FRACA — textures.js : texturas procedurais (sujeira, mofo,
// manchas) geradas em canvas. Nada de asset externo.
// ============================================================
import * as THREE from 'three';
import { TILE, MAP_W, MAP_H } from '../game/mapgen.js';

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// textura de superfície encardida: cor base + ruído + manchas escuras
export function grungeTexture(baseHex, { size = 256, noise = 0.22, stains = 10, lines = 0, seed = 7 } = {}) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const cx = cv.getContext('2d');
  const [r, g, b] = hexToRgb(baseHex);
  const rng = mulberry32(seed);
  cx.fillStyle = baseHex;
  cx.fillRect(0, 0, size, size);
  // ruído por pixel (blocos 2x2 para custo baixo)
  const img = cx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const v = 1 - noise / 2 + rng() * noise;
      for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) {
        const i = ((y + yy) * size + (x + xx)) * 4;
        d[i] = Math.min(255, r * v); d[i + 1] = Math.min(255, g * v); d[i + 2] = Math.min(255, b * v);
      }
    }
  }
  cx.putImageData(img, 0, 0);
  // manchas de umidade/mofo
  for (let i = 0; i < stains; i++) {
    const sx = rng() * size, sy = rng() * size, sr = 12 + rng() * 50;
    const gr = cx.createRadialGradient(sx, sy, 2, sx, sy, sr);
    const dark = rng() < 0.7;
    gr.addColorStop(0, dark ? 'rgba(8,8,4,0.36)' : 'rgba(70,66,40,0.18)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = gr;
    cx.beginPath(); cx.arc(sx, sy, sr, 0, 7); cx.fill();
  }
  // escorridos verticais
  for (let i = 0; i < stains / 2; i++) {
    const sx = rng() * size, sy = rng() * size * 0.5;
    cx.fillStyle = 'rgba(10,8,4,0.18)';
    cx.fillRect(sx, sy, 2 + rng() * 3, 30 + rng() * 90);
  }
  // linhas (azulejos / placas)
  if (lines) {
    cx.strokeStyle = 'rgba(0,0,0,0.4)';
    cx.lineWidth = 2;
    const step = size / lines;
    for (let i = 0; i <= lines; i++) {
      cx.beginPath(); cx.moveTo(i * step, 0); cx.lineTo(i * step, size); cx.stroke();
      cx.beginPath(); cx.moveTo(0, i * step); cx.lineTo(size, i * step); cx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const TILE_PX = 10;

// textura do chão inteiro: 1 célula do grid = TILE_PX px, pintada por tipo de tile
export function makeFloorTexture(map, level) {
  const cv = document.createElement('canvas');
  cv.width = MAP_W * TILE_PX; cv.height = MAP_H * TILE_PX;
  const cx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const paint = () => {
    const pal = level.palette;
    const rng = mulberry32(level.id * 131 + 17);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const v = map.t[y * MAP_W + x];
        let c = pal.floor;
        if (v === TILE.GRASS) c = '#2e3014';
        else if (v === TILE.PETAL) c = '#7a3c10';
        else if (v === TILE.DARK) c = '#070704';
        else if (v === TILE.GOD) c = '#16100c';
        else if (v === TILE.WATER) c = '#0a1416';
        else if (v === TILE.HIDE) c = pal.floor;
        cx.fillStyle = c;
        cx.fillRect(x * TILE_PX, y * TILE_PX, TILE_PX, TILE_PX);
        // variação por tile + sujeira
        const a = 0.05 + rng() * 0.16;
        cx.fillStyle = rng() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,250,230,${a * 0.25})`;
        cx.fillRect(x * TILE_PX, y * TILE_PX, TILE_PX, TILE_PX);
        if (v === TILE.PETAL) { // pétalas espalhadas
          for (let i = 0; i < 6; i++) {
            cx.fillStyle = `rgba(${200 + (rng() * 50 | 0)},${110 + (rng() * 50 | 0)},20,0.8)`;
            cx.fillRect(x * TILE_PX + rng() * TILE_PX, y * TILE_PX + rng() * TILE_PX, 2, 2);
          }
        }
        if (v === TILE.GRASS) {
          for (let i = 0; i < 5; i++) {
            cx.fillStyle = 'rgba(80,90,30,0.5)';
            cx.fillRect(x * TILE_PX + rng() * TILE_PX, y * TILE_PX + rng() * TILE_PX, 1, 3);
          }
        }
      }
    }
    // manchas grandes de abandono
    const rng2 = mulberry32(level.id * 977 + 5);
    for (let i = 0; i < 40; i++) {
      const sx = rng2() * cv.width, sy = rng2() * cv.height, sr = 10 + rng2() * 60;
      const gr = cx.createRadialGradient(sx, sy, 2, sx, sy, sr);
      gr.addColorStop(0, 'rgba(5,5,2,0.3)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = gr;
      cx.beginPath(); cx.arc(sx, sy, sr, 0, 7); cx.fill();
    }
    // neve acumulada (Ásia)
    if (level.snow) {
      for (let i = 0; i < 1600; i++) {
        cx.fillStyle = `rgba(220,228,238,${0.12 + rng2() * 0.3})`;
        cx.fillRect(rng2() * cv.width, rng2() * cv.height, 2, 2);
      }
    }
    tex.needsUpdate = true;
  };
  paint();
  return { texture: tex, repaint: paint };
}

// texto em textura (placar, telas)
export function textTexture(lines, { w = 256, h = 128, color = '#caa84a', bg = '#0a0a08', font = 'bold 40px monospace' } = {}) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d');
  cx.fillStyle = bg;
  cx.fillRect(0, 0, w, h);
  cx.fillStyle = color;
  cx.font = font;
  cx.textAlign = 'center';
  lines.forEach((ln, i) => cx.fillText(ln, w / 2, h / (lines.length + 1) * (i + 1) + 14));
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// brilho suave radial (sprites aditivos de luz falsa)
let _glowTex = null;
export function glowTexture() {
  if (_glowTex) return _glowTex;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const cx = cv.getContext('2d');
  const gr = cx.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 64, 64);
  _glowTex = new THREE.CanvasTexture(cv);
  return _glowTex;
}
