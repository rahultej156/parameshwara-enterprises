// Everything inside the shop: paint shelf, pipe rack, electrical wall,
// hardware corner, counter and lights.
// Inside the shop X goes from -3.8 (left wall) to 3.8 (right wall),
// and Z goes from 0 (door) to -9.2 (back wall).
import * as THREE from 'three';
import { M, texMat, box, cyl, ball, plane, G, rnd, pick, PALETTE, paintBucket, HIT } from './kit.js';
import * as T from './textures.js';
import { shop } from './shopInfo.js';

const WOOD = '#8a5a33';
const WOOD_DARK = '#6b4226';
const STEEL = '#3b4046';

function sectionBoard(g, te, en, x, y, z, ry, w = 1.7) {
  box(g, ry === 0 ? w + 0.08 : 0.04, 0.5, ry === 0 ? 0.04 : w + 0.08, M('#0b1d47'), x, y, z);
  const off = 0.03;
  plane(g, w, 0.425, texMat(T.boardTexture(te, en)),
    x + (ry > 0 ? off : ry < 0 ? -off : 0), y, z + (ry === 0 ? off : 0), ry);
}

// ---------------- Paints (left wall) ----------------
function paints(g) {
  const x = -3.575;
  const z0 = -3.0;
  const z1 = -6.2;
  const len = z0 - z1;
  const zc = (z0 + z1) / 2;
  const levels = [0.55, 1.15, 1.72, 2.24];
  const wood = M(WOOD);
  for (const y of levels) box(g, 0.45, 0.04, len, wood, x, y, zc);
  box(g, 0.45, 0.04, len, wood, x, 2.72, zc);
  for (let i = 0; i < 4; i++) box(g, 0.45, 2.74, 0.05, M(WOOD_DARK), x, 1.37, z0 - (len * i) / 3);

  const rows = [
    { r: 0.15, h: 0.3, gap: 0.36, handle: true },
    { r: 0.12, h: 0.24, gap: 0.29, handle: true },
    { r: 0.09, h: 0.18, gap: 0.22 },
    { r: 0.065, h: 0.13, gap: 0.165 },
  ];
  rows.forEach((row, li) => {
    for (let z = z0 - 0.22; z > z1 + 0.18; z -= row.gap) {
      paintBucket(g, row.r, row.h, pick(PALETTE), x + 0.03, levels[li] + 0.02, z, row.handle);
    }
  });
  // Big 20 litre buckets on the floor under the shelf.
  for (let z = z0 - 0.26; z > z1 + 0.2; z -= 0.41) {
    paintBucket(g, 0.17, 0.38, pick(PALETTE), x + 0.06, 0.015, z, true);
  }

  // Shade card (colour chart) on the wall.
  box(g, 0.03, 1.5, 0.98, M('#ffffff'), -3.78, 1.6, -2.42);
  plane(g, 0.92, 1.42, texMat(T.shadeCardTexture()), -3.76, 1.6, -2.42, Math.PI / 2);

  sectionBoard(g, 'రంగులు', 'PAINTS', -3.36, 3.02, zc, Math.PI / 2);
  plane(g, 1.4, 0.44, texMat(T.dealerBoard('ASIAN PAINTS • BERGER • NEROLAC', 'PAINTS')), -3.56, 2.6, zc, Math.PI / 2);
}

