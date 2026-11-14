// Pictures drawn in code (signboards, labels, shutter paint).
// Drawing them here means Telugu text is always sharp and easy to change.
import * as THREE from 'three';

export const TE = '"Noto Sans Telugu","Nirmala UI","Gautami",sans-serif';
export const TE_DISPLAY = '"Ramabhadra","Noto Sans Telugu","Nirmala UI",sans-serif';
export const EN = '"DM Sans","Segoe UI",sans-serif';

const BLUE = '#143d8c';
const YELLOW = '#ffd23f';
const RED = '#c62828';
const CREAM = '#fff6dc';

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Shrinks the font until the text fits the given width.
function fit(g, text, weight, family, size, maxW) {
  for (; size > 12; size -= 2) {
    g.font = `${weight} ${size}px ${family}`;
    if (g.measureText(text).width <= maxW) break;
  }
  return size;
}

function spaced(g, px) {
  if ('letterSpacing' in g) g.letterSpacing = `${px}px`;
}

// The shop emblem: a simple drawing of Lord Shiva (Parameshwara) with the
// hair bun, crescent moon, three ash lines, third eye, snake and trident.
// It is drawn inside a circle of radius r centred at (x, y).
export function drawShiva(g, x, y, r, bg = YELLOW) {
  const NAVY = '#10244f';
  const SKIN = '#86b9f2';
  const SHADE = '#5f97dc';
  const PI = Math.PI;
  const oval = (cx, cy, rx, ry, a0 = 0, a1 = PI * 2) => {
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, a0, a1);
  };
  g.save();
  g.translate(x, y);
  g.scale(r, r);
  g.lineCap = 'round';
  g.lineJoin = 'round';

  oval(0, 0, 1, 1);
  g.fillStyle = bg;
  g.fill();
  g.clip();

  // Soft glow behind the head.
  oval(0, -0.14, 0.7, 0.7);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fill();

  // Trident with the small drum tied to it.
  g.strokeStyle = NAVY;
  g.fillStyle = NAVY;
  g.lineWidth = 0.055;
  g.beginPath();
  g.moveTo(0.64, -0.5);
  g.lineTo(0.64, 1);
  g.stroke();
  g.beginPath();
  g.moveTo(0.46, -0.8);
  g.quadraticCurveTo(0.46, -0.46, 0.64, -0.44);
  g.quadraticCurveTo(0.82, -0.46, 0.82, -0.8);
  g.stroke();
  g.beginPath();
  g.moveTo(0.64, -0.95);
  g.lineTo(0.575, -0.68);
  g.lineTo(0.64, -0.5);
  g.lineTo(0.705, -0.68);
  g.closePath();
  g.fill();
  g.fillStyle = '#b3261e';
  g.beginPath();
  g.moveTo(0.53, -0.3);
  g.lineTo(0.75, -0.3);
  g.lineTo(0.53, -0.1);
  g.lineTo(0.75, -0.1);
  g.closePath();
  g.fill();

  // Long hair behind, shoulders, neck.
  oval(0, 0.12, 0.47, 0.64);
  g.fillStyle = NAVY;
  g.fill();
  oval(0, 1.04, 0.8, 0.5);
  g.fillStyle = SKIN;
  g.fill();
  g.fillRect(-0.13, 0.22, 0.26, 0.4);
  oval(0, 0.32, 0.13, 0.07);
  g.fillStyle = SHADE;
  g.fill();

  // Bead chain.
  g.fillStyle = '#7a3b1e';
  for (let i = 0; i <= 10; i++) {
    const a = PI * (0.1 + 0.08 * i);
    oval(Math.cos(a) * 0.4, 0.6 + Math.sin(a) * 0.26, 0.03, 0.03);
    g.fill();
  }
  // Snake around the neck.
  g.strokeStyle = '#1f6f43';
  g.lineWidth = 0.075;
  oval(0, 0.47, 0.22, 0.1, 0.05, PI * 0.95);
  g.stroke();
  oval(0.24, 0.4, 0.06, 0.075);
  g.fillStyle = '#1f6f43';
  g.fill();

  // Face.
  oval(0, -0.02, 0.29, 0.35);
  g.fillStyle = SKIN;
  g.fill();
  // Hair line and the bun on top.
  oval(0, -0.25, 0.3, 0.16, PI, PI * 2);
  g.fillStyle = NAVY;
  g.fill();
  oval(0, -0.55, 0.18, 0.18);
  g.fill();
  g.strokeStyle = '#d99a1c';
  g.lineWidth = 0.035;
  g.beginPath();
  g.moveTo(-0.15, -0.41);
  g.lineTo(0.15, -0.41);
  g.stroke();

  // Crescent moon.
  g.save();
  oval(-0.25, -0.62, 0.12, 0.12);
  g.clip();
  g.beginPath();
  g.rect(-1, -1, 2, 2);
  g.ellipse(-0.19, -0.65, 0.105, 0.105, 0, 0, PI * 2);
  g.fillStyle = '#ffffff';
  g.fill('evenodd');
  g.restore();

  // Three ash lines and the third eye.
  g.strokeStyle = '#f7f7f2';
  g.lineWidth = 0.028;
  for (const ly of [-0.215, -0.168, -0.121]) {
    g.beginPath();
    g.moveTo(-0.15, ly);
    g.lineTo(0.15, ly);
    g.stroke();
  }
  oval(0, -0.168, 0.028, 0.055);
  g.fillStyle = '#c62828';
  g.fill();

  // Closed eyes, nose, gentle smile, earrings.
  g.strokeStyle = NAVY;
  g.lineWidth = 0.03;
  for (const sx of [-1, 1]) {
    oval(sx * 0.125, -0.045, 0.07, 0.05, PI * 0.1, PI * 0.9);
    g.stroke();
    g.beginPath();
    g.moveTo(sx * 0.06, -0.085);
    g.quadraticCurveTo(sx * 0.13, -0.115, sx * 0.2, -0.08);
    g.stroke();
    oval(sx * 0.3, 0.03, 0.04, 0.05);
    g.fillStyle = '#d99a1c';
    g.fill();
  }
  g.strokeStyle = SHADE;
  g.beginPath();
  g.moveTo(0, -0.03);
  g.lineTo(0, 0.07);
  g.stroke();
  g.strokeStyle = NAVY;
  g.lineWidth = 0.026;
  oval(0, 0.13, 0.085, 0.055, PI * 0.15, PI * 0.85);
  g.stroke();

  g.restore();

  g.strokeStyle = NAVY;
  g.lineWidth = r * 0.06;
  g.beginPath();
  g.arc(x, y, r * 0.97, 0, PI * 2);
  g.stroke();
  g.textBaseline = 'alphabetic';
}

