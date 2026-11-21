// CLAIM CHECK — a case file in thirteen exhibits.
// Style: Halftone Dossier. Everything is drawn from the timeline; render(t) is a pure function of t.
import { SCENES, DUR, CUTS } from './timeline.js';

const W = 1920, H = 1080, M = 96;
const INK = '#1b2230', CREAM = '#efe6d2', PAPER = '#e9dfc7', RED = '#b23127',
  GOLD = '#c99a3c', MUT = '#6d6553', BLUE = '#2b4a6f';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = (t) => t * t * (3 - 2 * t);
const eo = (t) => 1 - Math.pow(1 - t, 3);
const ei = (t) => t * t * t;
const backOut = (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

let cv, ctx, paper, imgs = {}, cur = 0, fps = 30;

/* ───────────────────────── paper ───────────────────────── */
function buildPaper() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);

  // mottling: soft blobs, then per-pixel fibre
  for (let i = 0; i < 260; i++) {
    const x = hash(i) * W, y = hash(i + 900) * H, r = 30 + hash(i + 40) * 190;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const dark = hash(i + 7) > 0.5;
    grad.addColorStop(0, dark ? 'rgba(120,96,52,0.035)' : 'rgba(255,250,236,0.055)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const d = g.getImageData(0, 0, W, H), p = d.data;
  for (let i = 0, n = 0; i < p.length; i += 4, n++) {
    const v = (hash(n) - 0.5) * 13;
    p[i] += v; p[i + 1] += v; p[i + 2] += v * 0.9;
  }
  g.putImageData(d, 0, 0);

  // vignette and the centre fold
  const vg = g.createRadialGradient(W * 0.5, H * 0.46, H * 0.25, W * 0.5, H * 0.5, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(70,52,20,0.20)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const fold = g.createLinearGradient(W * 0.5 - 26, 0, W * 0.5 + 26, 0);
  fold.addColorStop(0, 'rgba(0,0,0,0)'); fold.addColorStop(0.5, 'rgba(60,44,16,0.075)');
  fold.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fold; g.fillRect(W * 0.5 - 26, 0, 52, H);
  return c;
}

/* ───────────────────────── print ───────────────────────── */
function halftone(x, y, w, h, step, angle, density, color, alpha = 1, o = {}) {
  const feather = o.feather === undefined ? 64 : o.feather;
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + step;
  // a band that touches the frame keeps its hard edge there; every edge that meets paper fades
  const fL = x > 1, fR = x + w < W - 1, fT = y > 1, fB = y + h < H - 1;
  ctx.save();
  ctx.fillStyle = color;
  for (let j = -R; j < R; j += step) {
    for (let i = -R; i < R; i += step) {
      const px = cx + i * ca - j * sa, py = cy + i * sa + j * ca;
      if (px < x - step || px > x + w + step || py < y - step || py > y + h + step) continue;
      let f = 1;
      if (fL) f = Math.min(f, (px - x) / feather);
      if (fR) f = Math.min(f, (x + w - px) / feather);
      if (fT) f = Math.min(f, (py - y) / feather);
      if (fB) f = Math.min(f, (y + h - py) / feather);
      f = ss(clamp(f));
      if (f <= 0.02) continue;
      const den = density(px, py) * f;
      if (den <= 0.02) continue;
      const r = Math.min(step * 0.66, den * step * 0.62);
      if (r < 0.25) continue;
      ctx.globalAlpha = alpha * clamp(f * 1.1);
      ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/* dots that dissolve into the paper: no clip, no edge — each dot carries its own fade */
function halftoneSoft(x, y, w, h, step, angle, density, color, alpha = 1, o = {}) {
  const { core = 0.34, edge = 1.02 } = o;
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = x + w / 2, cy = y + h / 2;
  const rx = (w / 2) * edge, ry = (h / 2) * edge;
  const R = Math.hypot(w, h) / 2 + step;
  ctx.save();
  ctx.fillStyle = color;
  for (let j = -R; j < R; j += step) {
    for (let i = -R; i < R; i += step) {
      const px = cx + i * ca - j * sa, py = cy + i * sa + j * ca;
      const d = Math.hypot((px - cx) / rx, (py - cy) / ry);   // 0 centre, 1 at the ring
      if (d >= 1) continue;
      const fall = ss(clamp((1 - d) / (1 - core)));
      const den = density(px, py) * fall;
      if (den <= 0.02) continue;
      const r = Math.min(step * 0.66, den * step * 0.62);
      if (r < 0.25) continue;
      ctx.globalAlpha = alpha * clamp(fall * 1.2);
      ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function edgeDensity(px, py) {
  const dx = Math.min(px, W - px) / W, dy = Math.min(py, H - py) / H;
  const d = Math.min(dx, dy);
  return clamp(1 - d / 0.30) * 1.05;
}

function grain(t) {
  const f = Math.floor(t * 15);
  ctx.save();
  for (let i = 0; i < 520; i++) {
    const x = hash(i * 3 + f * 71) * W, y = hash(i * 5 + f * 37) * H;
    const ink = hash(i * 7 + f * 13) > 0.55;
    ctx.fillStyle = ink ? 'rgba(30,28,20,0.30)' : 'rgba(255,252,240,0.45)';
    const s = 1 + hash(i + f) * 2.2;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

/* ───────────────────────── type ───────────────────────── */
function font(size, weight = 900, family = 'Playfair', italic = false) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${family}"`;
}
function txt(s, x, y, o = {}) {
  const { size = 32, weight = 900, family = 'Playfair', color = INK, align = 'left',
    track = 0, alpha = 1, italic = false, baseline = 'alphabetic' } = o;
  font(size, weight, family, italic);
  ctx.letterSpacing = `${track}px`;
  ctx.fillStyle = color; ctx.globalAlpha = alpha;
  ctx.textAlign = align; ctx.textBaseline = baseline;
  ctx.fillText(s, x, y);
  ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
}
function label(s, x, y, o = {}) {
  txt(s, x, y, { size: 17, weight: 800, family: 'Mono', track: 2.2, color: MUT, ...o });
}
function italicFill(s, x, y, size, color = INK) {
  txt(s, x, y, { size, weight: 400, italic: true, color });
}

/* ───────────────────────── apparatus ───────────────────────── */
function card(x, y, w, h, { fill = 'rgba(255,251,238,0.72)', shadow = true, stroke = 'rgba(27,34,48,0.55)' } = {}) {
  ctx.save();
  if (shadow) { ctx.fillStyle = 'rgba(40,30,12,0.16)'; ctx.fillRect(x + 7, y + 9, w, h); }
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

function stamp(labelText, x, y, o = {}) {
  const { scale = 1, rot = -0.09, p = 1, color = RED, size = 62, padX = 26, padY = 14, alpha = 0.93 } = o;
  if (p <= 0) return;
  const k = p < 0.24 ? lerp(2.5, 1, ei(p / 0.24)) : 1 + Math.sin((p - 0.24) * 9) * 0.02 * (1 - clamp((p - 0.24) / 0.5));
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale * k, scale * k);
  font(size, 900, 'Inter');
  const w = ctx.measureText(labelText).width + padX * 2, h = size + padY * 2;
  ctx.globalAlpha = alpha * clamp(p * 6);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(4, size * 0.085);
  const r = 8;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2); ctx.lineTo(w / 2 - r, -h / 2); ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  ctx.lineTo(w / 2, h / 2 - r); ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  ctx.lineTo(-w / 2 + r, h / 2); ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  ctx.lineTo(-w / 2, -h / 2 + r); ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  ctx.closePath(); ctx.stroke();
  ctx.lineWidth = 1.4; ctx.globalAlpha = alpha * 0.55 * clamp(p * 6);
  ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
  // mottled ink: three offset passes
  ctx.globalAlpha = alpha * clamp(p * 6);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(labelText, 0, 1);
  ctx.globalAlpha = alpha * 0.28 * clamp(p * 6);
  ctx.fillText(labelText, 1.6, 1.8); ctx.fillText(labelText, -1.4, -1.2);
  ctx.restore();
  ctx.globalAlpha = 1;
}

function hud(sceneId, t) {
  const idx = SCENES.findIndex((s) => s.id === sceneId);
  label('CASE 2024/825', M, 64, { color: INK });
  label(`EXHIBIT ${String(idx + 1).padStart(2, '0')} / 13`, M, 88);
  const blink = (Math.floor(t * 1.5) % 2 === 0) ? 1 : 0.25;
  ctx.globalAlpha = blink; ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(W - M - 178, 58, 6, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
  label('27.09.2026', W - M, 64, { align: 'right', color: INK });
  label('ENFORCED', W - M, 88, { align: 'right' });
}

/* caption bar: the spoken line, one line, keyword in the highlight ink */
function caption(sc, t) {
  if (t < sc.voiceAt - 0.15 || t > sc.voiceEnd + 2.2) return;
  const inP = clamp((t - (sc.voiceAt - 0.15)) / 0.28);
  let text = sc.cap;
  const key = sc.capKey;
  font(27, 700, 'Inter');
  const maxW = 1580;
  while (ctx.measureText(text).width > maxW && text.length > 30) text = text.slice(0, -2).trim() + '…';
  const baseY = 1006;
  const lift = (1 - inP) * 10;
  ctx.save();
  ctx.globalAlpha = inP;
  ctx.translate(0, lift);
  // measure parts: the whole line is drawn even when no keyword is set
  const padX = 34, hgt = 62;
  let pre = text, post = '', kw = '';
  if (key && text.includes(key)) {
    const parts = text.split(key);
    pre = parts[0]; kw = key; post = parts.slice(1).join(key);
  }
  font(27, 700, 'Inter');
  const totalW = ctx.measureText(text).width;
  const bw = totalW + padX * 2;
  const x0 = W / 2 - bw / 2;
  // pill
  ctx.fillStyle = INK;
  const rr = 12;
  ctx.beginPath();
  ctx.moveTo(x0 + rr, baseY - hgt / 2); ctx.lineTo(x0 + bw - rr, baseY - hgt / 2);
  ctx.quadraticCurveTo(x0 + bw, baseY - hgt / 2, x0 + bw, baseY - hgt / 2 + rr);
  ctx.lineTo(x0 + bw, baseY + hgt / 2 - rr); ctx.quadraticCurveTo(x0 + bw, baseY + hgt / 2, x0 + bw - rr, baseY + hgt / 2);
  ctx.lineTo(x0 + rr, baseY + hgt / 2); ctx.quadraticCurveTo(x0, baseY + hgt / 2, x0, baseY + hgt / 2 - rr);
  ctx.lineTo(x0, baseY - hgt / 2 + rr); ctx.quadraticCurveTo(x0, baseY - hgt / 2, x0 + rr, baseY - hgt / 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(201,154,60,0.5)';
  ctx.fillRect(x0 + 10, baseY + hgt / 2 - 5, bw - 20, 3);
  // text
  const tx = x0 + padX, ty = baseY + 9;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  font(27, 700, 'Inter');
  let cx = tx;
  ctx.fillStyle = CREAM; ctx.fillText(pre, cx, ty); cx += ctx.measureText(pre).width;
  if (kw) {
    ctx.fillStyle = GOLD; ctx.fillText(kw, cx, ty); cx += ctx.measureText(kw).width;
  }
  ctx.fillStyle = CREAM; ctx.fillText(post, cx, ty);
  ctx.restore();
}

/* ───────────────────────── dot wipe ───────────────────────── */
function wipe(t) {
  let best = 0, bd = 1e9;
  for (const c of CUTS) { const d = Math.abs(t - c); if (d < bd) { bd = d; best = c; } }
  const half = 0.26;
  if (bd > half) return;
  const p = 1 - bd / half;
  const step = 30, cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1;
  ctx.save(); ctx.fillStyle = '#141a24';
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const delay = ((i / cols) * 0.55 + (j / rows) * 0.45) * 0.42;
      const q = clamp((p - delay) / 0.58);
      if (q <= 0) continue;
      const r = q * step * 0.82;
      ctx.beginPath(); ctx.arc(i * step, j * step, r, 0, 6.2832); ctx.fill();
    }
  }
  ctx.restore();
}

/* ───────────────────────── scenes ───────────────────────── */
const S = {};

// 01 — the claim, and the stamp
S.hook = (u) => {
  const typed = clamp(u / 1.5);
  const s = 'Biodegradable formula.';
  const n = Math.floor(s.length * typed);
  label('PRODUCT PAGE · SAVED 21 NOV 2026', M, 300);
  txt(s.slice(0, n), M, 430, { size: 104 });
  if (u < 1.5 && n % 2 === 0) { ctx.fillStyle = RED; ctx.fillRect(M + (n ? ctx.measureText(s.slice(0, n)).width : 0) + 6, 344, 5, 92); }
  label('ONE OF THIRTEEN SHOP PAGES SAVED FOR THE 21 NOVEMBER RUN', M, 486);
  const p = seg(u, 2.55, 2.85);
  stamp('BANNED', 1500, 300, { p, size: 78, rot: -0.075 });
  if (p > 0) {
    const a = clamp(1 - seg(u, 2.55, 2.95));
    ctx.fillStyle = `rgba(255,255,255,${0.42 * a})`; ctx.fillRect(0, 0, W, H);
  }
  if (u > 3.2) {
    ctx.globalAlpha = clamp((u - 3.2) / 0.4);
    ctx.strokeStyle = RED; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(M, 552); ctx.lineTo(M + 92, 552); ctx.stroke();
    label('ANNEX I, POINT 4a · DIRECTIVE (EU) 2024/825', M + 110, 559, { color: INK });
    ctx.globalAlpha = 1;
  }
  halftone(0, 0, W, 130, 24, 15, (px, py) => clamp(1 - py / 130), INK, 0.05);
};

// 02 — title
S.title = (u) => {
  const p = seg(u, 0.15, 0.85);
  halftoneSoft(1120, 60, 880, 1010, 24, 22, (px, py) => clamp(1 - Math.hypot(px - 1560, py - 540) / 640) * 0.92, RED, 0.34, { core: 0.30, edge: 1.04 });
  const chars = 'CLAIM CHECK'.split('');
  let x = M;
  ctx.save();
  chars.forEach((ch, i) => {
    const q = seg(u, 0.12 + i * 0.035, 0.42 + i * 0.035);
    if (q <= 0) return;
    font(148, 900, 'Playfair');
    const w = ctx.measureText(ch).width;
    const drop = (1 - backOut(q)) * -46;
    ctx.globalAlpha = clamp(q * 1.6);
    ctx.fillStyle = INK; ctx.fillText(ch, x, 430 + drop);
    x += w * 0.985;
  });
  ctx.restore();
  if (u > 0.75) {
    ctx.globalAlpha = clamp((u - 0.75) / 0.4);
    txt('the sentence · the rule · the article', M, 500, { size: 34, weight: 500, family: 'Inter', color: INK });
    ctx.globalAlpha = 1;
  }
  if (u > 1.25) {
    ctx.globalAlpha = clamp((u - 1.25) / 0.5);
    italicFill('Marks the claims that are now illegal,', M, 700, 40);
    italicFill('on the page you are shopping on.', M, 752, 40);
    ctx.globalAlpha = 1;
  }
  if (u > 1.9) {
    ctx.globalAlpha = clamp((u - 1.9) / 0.4);
    label('GENHACKS 2026 · HEALTHCARE & ENVIRONMENTAL', M, 830);
    ctx.globalAlpha = 1;
  }
  const pp = seg(u, 2.4, 2.75);
  stamp('CASE FILE', 1560, 300, { p: pp, size: 46, color: BLUE, rot: 0.06 });
};

// 03 — the law and its date
S.law = (u) => {
  label('DIRECTIVE (EU) 2024/825', M, 210);
  const p = seg(u, 0.2, 0.9);
  txt('27 SEP', M, 380, { size: 132, alpha: clamp(p * 2) });
  txt('2026', M, 500, { size: 132, alpha: clamp(p * 2) });
  ctx.globalAlpha = clamp(seg(u, 0.5, 0.9));
  ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.beginPath();
  ctx.moveTo(M, 542); ctx.lineTo(M + 420, 542); ctx.stroke(); ctx.globalAlpha = 1;
  const rows = [
    ['generic green claims', 'banned outright', 1.6],
    ['stock already on shelves', 'in scope', 3.9],
    ['no proof, no claim', 'the seller carries it', 6.4],
  ];
  ctx.save();
  ctx.strokeStyle = 'rgba(27,34,48,0.22)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(960, 250); ctx.lineTo(960, 700); ctx.stroke();
  ctx.restore();
  rows.forEach(([a, b, at], i) => {
    const q = seg(u, at, at + 0.45);
    if (q <= 0) return;
    const y = 320 + i * 170, x = 1040 + (1 - eo(q)) * 26;
    ctx.globalAlpha = q;
    const arm1 = clamp(q / 0.42), arm2 = clamp((q - 0.42) / 0.58);
    ctx.save();
    ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - 4);
    if (arm1 > 0) ctx.lineTo(x + 30 * arm1, y + 24 * arm1);
    if (arm2 > 0) ctx.lineTo(x + 30 + 66 * arm2, y + 24 - 80 * arm2);
    ctx.stroke(); ctx.restore();
    txt(a, x + 92, y, { size: 44, weight: 700, family: 'Inter' });
    label(b.toUpperCase(), x + 92, y + 34);
    ctx.globalAlpha = 1;
  });
  halftone(980, 760, 900, 260, 24, 15, (px, py) => clamp((py - 760) / 260) * 0.5, INK, 0.07);
};

// 04 — three exhibits
S.three = (u) => {
  label('THE WORDS THE DIRECTIVE NAMES FIRST', M, 180);
  txt('Three ways to say nothing.', M, 268, { size: 64 });
  const items = [
    ['eco-friendly', 'generic claim · Annex I, 4a', 2.15],
    ['climate neutral', 'offset-based · Annex I, 4c', 3.40],
    ['biodegradable', 'generic claim · Annex I, 4a', 4.65],
  ];
  items.forEach(([word, sub, at], i) => {
    const x = M + i * 590, y = 360, w = 520, h = 420;
    const inn = seg(u, 0.35 + i * 0.12, 0.75 + i * 0.12);
    if (inn <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(inn * 1.6); ctx.translate(0, (1 - eo(inn)) * 26);
    card(x, y, w, h);
    label(`0${i + 1}`, x + 34, y + 62, { color: RED, size: 22 });
    txt(word, x + 34, y + 210, { size: 52, weight: 900, family: 'Playfair' });
    label(sub.toUpperCase(), x + 34, y + 254, { size: 14, track: 1.4 });
    ctx.restore();
    const p = seg(u, at, at + 0.3);
    stamp('BANNED', x + w / 2 + 10, y + 330, { p, size: 52, rot: -0.07, scale: 0.92 });
  });
};

// 05 — the page, as an exhibit
S.product = (u) => {
  const push = 1 + 0.05 * ss(seg(u, 0, 9));
  const w = 960, h = 752, x = M, y = 150;
  ctx.save();
  ctx.translate(W * 0.36, H * 0.52); ctx.scale(push, push); ctx.translate(-W * 0.36, -H * 0.52);
  card(x - 14, y - 14, w + 28, h + 28, { fill: 'rgba(255,252,242,0.9)' });
  ctx.save();
  ctx.filter = 'grayscale(0.15) contrast(1.04) brightness(0.99)';
  ctx.drawImage(imgs.demo, x, y, w, h);
  ctx.restore();
  // the column the checker fills
  const bw = 528, bx = x + 412, by = y + 42, bh = 636;
  const q = seg(u, 1.5, 2.3);
  if (q > 0) {
    ctx.strokeStyle = RED; ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, bw, bh * q);
    if (q > 0.9) {
      ctx.globalAlpha = clamp((q - 0.9) / 0.3);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
  const r = M + w + 90;
  txt('The page,', r, 300, { size: 58 });
  txt('read in the', r, 366, { size: 58 });
  txt('browser.', r, 432, { size: 58 });
  italicFill('Visible text only.', r, 506, 32, MUT);
  label('NOTHING IS UPLOADED', r, 548, { color: RED });
  txt('4 banned', r, 636, { size: 34, weight: 800, family: 'Inter' });
  txt('2 need evidence', r, 680, { size: 34, weight: 800, family: 'Inter' });
  label('DEMO PAGE · SYNTHETIC COPY', r, 736, { size: 14 });
  label('WRITTEN FOR THIS FILM', r, 760, { size: 14 });
  halftone(r, 760, 520, 180, 22, 15, (px, py) => clamp((py - 760) / 180) * 0.55, INK, 0.08);
};

// 06 — anatomy of one finding
S.anatomy = (u) => {
  label('ONE FINDING, IN FULL', M, 170);
  txt('An argument you can check.', M, 244, { size: 56 });
  const x = M, y = 336, w = 940, h = 286;
  card(x, y, w, h);
  const line1 = 'Our ', line1b = 'eco-friendly', line1c = ' bottle is carbon neutral';
  const line2 = 'and packaged in biodegradable wrap.';
  txt(line1, x + 40, y + 112, { size: 40, weight: 500, family: 'Inter' });
  font(40, 500, 'Inter');
  const w1 = ctx.measureText(line1).width;
  const mq = seg(u, 0.9, 1.5);
  if (mq > 0) {
    ctx.fillStyle = `rgba(178,49,39,${0.18 * clamp(mq * 2)})`;
    ctx.fillRect(x + 44 + w1, y + 76, (228 * mq), 48);
    ctx.strokeStyle = RED; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 44 + w1, y + 128); ctx.lineTo(x + 44 + w1 + 228 * mq, y + 126); ctx.stroke();
  }
  txt(line1b, x + 44 + w1, y + 112, { size: 40, weight: 700, family: 'Inter' });
  txt(line1c, x + 44 + w1 + 228, y + 112, { size: 40, weight: 500, family: 'Inter' });
  txt(line2, x + 40, y + 176, { size: 40, weight: 500, family: 'Inter' });
  label('QUOTED FROM THE PAGE, PHRASE MARKED', x + 40, y + 238);

  const rows = [
    ['01', 'the sentence', 'what the shopper actually reads', 1.8],
    ['02', 'the rule', 'Generic environmental claim', 3.2],
    ['03', 'the article', 'Annex I, point 4a', 4.6],
  ];
  rows.forEach(([n, a, b, at], i) => {
    const q = seg(u, at, at + 0.4);
    if (q <= 0) return;
    const yy = 366 + i * 158, xx = 1090 + (1 - eo(q)) * 30;
    ctx.globalAlpha = q;
    txt(n, xx, yy + 10, { size: 30, family: 'Mono', weight: 800, color: RED });
    txt(a, xx + 74, yy + 8, { size: 40, weight: 800, family: 'Inter' });
    txt(b, xx + 74, yy + 48, { size: 24, weight: 500, family: 'Inter', color: MUT });
    ctx.globalAlpha = 1;
  });
  // what would make it lawful — the half of a finding people forget
  const eq = seg(u, 4.4, 4.9);
  if (eq > 0) {
    ctx.globalAlpha = eq;
    ctx.strokeStyle = 'rgba(27,34,48,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(1090, 782); ctx.lineTo(1790, 782); ctx.stroke();
    label('WHAT WOULD SATISFY IT', 1090, 824, { color: RED });
    txt('Recognised excellent performance:', 1090, 870, { size: 27, weight: 500, family: 'Inter' });
    txt('an EU Ecolabel, or a scheme named in the page.', 1090, 906, { size: 27, weight: 500, family: 'Inter' });
    ctx.globalAlpha = 1;
  }
  halftone(0, 900, W, 180, 24, 15, (px, py) => clamp((py - 900) / 180) * 0.5, RED, 0.10);
};

// 07 — six rules
S.rules = (u) => {
  label('THE RULE SET', M, 170);
  txt('Six rules, each one cited.', M, 250, { size: 60 });
  const rules = [
    ['Generic environmental claim', 'BANNED', 'Annex I, 4a'],
    ['The same promise, other words', 'BANNED', 'Annex I, 4a'],
    ['“Green” as a product claim', 'BANNED', 'Annex I, 4a'],
    ['Neutrality resting on offsets', 'BANNED', 'Annex I, 4c'],
    ['Future promise, no plan', 'NEEDS EVIDENCE', 'Art. 6(2)(d)'],
    ['Label, no named scheme', 'NEEDS EVIDENCE', 'Annex I, 2a'],
  ];
  rules.forEach(([name, kind, cite], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * 590, y = 330 + row * 250, w = 520, h = 200;
    const q = seg(u, 0.45 + i * 0.16, 0.85 + i * 0.16);
    if (q <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(q * 1.5); ctx.translate(0, (1 - eo(q)) * 22);
    card(x, y, w, h, { fill: 'rgba(255,252,244,0.92)', stroke: 'rgba(27,34,48,0.62)' });
    txt(name, x + 30, y + 86, { size: 31, weight: 800, family: 'Inter' });
    const isBan = kind === 'BANNED';
    ctx.fillStyle = isBan ? RED : 'rgba(43,74,111,0.92)';
    ctx.fillRect(x + 30, y + 112, isBan ? 108 : 196, 30);
    txt(kind, x + 40, y + 134, { size: 15, weight: 800, family: 'Mono', color: CREAM, track: 1.2 });
    label(cite.toUpperCase(), x + 30, y + 176, { size: 14 });
    ctx.restore();
  });
  halftone(700, 870, 1120, 200, 24, 15, (px, py) => clamp((py - 870) / 200) * 0.5, INK, 0.07);
};

// 08 — the decoy
S.decoy = (u) => {
  label('THE CONTROL · ORDINARY ENGLISH', M, 170);
  txt('Green tea is not a green claim.', M, 250, { size: 60 });
  const x = M, y = 330, w = 900, h = 200;
  card(x, y, w, h);
  txt('Pairs well with green tea and green beans.', x + 40, y + 96, { size: 34, weight: 500, family: 'Inter' });
  label('NO FINDING', x + 40, y + 146);
  stamp('NOT A CLAIM', x + w + 120, y + 96, { p: seg(u, 1.9, 2.2), size: 34, color: BLUE, rot: -0.05, scale: 0.95 });

  const y2 = 600, w2 = 1120;
  card(x, y2, w2, 190);
  const pre = 'Every order is eco-certified, so you can go ', word = 'green', post = ' without thinking.';
  txt(pre, x + 40, y2 + 104, { size: 40, weight: 500, family: 'Inter' });
  font(40, 500, 'Inter');
  const pw = ctx.measureText(pre).width;
  const q = seg(u, 5.1, 5.6);
  if (q > 0) {
    ctx.strokeStyle = RED; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 40 + pw, y2 + 118); ctx.lineTo(x + 40 + pw + 108 * q, y2 + 114); ctx.stroke();
  }
  ctx.fillStyle = RED; txt(word, x + 40 + pw, y2 + 104, { size: 40, weight: 700, family: 'Inter' });
  txt(post, x + 40 + pw + 108, y2 + 104, { size: 40, weight: 500, family: 'Inter' });
  label('BANNED · ANNEX I, POINT 4a', x + 40, y2 + 152, { color: RED });
  stamp('BANNED', x + w2 + 170, y2 + 150, { p: seg(u, 6.1, 6.4), size: 44, rot: -0.07 });
};

// 09 — install
S.install = (u) => {
  label('INSTALLATION', M, 170);
  txt('Drag it once.', M, 250, { size: 60 });
  // browser chrome with a bookmarks bar
  const y = 320;
  card(M, y, 1000, 90, { fill: 'rgba(27,34,48,0.92)', stroke: 'rgba(27,34,48,0.9)' });
  label('BOOKMARKS BAR', M + 24, y + 52, { color: 'rgba(239,230,210,0.55)', size: 14 });
  const chipX = M + 240;
  const drag = seg(u, 0.8, 2.4);
  const landed = drag >= 1;
  if (landed) {
    ctx.fillStyle = 'rgba(239,230,210,0.95)';
    ctx.fillRect(chipX, y + 22, 230, 46);
    ctx.strokeStyle = 'rgba(27,34,48,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(chipX + 0.5, y + 22.5, 229, 45);
    label('CHECK THIS PAGE', chipX + 18, y + 52, { color: INK, size: 14 });
  }
  // the button being dragged (drawn only while it is in the air)
  const bx = lerp(M + 40, chipX, eo(drag));
  const by = lerp(620, y + 22, eo(drag));
  if (!landed) {
    ctx.save();
    ctx.fillStyle = INK;
    ctx.fillRect(bx, by, 230, 56);
    label('CHECK THIS PAGE', bx + 20, by + 36, { color: CREAM, size: 14 });
    ctx.restore();
  }
  if (drag > 0.05 && drag < 0.95) {
    ctx.strokeStyle = 'rgba(27,34,48,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([8, 9]);
    ctx.beginPath(); ctx.moveTo(M + 155, 648); ctx.lineTo(bx + 115, by + 56); ctx.stroke();
    ctx.setLineDash([]);
  }
  // the panel, as evidence
  const px = 1240, py = 196;
  const sw = imgs.panel.width, cropH = 1560;
  const pw = 452, ph = pw * (cropH / sw);
  card(px - 16, py - 16, pw + 32, ph + 32, { fill: 'rgba(255,252,242,0.92)' });
  ctx.save();
  ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  // an excerpt at 40% of the capture, not the whole panel squeezed to a stamp
  ctx.filter = 'grayscale(0.12) contrast(1.06) brightness(1.02)';
  ctx.drawImage(imgs.panel, 0, 0, sw, cropH, px, py, pw, ph);
  ctx.filter = 'none';
  const fg = ctx.createLinearGradient(0, py + ph - 130, 0, py + ph);
  fg.addColorStop(0, 'rgba(252,247,235,0)'); fg.addColorStop(1, 'rgba(252,247,235,0.95)');
  ctx.fillStyle = fg; ctx.fillRect(px, py + ph - 130, pw, 130);
  ctx.restore();
  label('THE PANEL, ON THIS PAGE', px, py + ph + 54);
  label('EXCERPT · THE LIST CONTINUES', px, py + ph + 78, { size: 13 });
  italicFill('The panel opens on the page,', M + 40, 706, 34, MUT);
  italicFill('with every finding in it.', M + 40, 748, 34, MUT);
  const rq = seg(u, 3.2, 3.7);
  if (rq > 0) {
    ctx.globalAlpha = rq;
    txt('No account.', M + 40, 800, { size: 40, weight: 700, family: 'Inter' });
    txt('No extension.', M + 40, 852, { size: 40, weight: 700, family: 'Inter' });
    label('NO PERMISSIONS PROMPT', M + 40, 892, { color: RED });
    ctx.globalAlpha = 1;
  }
};

// 10 — privacy
S.privacy = (u) => {
  label('WHAT LEAVES THE PAGE', M, 170);
  txt('Nothing does.', M, 262, { size: 76 });
  const x = M, y = 340, w = 760, h = 400;
  card(x, y, w, h, { fill: 'rgba(255,252,242,0.85)' });
  // sealed envelope
  const ex = x + 70, ey = y + 70, ew = 300, eh = 200;
  ctx.fillStyle = 'rgba(233,223,199,0.95)'; ctx.fillRect(ex, ey, ew, eh);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(ex, ey, ew, eh);
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + ew / 2, ey + eh * 0.58); ctx.lineTo(ex + ew, ey); ctx.stroke();
  const seal = seg(u, 1.2, 1.7);
  if (seal > 0) {
    ctx.globalAlpha = seal;
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(ex + ew / 2, ey + eh * 0.58, 34, 0, 6.2832); ctx.fill();
    ctx.fillStyle = CREAM; font(26, 900, 'Playfair'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CC', ex + ew / 2, ey + eh * 0.58 + 1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  }
  txt('Sealed in the tab.', x + 410, y + 150, { size: 40 });
  italicFill('The scan runs locally.', x + 410, y + 200, 28, MUT);
  label('NO SERVER · NO UPLOAD', x + 410, y + 248, { color: RED });
  label('THE ONE REQUEST IS FOR report.js, THE CODE ITSELF', x + 70, y + 330, { size: 13 });
  const chips = [['no upload', 1.9], ['no account', 2.5], ['no analytics', 3.1]];
  chips.forEach(([c, at], i) => {
    const q = seg(u, at, at + 0.35);
    if (q <= 0) return;
    const cx = 920, cy = 380 + i * 96;
    ctx.globalAlpha = q;
    ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy - 34, 330, 60);
    txt(c, cx + 22, cy + 6, { size: 30, weight: 700, family: 'Inter', color: BLUE });
    const s = seg(u, at + 0.4, at + 0.7);
    if (s > 0) {
      ctx.strokeStyle = RED; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx + 8, cy - 40); ctx.lineTo(cx + 8 + 330 * s, cy + 32); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
};

// 11 — the receipts
S.receipts = (u) => {
  label('THE DATED RUN · 21 NOVEMBER 2026', M, 170);
  txt('Thirteen pages.', M, 250, { size: 60 });
  const nums = [
    ['13', 'pages read', 0.6],
    ['3', 'with a banned claim', 1.9],
    ['23.1%', 'page hit rate', 3.2],
    ['0', 'false positives, 3 reviewed', 4.6],
  ];
  nums.forEach(([n, sub, at], i) => {
    const q = seg(u, at, at + 0.45);
    if (q <= 0) return;
    const x = M + (i % 2) * 620, y = 400 + Math.floor(i / 2) * 210;
    ctx.globalAlpha = q;
    txt(n, x, y, { size: 116, color: i === 2 ? RED : INK });
    label(sub.toUpperCase(), x + 4, y + 38);
    ctx.globalAlpha = 1;
  });
  // thirteen squares: three red
  for (let i = 0; i < 13; i++) {
    const q = seg(u, 2.6 + i * 0.07, 2.85 + i * 0.07);
    if (q <= 0) continue;
    const col = i % 7, row = Math.floor(i / 7);
    const x = 1300 + col * 78, y = 400 + row * 78;
    ctx.globalAlpha = q;
    ctx.fillStyle = i < 3 ? RED : 'rgba(27,34,48,0.18)';
    ctx.fillRect(x, y, 58, 58);
    ctx.globalAlpha = 1;
  }
  label('EACH SQUARE IS A SAVED PAGE', 1300, 570);
  italicFill('A pilot, not a survey.', 1300, 700, 40, MUT);
  label('SMALL, BRAND-SKEWED, SIX PAGES OUTSIDE THE EU', 1300, 742, { size: 14 });
  halftone(0, 900, W, 180, 24, 15, (px, py) => clamp((py - 900) / 180) * 0.5, INK, 0.06);
};

// 12 — the limits
S.limits = (u) => {
  label('WHAT IT WILL NOT DO', M, 170);
  txt('A text check has edges.', M, 250, { size: 60 });
  const rows = [
    ['Images', 'a leaf logo with no words is invisible', 1.2],
    ['The product', 'it flags wording, never facts', 2.4],
    ['Language', 'English only, EU only', 3.6],
  ];
  rows.forEach(([a, b, at], i) => {
    const q = seg(u, at, at + 0.45);
    if (q <= 0) return;
    const y = 380 + i * 170;
    ctx.globalAlpha = q;
    ctx.strokeStyle = 'rgba(27,34,48,0.28)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(M, y - 54); ctx.lineTo(1780, y - 54); ctx.stroke();
    txt(a, M, y, { size: 46, weight: 900, family: 'Playfair' });
    txt(b, M + 340, y, { size: 32, weight: 500, family: 'Inter', color: MUT });
    ctx.globalAlpha = 1;
  });
  const q = seg(u, 4.4, 4.8);
  if (q > 0) {
    ctx.globalAlpha = q;
    label('AND IT IS NOT LEGAL ADVICE', M, 900, { color: RED });
    ctx.globalAlpha = 1;
  }
};

// 13 — end card
S.end = (u) => {
  const q = seg(u, 0.1, 0.8);
  halftone(0, 0, W, H, 22, 15, (px, py) => clamp(1 - Math.min(px, W - px, py, H - py) / 340) * 0.9, INK, 0.05);
  ctx.globalAlpha = clamp(q * 1.6);
  txt('A check,', M, 400, { size: 116 });
  txt('not a rewrite.', M, 520, { size: 116 });
  ctx.globalAlpha = 1;
  const q2 = seg(u, 1.0, 1.5);
  if (q2 > 0) {
    ctx.globalAlpha = q2;
    label('LIVE DEMO', M, 640, { color: RED });
    txt('divitgangrade-lab.github.io/GenHacks---Divit/', M, 682, { size: 30, weight: 700, family: 'Mono' });
    label('SOURCE', M, 742);
    txt('github.com/divitgangrade-lab/GenHacks---Divit', M, 784, { size: 30, weight: 700, family: 'Mono' });
    ctx.globalAlpha = 1;
  }
  const q3 = seg(u, 1.7, 2.0);
  if (q3 > 0) {
    stamp('FILED', 1540, 470, { p: q3, size: 74, color: RED, rot: -0.08 });
  }
  const q4 = seg(u, 2.2, 2.6);
  if (q4 > 0) {
    ctx.globalAlpha = q4;
    label('CLAIM CHECK · GENHACKS 2026 · HEALTHCARE & ENVIRONMENTAL', M, 876);
    label('DIRECTIVE (EU) 2024/825 · APPLIES FROM 27 SEPTEMBER 2026', M, 902, { size: 13 });
    ctx.globalAlpha = 1;
  }
};

/* ───────────────────────── frame ───────────────────────── */
const ORDER = ['hook', 'title', 'law', 'three', 'product', 'anatomy', 'rules', 'decoy', 'install', 'privacy', 'receipts', 'limits', 'end'];

function shake(t) {
  let amp = 0;
  const hit = (at, a) => { const d = t - at; if (d >= 0 && d < 0.42) amp = Math.max(amp, a * Math.pow(1 - d / 0.42, 2)); };
  hit(SCENES[0].t + 2.65, 22);
  SCENES[3] && [2.10, 3.40, 4.65].forEach((o) => hit(SCENES[3].t + o, 12));
  SCENES[7] && [1.90, 6.10].forEach((o) => hit(SCENES[7].t + o, 14));
  SCENES[12] && hit(SCENES[12].t + 1.85, 18);
  if (!amp) return [0, 0];
  const k = Math.floor(t * 60);
  return [(hash(k) - 0.5) * amp, (hash(k + 77) - 0.5) * amp];
}

export async function init(canvas) {
  cv = canvas;
  ctx = cv.getContext('2d');
  paper = buildPaper();
  const list = { demo: 'img/demo.png', findings: 'img/findings.png', finding1: 'img/finding1.png', panel: 'img/panel.png', product: 'img/product.png', install: 'img/install.png' };
  await Promise.all(Object.entries(list).map(([k, src]) => new Promise((res, rej) => {
    const im = new Image(); im.onload = () => { imgs[k] = im; res(); }; im.onerror = rej; im.src = src;
  })));
  const faces = [
    ['Playfair', 'fonts/PlayfairDisplay.ttf', '400 900'],
    ['Inter', 'fonts/Inter.ttf', '400 900'],
    ['Mono', 'fonts/JetBrainsMono.ttf', '400 800'],
  ];
  for (const [fam, url] of faces) {
    const f = new FontFace(fam, `url(${url})`, { weight: '100 900' });
    await f.load(); document.fonts.add(f);
  }
  await document.fonts.ready;
}

export function render(t) {
  const dpr = cv.width / W;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // every frame starts from the same canvas state: a leaked textAlign clips the next headline
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '0px'; ctx.globalAlpha = 1; ctx.setLineDash([]);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(paper, 0, 0, W, H);

  const [sx, sy] = shake(t);
  ctx.save(); ctx.translate(sx, sy);

  let idx = SCENES.findIndex((s) => t >= s.t && t < s.t + s.dur);
  if (idx < 0) idx = t < 0 ? 0 : SCENES.length - 1;
  const sc = SCENES[idx];
  const fn = S[sc.id] || (() => {});
  fn(t - sc.t, t);

  ctx.restore();

  hud(sc.id, t);
  caption(sc, t);

  // flashes on the big stamps
  const flashAt = [[SCENES[0].t + 2.65], [SCENES[12].t + 1.85]];
  for (const [at] of flashAt) {
    const d = t - at;
    if (d >= 0 && d < 0.14) { ctx.fillStyle = `rgba(255,252,242,${0.34 * (1 - d / 0.14)})`; ctx.fillRect(0, 0, W, H); }
  }

  wipe(t);
  grain(t);
}

export { DUR, ORDER };