// ---------------- Pipes (back wall) ----------------
function pipeStack(g, { x0, x1, r, maxH, color, inner }) {
  const L = 2.4;
  const zc = -7.85;
  const pos = [];
  const n0 = Math.floor((x1 - x0) / (2 * r));
  const pad = (x1 - x0 - n0 * 2 * r) / 2;
  for (let k = 0; ; k++) {
    const y = 0.12 + r + k * r * 1.732;
    if (y + r > maxH) break;
    const n = n0 - (k % 2);
    for (let i = 0; i < n; i++) {
      pos.push([x0 + pad + r + (k % 2) * r + i * 2 * r, y, zc + (rnd() - 0.5) * 0.14]);
    }
  }
  const outerG = new THREE.CylinderGeometry(r, r, L, 18, 1, true).rotateX(Math.PI / 2);
  const innerG = new THREE.CylinderGeometry(r * 0.86, r * 0.86, L, 18, 1, true).rotateX(Math.PI / 2);
  const ringG = new THREE.RingGeometry(r * 0.86, r, 18);
  const outer = new THREE.InstancedMesh(outerG, M(color, { roughness: 0.55 }), pos.length);
  const inside = new THREE.InstancedMesh(innerG, new THREE.MeshStandardMaterial({ color: inner, side: THREE.BackSide, roughness: 1 }), pos.length);
  const ring = new THREE.InstancedMesh(ringG, M(color, { roughness: 0.55 }), pos.length);
  const m4 = new THREE.Matrix4();
  pos.forEach(([x, y, z], i) => {
    m4.makeTranslation(x, y, z);
    outer.setMatrixAt(i, m4);
    inside.setMatrixAt(i, m4);
    m4.makeTranslation(x, y, z + L / 2 + 0.001);
    ring.setMatrixAt(i, m4);
  });
  g.add(outer, inside, ring);
  for (const z of [-7.0, -8.6]) box(g, x1 - x0, 0.12, 0.12, M(WOOD_DARK), (x0 + x1) / 2, 0.06, z);
}

function pipes(g) {
  const bays = [
    { x0: -3.6, x1: -1.92, r: 0.14, maxH: 1.75, color: '#b8683a', inner: '#5d3018', te: 'UGD పైపులు', en: 'UNDERGROUND DRAINAGE', brands: 'SUPREME • PRINCE', sticker: 'SUPREME' },
    { x0: -1.82, x1: -0.42, r: 0.075, maxH: 1.7, color: '#a9adb0', inner: '#4b4e52', te: 'SWR పైపులు', en: 'WASTE WATER', brands: 'FINOLEX • ASTRAL', sticker: 'FINOLEX' },
    { x0: -0.32, x1: 0.88, r: 0.036, maxH: 1.1, color: '#efe3bf', inner: '#7c7355', te: 'CPVC పైపులు', en: 'HOT & COLD WATER', brands: 'ASHIRVAD • ASTRAL', sticker: 'ASHIRVAD' },
  ];
  const steel = M(STEEL, { metalness: 0.5, roughness: 0.5 });
  const pullPipes = [];
  for (const b of bays) {
    pipeStack(g, b);
    plane(g, 0.84, 0.525, texMat(T.brandLabel(b.te, b.en, b.brands)), (b.x0 + b.x1) / 2, 2.22, -6.58, 0);
    pullPipes.push(makePullPipe(g, b));
  }
  for (const x of [-3.65, -1.87, -0.37, 0.93]) {
    box(g, 0.06, 2.42, 0.06, steel, x, 1.21, -6.62);
    box(g, 0.06, 2.42, 0.06, steel, x, 1.21, -9.05);
  }
  box(g, 4.64, 0.06, 0.06, steel, -1.36, 1.92, -6.62);
  box(g, 4.64, 0.06, 0.06, steel, -1.36, 2.42, -6.62);

  // CPVC bay has a second level, because these pipes are thin.
  box(g, 1.24, 0.04, 2.4, M(WOOD), 0.28, 1.2, -7.85);
  const upper = new THREE.Group();
  upper.position.y = 1.1;
  g.add(upper);
  pipeStack(upper, { x0: -0.32, x1: 0.88, r: 0.03, maxH: 0.72, color: '#f4ecd2', inner: '#7c7355' });

  // Thin electrical conduit pipes standing in the back right corner.
  const cols = ['#f7f5ee', '#f7f5ee', '#f7f5ee', '#e9e2c9', '#2b2b2b', '#3a6fd0'];
  for (let i = 0; i < 22; i++) {
    const p = cyl(g, 0.018, 0.018, 2.9, M(pick(cols), { roughness: 0.5 }), 1.5 + rnd() * 2.0, 1.45, -8.75 + rnd() * 0.22, 8);
    p.rotation.x = -0.09 - rnd() * 0.03;
    p.rotation.z = (rnd() - 0.5) * 0.08;
  }

  sectionBoard(g, 'పైపులు', 'PIPES', -1.36, 2.9, -6.6, 0, 1.9);
  return pullPipes;
}

