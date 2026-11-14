// Small helpers for building 3D shapes. Shapes and materials are reused
// (cached) so the page stays fast.
import * as THREE from 'three';

const mats = new Map();
export function M(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!mats.has(key)) {
    mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o }));
  }
  return mats.get(key);
}

export function texMat(map, o = {}) {
  return new THREE.MeshStandardMaterial({ map, roughness: 0.8, ...o });
}

const geos = new Map();
export function G(key, make) {
  if (!geos.has(key)) geos.set(key, make());
  return geos.get(key);
}

function add(parent, geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function box(parent, w, h, d, mat, x = 0, y = 0, z = 0) {
  return add(parent, G(`box|${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d)), mat, x, y, z);
}

export function cyl(parent, rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 20) {
  return add(
    parent,
    G(`cyl|${rt}|${rb}|${h}|${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)),
    mat,
    x,
    y,
    z
  );
}

export function ball(parent, r, mat, x = 0, y = 0, z = 0) {
  return add(parent, G(`ball|${r}`, () => new THREE.SphereGeometry(r, 20, 14)), mat, x, y, z);
}

// Flat picture. ry turns it: 0 faces +Z, PI/2 faces +X, -PI/2 faces -X.
export function plane(parent, w, h, mat, x, y, z, ry = 0) {
  const m = add(parent, G(`plane|${w}|${h}`, () => new THREE.PlaneGeometry(w, h)), mat, x, y, z);
  m.rotation.y = ry;
  m.castShadow = false;
  return m;
}

// Repeatable random numbers, so the shop looks the same on every load.
let seed = 20261112;
export function rnd() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
export const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

export const PALETTE = [
  '#e63946', '#f4a261', '#ffd23f', '#2a9d8f', '#3a86ff', '#8338ec',
  '#ff6fae', '#6ab04c', '#f1e9d2', '#264653', '#d4a373', '#c1121f',
];

// A paint bucket: white body, colour band, coloured lid.
export function paintBucket(parent, r, h, color, x, y, z, handle = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  cyl(g, r, r * 0.88, h, M('#f4f2ea', { roughness: 0.5 }), 0, h / 2, 0, 18);
  cyl(g, r * 0.975 + 0.003, r * 0.915 + 0.003, h * 0.5, M(color, { roughness: 0.6 }), 0, h * 0.48, 0, 18);
  cyl(g, r * 1.03, r * 1.03, h * 0.07, M(color, { roughness: 0.6 }), 0, h, 0, 18);
  if (handle) {
    const t = new THREE.Mesh(
      G(`handle|${r}`, () => new THREE.TorusGeometry(r * 0.98, r * 0.035, 6, 18, Math.PI)),
      M('#8d9196', { metalness: 0.7, roughness: 0.4 })
    );
    t.position.y = h * 0.86;
    t.rotation.x = 1.25;
    g.add(t);
  }
  return g;
}

// Invisible box used as a click area around small things.
export const HIT = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