function emblem(g, x, y, r, bg = YELLOW) {
  drawShiva(g, x, y, r, bg);
}

// The emblem as a small picture, for the top bar of the page.
export function emblemDataURL(size = 160) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  drawShiva(c.getContext('2d'), size / 2, size / 2, size / 2 - 1);
  return c.toDataURL('image/png');
}

export function signTexture(shop) {
  return canvasTex(2048, 560, (g, w, h) => {
    const top = 350; // blue part
    const mid = 468; // red strip ends here
    const grad = g.createLinearGradient(0, 0, 0, top);
    grad.addColorStop(0, '#1d55c0');
    grad.addColorStop(1, '#0f2f7a');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, top);
    g.fillStyle = RED;
    g.fillRect(0, top, w, mid - top);
    g.fillStyle = '#0b1d47';
    g.fillRect(0, mid, w, h - mid);
    g.fillStyle = YELLOW;
    g.fillRect(0, top - 6, w, 12);

    emblem(g, 200, top / 2, 140);

    g.textAlign = 'left';
    g.fillStyle = YELLOW;
    fit(g, shop.nameTe, 400, TE_DISPLAY, 172, w - 390 - 70);
    g.fillText(shop.nameTe, 390, 198);

    g.fillStyle = '#ffffff';
    spaced(g, 10);
    fit(g, shop.nameEn, 700, EN, 56, w - 390 - 70);
    g.fillText(shop.nameEn, 394, 296);
    spaced(g, 0);

    g.textAlign = 'center';
    const strip = `${shop.taglineTe}    |    ${shop.taglineEn}`;
    fit(g, strip, 800, TE, 66, w - 120);
    g.fillText(strip, w / 2, top + (mid - top) / 2 + 24);

    const parts = [];
    if (shop.proprietorEn) parts.push(`Prop: ${shop.proprietorEn}`);
    if (shop.phoneDisplay) parts.push(`Cell: ${shop.phoneDisplay}`);
    if (shop.areaEn) parts.push(shop.areaEn);
    g.fillStyle = YELLOW;
    spaced(g, 3);
    const foot = parts.join('     •     ');
    fit(g, foot, 700, EN, 46, w - 120);
    g.fillText(foot, w / 2, mid + (h - mid) / 2 + 16);
    spaced(g, 0);

    g.strokeStyle = YELLOW;
    g.lineWidth = 14;
    g.strokeRect(7, 7, w - 14, h - 14);
  });
}