// One loose pipe resting on top of a bay. Clicking the bay slides it out
// towards the viewer (handled in interact.js), as if the shopkeeper is
// pulling one from the rack to show it. Returns the group so it can move.
function makePullPipe(g, b) {
  const grp = new THREE.Group();
  g.add(grp);
  const L = 2.4;
  const cx = (b.x0 + b.x1) / 2;
  const topY = Math.min(b.maxH + b.r + 0.02, 1.9);
  const zc = -7.85;
  grp.position.set(cx, topY, 0);
  cyl(grp, b.r, b.r, L, M(b.color, { roughness: 0.5 }), 0, 0, zc).rotation.x = Math.PI / 2;
  const innerM = new THREE.MeshStandardMaterial({ color: b.inner, side: THREE.BackSide, roughness: 1 });
  cyl(grp, b.r * 0.86, b.r * 0.86, L, innerM, 0, 0, zc).rotation.x = Math.PI / 2;
  plane(grp, Math.min(0.55, b.r * 5) + 0.16, 0.12, texMat(T.brandSticker(b.sticker)), 0, b.r + 0.02, zc + L / 2 - 0.55, 0);
  const hit = box(grp, b.x1 - b.x0, b.maxH, 0.55, HIT, 0, b.maxH / 2 - topY, zc);
  hit.castShadow = false;
  return { group: grp, baseZ: 0, hit };
}

// ---------------- Electricals (right wall) ----------------
function switchPlate(g, y, z, color, n) {
  const x = 3.735;
  box(g, 0.03, 0.3, 0.44, M(color, { roughness: 0.35 }), x, y, z);
  const dark = color !== '#fafafa';
  const rocker = M(dark ? '#3a3d42' : '#ffffff', { roughness: 0.3 });
  for (let j = 0; j < n; j++) {
    const zz = z - 0.15 + j * 0.075;
    const s = box(g, 0.022, 0.085, 0.05, rocker, x - 0.02, y + 0.03, zz);
    s.rotation.z = j % 2 ? 0.12 : -0.12;
  }
  const sock = cyl(g, 0.05, 0.05, 0.02, M(dark ? '#3a3d42' : '#ececec', { roughness: 0.4 }), x - 0.02, y - 0.02, z + 0.14, 16);
  sock.rotation.z = Math.PI / 2;
}

function electricals(g) {
  const zc = -6.0;
  box(g, 0.04, 1.95, 2.95, M('#e9e2cf'), 3.775, 1.78, zc);

  // Wire coils on pegs.
  const coilG = new THREE.TorusGeometry(0.19, 0.036, 10, 30).rotateY(Math.PI / 2);
  const cols = ['#d62828', '#ffd23f', '#1d4ed8', '#2a9d3f', '#1b1b1b', '#f5f5f5'];
  cols.forEach((c, i) => {
    const z = -7.1 + i * 0.44;
    const coil = new THREE.Mesh(coilG, M(c, { roughness: 0.45 }));
    coil.position.set(3.66, 2.42, z);
    g.add(coil);
    const inner = new THREE.Mesh(coilG, M(c, { roughness: 0.45 }));
    inner.position.set(3.6, 2.42, z);
    inner.scale.set(1, 0.9, 0.9);
    g.add(inner);
    const peg = cyl(g, 0.012, 0.012, 0.2, M('#8d9196', { metalness: 0.7, roughness: 0.4 }), 3.66, 2.58, z, 8);
    peg.rotation.z = Math.PI / 2;
  });

  // Switch boards.
  switchPlate(g, 1.78, -7.05, '#fafafa', 4);
  switchPlate(g, 1.78, -6.42, '#fafafa', 2);
  switchPlate(g, 1.78, -5.79, '#2b2d31', 4);
  switchPlate(g, 1.78, -5.16, '#fafafa', 3);

  // Fuse box (MCB box) and LED bulbs.
  box(g, 0.1, 0.36, 0.62, M('#d8dadc', { roughness: 0.4 }), 3.7, 1.2, -6.95);
  box(g, 0.02, 0.15, 0.5, M('#22262b', { roughness: 0.3 }), 3.645, 1.2, -6.95);
  for (let i = 0; i < 6; i++) box(g, 0.02, 0.05, 0.03, M('#2f7fe0'), 3.632, 1.22, -7.15 + i * 0.08);
  for (let i = 0; i < 4; i++) {
    const z = -6.2 + i * 0.34;
    const holder = cyl(g, 0.03, 0.03, 0.08, M('#f0f0f0'), 3.72, 1.22, z, 12);
    holder.rotation.z = Math.PI / 2;
    ball(g, 0.055, M('#fff7dd', { emissive: '#ffe9a8', emissiveIntensity: 0.9 }), 3.63, 1.22, z);
  }

  // Low cabinet with boxes on top.
  box(g, 0.5, 0.78, 2.95, M(WOOD), 3.53, 0.39, zc);
  box(g, 0.52, 0.03, 2.99, M(WOOD_DARK), 3.53, 0.795, zc);
  for (let z = -7.3; z < -4.7; z += 0.24) {
    const h = 0.1 + rnd() * 0.1;
    box(g, 0.2, +h.toFixed(2), 0.18, M(pick(PALETTE)), 3.5, 0.81 + +h.toFixed(2) / 2, z);
  }

  plane(g, 0.2, 0.06, texMat(T.brandSticker('ANCHOR')), 3.7, 1.95, -7.05, -Math.PI / 2);
  plane(g, 0.2, 0.06, texMat(T.brandSticker('HAVELLS')), 3.7, 1.95, -5.79, -Math.PI / 2);
  plane(g, 1.4, 0.44, texMat(T.dealerBoard('HAVELLS • ANCHOR • POLYCAB • FINOLEX', 'ELECTRICALS')), 3.56, 2.58, zc, -Math.PI / 2);
  sectionBoard(g, 'ఎలక్ట్రికల్స్', 'ELECTRICALS', 3.74, 3.02, zc, -Math.PI / 2, 1.9);
}

// ---------------- Hardware (front left corner) ----------------
function gamela(parent, color, x, y, z) {
  const geo = G('gamela', () =>
    new THREE.LatheGeometry(
      [[0.001, 0.014], [0.17, 0.0], [0.19, 0.004], [0.31, 0.115], [0.335, 0.125], [0.34, 0.118]].map(
        ([a, b]) => new THREE.Vector2(a, b)
      ),
      28
    )
  );
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: color === '#8d9196' ? 0.3 : 0.05, side: THREE.DoubleSide }));
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function hardware(g) {
  box(g, 0.55, 0.4, 1.5, M(WOOD_DARK), -3.5, 0.2, -1.25);
  const nails = M('#b9bec4', { metalness: 0.3, roughness: 0.4 });
  ['2"', '3"', '4"'].forEach((size, i) => {
    const z = -0.75 - i * 0.5;
    box(g, 0.44, 0.22, 0.42, M(WOOD), -3.5, 0.51, z);
    const heap = ball(g, 0.19, nails, -3.5, 0.6, z);
    heap.scale.set(1, 0.5, 1);
    // A few single nails lying on the heap.
    for (let k = 0; k < 7; k++) {
      const n = cyl(g, 0.006, 0.002, 0.11 + i * 0.03, nails, -3.5 + (rnd() - 0.5) * 0.24, 0.7 + rnd() * 0.01, z + (rnd() - 0.5) * 0.24, 6);
      n.rotation.set(Math.PI / 2 + (rnd() - 0.5) * 0.4, 0, rnd() * Math.PI);
    }
    plane(g, 0.24, 0.12, texMat(T.labelTexture(`మేకులు ${size}`, 'NAILS')), -3.22, 0.5, z, Math.PI / 2);
  });

  for (let k = 0; k < 8; k++) gamela(g, '#1d1e21', -2.62, 0.02 + k * 0.032, -0.82);
  for (let k = 0; k < 6; k++) gamela(g, '#8d9196', -2.62, 0.02 + k * 0.032, -1.62);
  const hung = gamela(g, '#1d1e21', -3.74, 1.5, -1.25);
  hung.rotation.z = -Math.PI / 2;

  sectionBoard(g, 'హార్డ్‌వేర్', 'HARDWARE', -3.76, 2.35, -1.25, Math.PI / 2, 1.5);
}