function slats(g, w, h, step = 32) {
  for (let y = 0; y < h; y += step) {
    g.fillStyle = 'rgba(0,0,0,0.30)';
    g.fillRect(0, y, w, 3);
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.fillRect(0, y + 3, w, 3);
    g.fillStyle = 'rgba(0,0,0,0.07)';
    g.fillRect(0, y + step * 0.55, w, step * 0.45);
  }
}

export function shutterTexture(shop) {
  return canvasTex(1024, 640, (g, w, h) => {
    g.fillStyle = '#1f5d6b';
    g.fillRect(0, 0, w, h);

    emblem(g, w / 2, 132, 96);

    g.textAlign = 'center';
    g.fillStyle = CREAM;
    fit(g, shop.nameTe, 400, TE_DISPLAY, 120, w - 110);
    g.fillText(shop.nameTe, w / 2, 345);

    g.fillStyle = YELLOW;
    g.fillRect(w / 2 - 300, 385, 600, 5);

    g.fillStyle = CREAM;
    fit(g, shop.taglineTe, 600, TE, 50, w - 140);
    g.fillText(shop.taglineTe, w / 2, 460);

    g.fillStyle = YELLOW;
    spaced(g, 6);
    fit(g, shop.taglineEn, 700, EN, 34, w - 140);
    g.fillText(shop.taglineEn, w / 2, 535);
    spaced(g, 0);

    slats(g, w, h);
  });
}

export function plainShutterTexture(color) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    slats(g, w, h, 21.33);
  });
}

// Small white card, for example a rack label.
export function labelTexture(te, en) {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#fffdf5';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = RED;
    g.lineWidth = 14;
    g.strokeRect(7, 7, w - 14, h - 14);
    g.textAlign = 'center';
    g.fillStyle = '#10244f';
    fit(g, te, 800, TE, 96, w - 60);
    g.fillText(te, w / 2, en ? 125 : 160);
    if (en) {
      g.fillStyle = RED;
      spaced(g, 4);
      fit(g, en, 700, EN, 46, w - 60);
      g.fillText(en, w / 2, 205);
      spaced(g, 0);
    }
  });
}

// Hanging section board inside the shop.
export function boardTexture(te, en, bg = BLUE) {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = YELLOW;
    g.lineWidth = 12;
    g.strokeRect(6, 6, w - 12, h - 12);
    g.textAlign = 'center';
    g.fillStyle = YELLOW;
    fit(g, te, 400, TE_DISPLAY, 112, w - 80);
    g.fillText(te, w / 2, 132);
    g.fillStyle = '#ffffff';
    spaced(g, 12);
    fit(g, en, 700, EN, 44, w - 80);
    g.fillText(en, w / 2, 212);
    spaced(g, 0);
  });
}

export function neighbourSign(te, en, bg, fg) {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    g.fillStyle = fg;
    fit(g, te, 800, TE, 120, w - 80);
    g.fillText(te, w / 2, 135);
    spaced(g, 8);
    g.font = `700 42px ${EN}`;
    g.fillText(en, w / 2, 212);
    spaced(g, 0);
  });
}

export function counterPlate(shop) {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = BLUE;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = YELLOW;
    g.lineWidth = 10;
    g.strokeRect(5, 5, w - 10, h - 10);
    emblem(g, 130, h / 2, 96);
    g.textAlign = 'left';
    g.fillStyle = YELLOW;
    fit(g, shop.nameTe, 400, TE_DISPLAY, 100, w - 250 - 40);
    g.fillText(shop.nameTe, 250, 130);
    g.fillStyle = '#ffffff';
    spaced(g, 5);
    fit(g, shop.taglineEn, 700, EN, 34, w - 250 - 40);
    g.fillText(shop.taglineEn, 252, 198);
    spaced(g, 0);
  });
}

export function shadeCardTexture() {
  return canvasTex(512, 768, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#10244f';
    g.textAlign = 'center';
    g.font = `800 54px ${TE}`;
    g.fillText('షేడ్ కార్డ్', w / 2, 72);
    const cols = 6;
    const rows = 9;
    const pad = 24;
    const cw = (w - pad * 2) / cols;
    const ch = (h - 110 - pad) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hue = (c * 60 + r * 7) % 360;
        const light = 86 - r * 7;
        const sat = 35 + r * 6;
        g.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
        g.fillRect(pad + c * cw + 4, 110 + r * ch + 4, cw - 8, ch - 8);
      }
    }
  });
}