// ---------------- Counter and the shelf behind it ----------------
function counter(g) {
  const cx = 2.2;
  const cz = -2.6;
  box(g, 2.6, 0.55, 0.7, M(WOOD), cx, 0.275, cz);
  box(g, 2.6, 0.03, 0.66, M('#f3efe4'), cx, 0.565, cz);
  const glass = new THREE.MeshStandardMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.22, roughness: 0.1 });
  const gl = box(g, 2.6, 0.4, 0.7, glass, cx, 0.75, cz);
  gl.castShadow = false;
  box(g, 2.68, 0.045, 0.78, M('#2a2420', { roughness: 0.35 }), cx, 0.972, cz);
  for (const s of [-1, 1]) box(g, 0.04, 0.4, 0.04, M('#c9a227', { metalness: 0.7, roughness: 0.35 }), cx + s * 1.3, 0.75, cz + 0.35);
  plane(g, 1.7, 0.425, texMat(T.counterPlate(shop)), cx, 0.29, cz + 0.352, 0);

  // Small items inside the glass counter.
  for (let x = cx - 1.15; x < cx + 1.2; x += 0.2) {
    if (rnd() < 0.3) {
      const roll = new THREE.Mesh(G('tape', () => new THREE.TorusGeometry(0.05, 0.025, 8, 18)), M(pick(['#1b1b1b', '#d62828', '#ffd23f', '#1d4ed8']), { roughness: 0.4 }));
      roll.rotation.x = Math.PI / 2;
      roll.position.set(x, 0.61, cz + (rnd() - 0.5) * 0.3);
      g.add(roll);
    } else {
      box(g, 0.14, 0.1, 0.18, M(pick(PALETTE)), x, 0.63, cz + (rnd() - 0.5) * 0.2);
    }
  }

  // Weighing scale (nails are sold by weight), bill book, calculator.
  const steel = M('#c9ccd0', { metalness: 0.7, roughness: 0.3 });
  box(g, 0.3, 0.06, 0.3, M('#e8e8ea', { roughness: 0.4 }), cx - 0.6, 1.025, cz);
  box(g, 0.34, 0.012, 0.34, steel, cx - 0.6, 1.075, cz);
  const disp = box(g, 0.2, 0.09, 0.03, M('#22262b'), cx - 0.6, 1.045, cz + 0.17);
  disp.rotation.x = -0.5;
  box(g, 0.14, 0.004, 0.03, M('#7cff9b', { emissive: '#7cff9b', emissiveIntensity: 0.8 }), cx - 0.6, 1.052, cz + 0.186).rotation.x = -0.5;
  box(g, 0.2, 0.025, 0.28, M('#fffdf5'), cx - 0.02, 1.008, cz + 0.17).rotation.y = 0.2;
  box(g, 0.09, 0.015, 0.14, M('#1f2937'), cx - 0.3, 1.003, cz + 0.22).rotation.y = -0.3;

  // Tall shelf behind the counter.
  const sz = -4.3;
  box(g, 2.6, 2.5, 0.04, M(WOOD_DARK), cx, 1.25, sz - 0.2);
  for (const s of [-1, 1]) box(g, 0.05, 2.5, 0.4, M(WOOD_DARK), cx + s * 1.3, 1.25, sz);
  const ys = [0.1, 0.62, 1.14, 1.66, 2.18];
  for (const y of ys) box(g, 2.6, 0.03, 0.38, M(WOOD), cx, y, sz);
  box(g, 2.66, 0.05, 0.42, M(WOOD_DARK), cx, 2.5, sz);
  const sizes = [[0.16, 0.2, 0.2], [0.2, 0.14, 0.22], [0.14, 0.3, 0.16], [0.22, 0.24, 0.2]];
  ys.forEach((y, li) => {
    for (let x = cx - 1.14; x < cx + 1.15; ) {
      if (li === 2 && rnd() < 0.6) {
        paintBucket(g, 0.075, 0.16, pick(PALETTE), x + 0.08, y + 0.015, sz + 0.02);
        x += 0.19;
      } else {
        const [w, h, d] = pick(sizes);
        box(g, w, h, d, M(pick(PALETTE)), x + w / 2, y + 0.015 + h / 2, sz + 0.03);
        x += w + 0.03;
      }
    }
  });
}