export function tileTexture() {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#ddd6c6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(0, 0, w / 2, h / 2);
    g.fillRect(w / 2, h / 2, w / 2, h / 2);
    g.strokeStyle = '#b3aa98';
    g.lineWidth = 3;
    g.strokeRect(0, 0, w / 2, h / 2);
    g.strokeRect(w / 2, 0, w / 2, h / 2);
    g.strokeRect(0, h / 2, w / 2, h / 2);
    g.strokeRect(w / 2, h / 2, w / 2, h / 2);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Painted wall with rain streaks and dirt near the ground.
export function wallTexture(color, seed = 1) {
  let n = seed * 9973;
  const rand = () => (n = (n * 1664525 + 1013904223) >>> 0) / 4294967296;
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = rand() * w;
      const len = 60 + rand() * 300;
      const grad = g.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, `rgba(60,50,40,${0.05 + rand() * 0.07})`);
      grad.addColorStop(1, 'rgba(60,50,40,0)');
      g.fillStyle = grad;
      g.fillRect(x, 0, 3 + rand() * 12, len);
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${rand() < 0.5 ? '255,255,255' : '70,60,50'},${rand() * 0.05})`;
      g.fillRect(rand() * w, rand() * h, 2 + rand() * 6, 2 + rand() * 6);
    }
    const dirt = g.createLinearGradient(0, h * 0.8, 0, h);
    dirt.addColorStop(0, 'rgba(80,65,50,0)');
    dirt.addColorStop(1, 'rgba(80,65,50,0.28)');
    g.fillStyle = dirt;
    g.fillRect(0, h * 0.8, w, h * 0.2);
  });
}

// Rough road surface.
export function roadTexture() {
  let n = 4242;
  const rand = () => (n = (n * 1664525 + 1013904223) >>> 0) / 4294967296;
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#7b756d';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const v = rand();
      g.fillStyle = v < 0.5 ? `rgba(40,38,36,${rand() * 0.25})` : `rgba(220,214,200,${rand() * 0.16})`;
      g.fillRect(rand() * w, rand() * h, 1 + rand() * 3, 1 + rand() * 3);
    }
    for (let i = 0; i < 14; i++) {
      g.fillStyle = `rgba(50,46,42,${0.05 + rand() * 0.08})`;
      g.beginPath();
      g.ellipse(rand() * w, rand() * h, 30 + rand() * 60, 14 + rand() * 30, rand() * 3, 0, Math.PI * 2);
      g.fill();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Checked shirt cloth.
export function shirtTexture() {
  const t = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#dbe8f6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(70,120,190,0.42)';
    for (let x = 0; x < w; x += 32) g.fillRect(x + 6, 0, 5, h);
    g.fillStyle = 'rgba(70,120,190,0.28)';
    for (let y = 0; y < h; y += 32) g.fillRect(0, y + 6, w, 5);
    g.fillStyle = 'rgba(255,255,255,0.5)';
    for (let x = 0; x < w; x += 32) g.fillRect(x + 22, 0, 2, h);
    for (let y = 0; y < h; y += 32) g.fillRect(0, y + 22, w, 2);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Wall calendar.
export function calendarTexture() {
  return canvasTex(256, 384, (g, w, h) => {
    g.fillStyle = '#fffdf5';
    g.fillRect(0, 0, w, h);
    g.fillStyle = RED;
    g.fillRect(0, 0, w, 150);
    drawShiva(g, w / 2, 76, 62);
    g.textAlign = 'center';
    g.font = `700 22px ${EN}`;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        g.fillStyle = c === 0 ? RED : '#10244f';
        const d = r * 7 + c + 1;
        if (d <= 30) g.fillText(String(d), 26 + c * 34, 200 + r * 40);
      }
    }
  });
}

// Coloured rooftop board.
export function roofBoardTexture(te, en) {
  return canvasTex(2048, 384, (g, w, h) => {
    g.fillStyle = RED;
    g.fillRect(0, 0, w, h);
    g.fillStyle = YELLOW;
    g.fillRect(0, h - 120, w, 120);
    g.textAlign = 'center';
    g.fillStyle = '#ffffff';
    fit(g, te, 800, TE, 150, w - 120);
    g.fillText(te, w / 2, 185);
    g.fillStyle = '#10244f';
    spaced(g, 10);
    fit(g, en, 700, EN, 70, w - 120);
    g.fillText(en, w / 2, h - 36);
    spaced(g, 0);
  });
}

// White product label with a brand strip at the bottom.
export function brandLabel(te, en, brands) {
  return canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = '#fffdf5';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = RED;
    g.lineWidth = 14;
    g.strokeRect(7, 7, w - 14, h - 14);
    g.textAlign = 'center';
    g.fillStyle = '#10244f';
    fit(g, te, 800, TE, 92, w - 60);
    g.fillText(te, w / 2, 112);
    g.fillStyle = RED;
    spaced(g, 3);
    fit(g, en, 700, EN, 40, w - 60);
    g.fillText(en, w / 2, 168);
    spaced(g, 0);
    g.fillStyle = BLUE;
    g.fillRect(24, 212, w - 48, 72);
    g.fillStyle = YELLOW;
    spaced(g, 2);
    fit(g, brands, 700, EN, 42, w - 80);
    g.fillText(brands, w / 2, 260);
    spaced(g, 0);
  });
}

// A hanging "authorised dealer" board listing brand names.
export function dealerBoard(brands, title = 'AUTHORISED DEALER') {
  return canvasTex(1024, 320, (g, w, h) => {
    g.fillStyle = '#0b1d47';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = YELLOW;
    g.lineWidth = 10;
    g.strokeRect(6, 6, w - 12, h - 12);
    g.textAlign = 'center';
    g.fillStyle = YELLOW;
    spaced(g, 6);
    fit(g, title, 700, EN, 54, w - 70);
    g.fillText(title, w / 2, 104);
    spaced(g, 0);
    g.fillStyle = '#ffffff';
    fit(g, brands, 700, EN, 70, w - 70);
    g.fillText(brands, w / 2, 220);
  });
}

// Tiny brand sticker, for a switch plate or a pulled pipe.
export function brandSticker(brand) {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = BLUE;
    g.lineWidth = 8;
    g.strokeRect(5, 5, w - 10, h - 10);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = BLUE;
    fit(g, brand, 800, EN, 54, w - 30);
    g.fillText(brand, w / 2, h / 2 + 2);
    g.textBaseline = 'alphabetic';
  });
}