// ---------------- Sanitary display (front of the right wall) ----------------
function sanitary(g) {
  const chrome = M('#e6e9ed', { metalness: 1, roughness: 0.16 });
  box(g, 0.04, 1.1, 1.5, M('#f4f6f8', { roughness: 0.4 }), 3.775, 1.75, -1.15);
  for (const y of [2.02, 1.52]) {
    for (const z of [-1.65, -1.15, -0.65]) {
      cyl(g, 0.02, 0.02, 0.14, chrome, 3.69, y, z, 12).rotation.z = Math.PI / 2;
      cyl(g, 0.04, 0.04, 0.02, chrome, 3.75, y, z, 16).rotation.z = Math.PI / 2;
      cyl(g, 0.015, 0.015, 0.1, chrome, 3.63, y - 0.045, z, 10);
      box(g, 0.022, 0.022, 0.08, chrome, 3.65, y + 0.035, z);
    }
  }
  // Wash basin on a stand.
  const ceramic = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.12, side: THREE.DoubleSide });
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry([[0.02, 0], [0.16, 0.02], [0.24, 0.1], [0.27, 0.2], [0.29, 0.21]].map(([a, b]) => new THREE.Vector2(a, b)), 28),
    ceramic
  );
  bowl.position.set(3.42, 0.8, -1.15);
  g.add(bowl);
  cyl(g, 0.075, 0.105, 0.82, ceramic, 3.42, 0.41, -1.15, 20);
  cyl(g, 0.015, 0.015, 0.14, chrome, 3.62, 1.06, -1.15, 10);
  cyl(g, 0.013, 0.013, 0.12, chrome, 3.57, 1.12, -1.15, 10).rotation.z = Math.PI / 2;
  sectionBoard(g, 'శానిటరీ', 'SANITARY', 3.74, 2.62, -1.15, -Math.PI / 2, 1.5);
  plane(g, 1.1, 0.35, texMat(T.dealerBoard('HINDWARE • CERA • PARRYWARE', 'SANITARY')), 3.56, 2.18, -1.15, -Math.PI / 2);
}

// ---------------- Things that make the shop feel lived in ----------------
function clutter(g) {
  // Hose pipe coils hanging from the ceiling near the door.
  const hook = M('#8d9196', { metalness: 0.7, roughness: 0.4 });
  const coils = [[-2.5, '#2f7fe0'], [-1.6, '#3fae5a'], [1.3, '#f08a24'], [2.3, '#2f7fe0']];
  for (const [x, c] of coils) {
    for (let i = 0; i < 4; i++) {
      const coil = new THREE.Mesh(G('hose', () => new THREE.TorusGeometry(0.24, 0.026, 8, 30)), M(c, { roughness: 0.45 }));
      coil.position.set(x + (i % 2) * 0.012, 2.74, -0.86 - i * 0.05);
      coil.scale.setScalar(1 - (i % 2) * 0.07);
      g.add(coil);
    }
    cyl(g, 0.008, 0.008, 0.43, hook, x, 3.19, -0.93, 6);
  }
  // Cardboard cartons at the back.
  const card = M('#b88a55', { roughness: 0.95 });
  const tape = M('#d9c29a', { roughness: 0.8 });
  for (const [x, y, z, ry] of [[2.75, 0.2, -7.75, 0.1], [2.2, 0.2, -7.9, -0.15], [2.6, 0.6, -7.8, 0.3]]) {
    const b = box(g, 0.5, 0.4, 0.42, card, x, y, z);
    b.rotation.y = ry;
    box(b, 0.51, 0.005, 0.07, tape, 0, 0.2, 0);
  }
  // Wall calendar next to the counter.
  box(g, 0.012, 0.56, 0.38, M('#ffffff'), 3.792, 2.0, -3.45);
  plane(g, 0.36, 0.54, texMat(T.calendarTexture()), 3.783, 2.0, -3.45, -Math.PI / 2);
}

// ---------------- Lights and fans ----------------
function lightsAndFan(g) {
  // Each tube light has its own material and lamp, so each can be switched.
  const tubes = [];
  for (const [x, z] of [[0, -1.9], [0, -4.9], [-1.2, -7.6]]) {
    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff6e0', emissiveIntensity: 2.2 });
    box(g, 1.3, 0.05, 0.1, mat, x, 3.37, z);
    const light = new THREE.PointLight('#fff1d6', 9, 11, 1.6);
    light.position.set(x, 2.95, z);
    g.add(light);
    tubes.push({ mat, light, level: 1 });
  }
  const fan = new THREE.Group();
  fan.position.set(-0.4, 3.02, -3.4);
  g.add(fan);
  const fm = M('#f2efe6', { roughness: 0.5 });
  cyl(g, 0.02, 0.02, 0.36, M('#8d9196'), -0.4, 3.22, -3.4, 8);
  cyl(fan, 0.11, 0.11, 0.08, fm, 0, 0, 0, 16);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group();
    arm.rotation.y = (i * Math.PI * 2) / 3;
    fan.add(arm);
    box(arm, 0.62, 0.012, 0.13, fm, 0.4, 0, 0);
  }
  return { fan, tubes };
}

// Small fan on the counter. Returns the part that spins.
function tableFan(g) {
  const f = new THREE.Group();
  f.position.set(1.15, 0.995, -2.68);
  f.rotation.y = -0.45;
  g.add(f);
  const body = M('#f3f1ea', { roughness: 0.4 });
  const steel = M('#9aa0a6', { metalness: 0.7, roughness: 0.35 });
  cyl(f, 0.1, 0.11, 0.03, body, 0, 0.015, 0, 20);
  cyl(f, 0.016, 0.016, 0.24, body, 0, 0.15, 0, 10);
  const head = new THREE.Group();
  head.position.set(0, 0.31, 0.02);
  f.add(head);
  cyl(head, 0.05, 0.05, 0.1, body, 0, 0, -0.03, 14).rotation.x = Math.PI / 2;
  for (const z of [0.01, 0.075]) {
    const ring = new THREE.Mesh(G('fanring', () => new THREE.TorusGeometry(0.15, 0.006, 6, 30)), steel);
    ring.position.z = z;
    head.add(ring);
  }
  for (let i = 0; i < 8; i++) box(head, 0.3, 0.004, 0.004, steel, 0, 0, 0.075).rotation.z = (i * Math.PI) / 8;
  const blades = new THREE.Group();
  blades.position.z = 0.04;
  head.add(blades);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI * 2) / 3;
    blades.add(arm);
    box(arm, 0.11, 0.07, 0.008, M('#2f7fe0', { roughness: 0.3 }), 0.075, 0, 0).rotation.x = 0.35;
  }
  cyl(blades, 0.025, 0.025, 0.03, body, 0, 0, 0, 12).rotation.x = Math.PI / 2;
  return blades;
}

// The testing board on the counter: a bulb holder and five working switches.
function testBoard(g) {
  const b = new THREE.Group();
  b.position.set(2.95, 0.995, -2.8);
  b.rotation.y = -0.45;
  g.add(b);
  box(b, 0.74, 0.5, 0.03, M('#a9743f', { roughness: 0.8 }), 0, 0.27, 0);
  for (const s of [-1, 1]) box(b, 0.06, 0.03, 0.22, M(WOOD_DARK), s * 0.3, 0.015, 0);
  plane(b, 0.34, 0.17, texMat(T.labelTexture('టెస్టింగ్ బోర్డు', 'TESTING BOARD')), 0.12, 0.4, 0.017, 0);

  // Bulb holder on the top edge.
  const white = M('#f5f5f5', { roughness: 0.4 });
  cyl(b, 0.04, 0.046, 0.02, white, -0.25, 0.53, 0, 16);
  cyl(b, 0.03, 0.03, 0.05, white, -0.25, 0.555, 0, 16);
  const seat = new THREE.Object3D();
  seat.position.set(-0.25, 0.565, 0);
  b.add(seat);

  const keys = [['bulb', 'బల్బ్'], ['fan', 'ఫ్యాన్'], ['light0', 'లైట్ 1'], ['light1', 'లైట్ 2'], ['light2', 'లైట్ 3']];
  const switches = {};
  keys.forEach(([key, te], i) => {
    const x = -0.27 + i * 0.135;
    box(b, 0.1, 0.14, 0.012, M('#fafafa', { roughness: 0.35 }), x, 0.21, 0.021);
    const rocker = box(b, 0.05, 0.08, 0.022, M('#ffffff', { roughness: 0.3 }), x, 0.205, 0.034);
    const dot = ball(b, 0.008, new THREE.MeshStandardMaterial({ color: '#5a1010', emissive: '#ff3b30', emissiveIntensity: 0 }), x, 0.262, 0.03);
    plane(b, 0.11, 0.055, texMat(T.labelTexture(te, '')), x, 0.1, 0.017, 0);
    const hit = box(b, 0.13, 0.24, 0.1, HIT, x, 0.19, 0.04);
    switches[key] = { rocker, dot, hit };
  });
  return { seat, switches };
}

// The bulb that waits on the counter.
function testBulb(g) {
  box(g, 0.16, 0.012, 0.16, M('#b88a55', { roughness: 0.95 }), 2.5, 1.0, -2.82);
  const bulb = new THREE.Group();
  bulb.position.set(2.5, 1.006, -2.82);
  g.add(bulb);
  const glass = new THREE.MeshStandardMaterial({
    color: '#fffdf2', emissive: '#ffb347', emissiveIntensity: 0, roughness: 0.15, transparent: true, opacity: 0.93,
  });
  cyl(bulb, 0.024, 0.024, 0.04, M('#b9bdc2', { metalness: 0.8, roughness: 0.3 }), 0, 0.02, 0, 14);
  cyl(bulb, 0.04, 0.024, 0.04, glass, 0, 0.06, 0, 16);
  ball(bulb, 0.055, glass, 0, 0.115, 0);
  const light = new THREE.PointLight('#ffd9a0', 0, 5, 1.8);
  light.position.y = 0.12;
  bulb.add(light);
  const hit = box(bulb, 0.2, 0.26, 0.2, HIT, 0, 0.1, 0);
  return { bulb, glass, light, hit, rest: bulb.position.clone() };
}

export function buildInterior(scene) {
  const g = new THREE.Group();
  scene.add(g);
  paints(g);
  const pullPipes = pipes(g);
  electricals(g);
  hardware(g);
  counter(g);
  sanitary(g);
  clutter(g);
  const { fan, tubes } = lightsAndFan(g);
  const blades = tableFan(g);
  const board = testBoard(g);
  const bulb = testBulb(g);
  // Things inside do not need to cast sun shadows. This keeps the page fast.
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = false;
  });
  return { fan, tubes, tableFan: blades, board, bulb, pullPipes };
}
