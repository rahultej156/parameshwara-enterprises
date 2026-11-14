// The street, the neighbouring buildings and the shop building with its
// signboard and rolling shutter.
// Directions: the shop faces +Z (towards the camera). X runs along the street.
import * as THREE from 'three';
import { M, texMat, box, cyl, ball, plane, G, rnd, paintBucket, HIT } from './kit.js';
import * as T from './textures.js';
import { buildInterior } from './interior.js';
import { shop } from './shopInfo.js';

export const SHOP = { halfW: 4, innerHalfW: 3.8, depth: 9.3, doorHalfW: 2.5, doorH: 3.0, ceil: 3.4, height: 7.2 };

function windowUnit(parent, x, y, z, w = 1.0, h = 1.4) {
  box(parent, w + 0.16, h + 0.16, 0.08, M('#f7f1dc'), x, y, z);
  box(parent, w / 2 - 0.03, h, 0.06, M('#2f6b57'), x - w / 4, y, z + 0.04);
  box(parent, w / 2 - 0.03, h, 0.06, M('#2f6b57'), x + w / 4, y, z + 0.04);
  box(parent, w + 0.3, 0.07, 0.2, M('#f7f1dc'), x, y - h / 2 - 0.1, z + 0.05);
}

function neighbour(parent, { x, w, h, d = 9, color, sign, shutterColor = '#8f979c', windows = 3 }) {
  box(parent, w, h, d, texMat(T.wallTexture(color, Math.round(Math.abs(x) * 10) + 1), { roughness: 0.95 }), x, h / 2, -d / 2 - 0.02);
  box(parent, w + 0.2, 0.18, 0.4, M('#efe7d2'), x, h, -0.1);
  if (sign) {
    const st = T.plainShutterTexture(shutterColor);
    st.wrapS = st.wrapT = THREE.RepeatWrapping;
    st.repeat.set(2, 2);
    plane(parent, 3.4, 2.7, texMat(st), x, 1.35, 0.0);
    box(parent, 3.8, 0.9, 0.1, M('#222222'), x, 3.3, 0.06);
    plane(parent, 3.7, 0.8, texMat(T.neighbourSign(...sign)), x, 3.3, 0.12);
  }
  const wy = Math.min(h - 1.3, 5.2);
  for (let i = 0; i < windows; i++) {
    const wx = x + (i - (windows - 1) / 2) * (w / windows);
    windowUnit(parent, wx, wy, 0.02);
  }
}

function buildStreet(scene) {
  const g = new THREE.Group();
  scene.add(g);

  const roadTex = T.roadTexture();
  roadTex.repeat.set(36, 18);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(140, 70), texMat(roadTex, { roughness: 1 }));
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, 24);
  road.receiveShadow = true;
  g.add(road);

  const apron = new THREE.Mesh(new THREE.PlaneGeometry(80, 2.8), M('#b8b0a0', { roughness: 1 }));
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(0, 0.012, 1.4);
  apron.receiveShadow = true;
  g.add(apron);

  for (let x = -36; x <= 36; x += 4.5) {
    const dash = new THREE.Mesh(G('dash', () => new THREE.PlaneGeometry(2, 0.14)), M('#e9e4d6'));
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, 0.013, 8.2);
    g.add(dash);
  }

  neighbour(g, {
    x: -8.1, w: 8, h: 6.2, color: '#a9c6d8',
    sign: ['కిరాణా స్టోర్', 'KIRANA STORE', '#f2c230', '#8f1d18'],
  });
  neighbour(g, {
    x: 8.1, w: 8, h: 8.2, color: '#e6b9a8', shutterColor: '#6f8f86',
    sign: ['టైలర్స్', 'TAILORS', '#1f6f5c', '#ffffff'],
  });
  neighbour(g, { x: -16.7, w: 9, h: 7.6, color: '#ead9a6', windows: 3 });
  neighbour(g, { x: 16.8, w: 9.2, h: 6.0, color: '#b9d3b0', windows: 3 });
  neighbour(g, { x: -26.3, w: 10, h: 5.4, color: '#d7b9c9', windows: 4 });
  neighbour(g, { x: 26.5, w: 10, h: 7.0, color: '#c7cfe0', windows: 4 });

  // Electric pole and wires.
  const steel = M('#6e6a66', { roughness: 0.6 });
  cyl(g, 0.08, 0.11, 8.6, steel, 5.4, 4.3, 3.1, 10);
  box(g, 0.08, 0.08, 1.5, steel, 5.4, 8.1, 3.1);
  const wireMat = new THREE.LineBasicMaterial({ color: '#1b1b1b' });
  for (const dz of [-0.6, 0, 0.6]) {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const x = -36 + (72 * i) / 40;
      const span = ((x - 5.4 + 200) % 20) / 20;
      pts.push(new THREE.Vector3(x, 8.1 - 0.9 * Math.sin(Math.PI * span), 3.1 + dz));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  }
  // Street lamp on the pole. It comes on at night.
  box(g, 1.1, 0.06, 0.06, steel, 4.9, 7.2, 3.1);
  const lampMat = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#ffd9a0', emissiveIntensity: 0 });
  box(g, 0.5, 0.07, 0.2, lampMat, 4.45, 7.14, 3.1);
  const lampLight = new THREE.PointLight('#ffd9a0', 0, 22, 1.6);
  lampLight.position.set(4.45, 6.9, 3.1);
  g.add(lampLight);
  return { lampMat, lampLight };
}

// A scalloped string of Diwali lights (U-shaped dips) across the shopfront,
// with short drops at the two corners. Off by default; the green outside
// switch turns it on. Returns the bulbs and the lamps they cast.
function buildFestoon(g) {
  const colors = ['#ff3b30', '#ffd23f', '#34c759', '#0a84ff', '#ff2d95'];
  const bulbG = new THREE.SphereGeometry(0.05, 10, 8);
  const bulbs = [];
  const wirePts = [];
  let ci = 0;
  const addBulb = (x, y, z, phase) => {
    const c = colors[ci++ % colors.length];
    const m = new THREE.Mesh(bulbG, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0, roughness: 0.3 }));
    m.position.set(x, y, z);
    m.castShadow = false;
    g.add(m);
    bulbs.push({ mesh: m, phase });
  };
  const xs = [];
  for (let i = 0; i <= 8; i++) xs.push(-3.8 + i * 0.95);
  const yTop = 5.15, zF = 0.55, sag = 0.44;
  for (let s = 0; s < xs.length - 1; s++) {
    for (let k = 0; k <= 5; k++) {
      const u = k / 5;
      const x = xs[s] + (xs[s + 1] - xs[s]) * u;
      const y = yTop - sag * 4 * u * (1 - u);
      wirePts.push(new THREE.Vector3(x, y, zF));
      if (!(s > 0 && k === 0)) addBulb(x, y, zF, (s * 6 + k) * 0.5);
    }
  }
  for (const cx of [-3.85, 3.85]) {
    for (let k = 1; k <= 6; k++) addBulb(cx, 5.0 - k * 0.42, 0.5, k * 0.6);
  }
  const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePts), new THREE.LineBasicMaterial({ color: '#222' }));
  g.add(wire);
  const lights = [];
  for (const lx of [-2.4, 0, 2.4]) {
    const l = new THREE.PointLight('#ffcaa0', 0, 9, 1.6);
    l.position.set(lx, 4.7, 1.3);
    g.add(l);
    lights.push(l);
  }
  return { bulbs, lights };
}

function buildShopShell(scene) {
  const g = new THREE.Group();
  scene.add(g);
  const { halfW, depth, doorHalfW, doorH, height } = SHOP;
  const wall = texMat(T.wallTexture('#f3e3b5', 7), { roughness: 0.95 });
  const trim = M('#fbf5e2');
  const band = M('#8f2a22');
  const pierW = halfW - doorHalfW;

  // Front wall with the door opening.
  for (const s of [-1, 1]) {
    const px = s * (doorHalfW + pierW / 2);
    box(g, pierW, doorH, 0.3, wall, px, doorH / 2, 0);
    box(g, pierW + 0.04, 0.55, 0.34, band, px, 0.275, 0);
  }
  box(g, halfW * 2, height - doorH, 0.3, wall, 0, doorH + (height - doorH) / 2, 0);
  // Side walls, back wall, ceiling, roof.
  for (const s of [-1, 1]) box(g, 0.2, height, depth, wall, s * (halfW - 0.1), height / 2, -depth / 2);
  box(g, halfW * 2, height, 0.2, wall, 0, height / 2, -depth);
  box(g, halfW * 2 - 0.4, 0.2, depth - 0.5, M('#fbf8ef'), 0, SHOP.ceil + 0.1, -depth / 2 - 0.15);
  box(g, halfW * 2, 0.2, depth, wall, 0, height, -depth / 2);
  box(g, halfW * 2 + 0.3, 0.22, 0.55, trim, 0, height + 0.05, 0.05);
  box(g, halfW * 2 + 0.2, 0.12, 0.42, trim, 0, 4.98, 0.05);

  for (const wx of [-2.5, 0, 2.5]) windowUnit(g, wx, 5.9, 0.16, 1.05, 1.45);

  // Tiled floor inside.
  const tiles = T.tileTexture();
  tiles.repeat.set(7, 9);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(7.6, depth), texMat(tiles, { roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.014, -depth / 2);
  floor.receiveShadow = true;
  g.add(floor);
  box(g, doorHalfW * 2, 0.03, 0.5, M('#9a9384'), 0, 0.015, 0.1);

  // Signboard.
  box(g, 6.56, 1.91, 0.12, M('#0b1d47'), 0, 3.98, 0.22);
  const glowing = (map) => {
    const m = texMat(map, { roughness: 0.55 });
    m.emissive = new THREE.Color('#ffffff');
    m.emissiveMap = map;
    m.emissiveIntensity = 0;
    return m;
  };
  const signMat = glowing(T.signTexture(shop));
  plane(g, 6.4, 1.75, signMat, 0, 3.98, 0.285);

  // Board on the roof, like many real shops have.
  const steel = M('#5d6166', { metalness: 0.5, roughness: 0.5 });
  for (const sx of [-2.4, 0, 2.4]) cyl(g, 0.04, 0.04, 1.5, steel, sx, height + 0.75, -0.25, 8);
  box(g, 6.1, 1.2, 0.08, M('#3a0d0a'), 0, height + 0.95, -0.18);
  const roofMat = glowing(T.roofBoardTexture('పెయింట్స్ • పైపులు • ఎలక్ట్రికల్స్', 'PAINTS • PIPES • ELECTRICALS • HARDWARE'));
  plane(g, 6.0, 1.125, roofMat, 0, height + 0.95, -0.135);

  // Lamps above the signboard, and the lights they give.
  const lampMat = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#ffe2a8', emissiveIntensity: 0 });
  for (const lx of [-1.25, 1.25]) {
    box(g, 0.03, 0.03, 0.6, steel, lx, 5.14, 0.45);
    cyl(g, 0.05, 0.1, 0.12, steel, lx, 5.08, 0.74, 14);
    ball(g, 0.05, lampMat, lx, 5.02, 0.74);
  }
  const signLight = new THREE.PointLight('#ffe9c4', 0, 10, 1.6);
  signLight.position.set(0, 4.4, 2.4);
  g.add(signLight);
  const frontLight = new THREE.PointLight('#ffe9c4', 0, 10, 1.6);
  frontLight.position.set(0, 2.6, 1.6);
  g.add(frontLight);

  // Two switches on the outside wall: one for the board lights, one for the
  // Diwali string lights.
  function wallSwitch(x, y, rockerColor, dotColor, te, en) {
    box(g, 0.26, 0.34, 0.03, M('#f1f1ee', { roughness: 0.4 }), x, y, 0.165);
    const rk = box(g, 0.1, 0.17, 0.04, M(rockerColor, { roughness: 0.35 }), x, y - 0.02, 0.19);
    const dt = ball(g, 0.015, new THREE.MeshStandardMaterial({ color: '#2a2320', emissive: dotColor, emissiveIntensity: 0 }), x, y + 0.12, 0.185);
    plane(g, 0.3, 0.14, texMat(T.labelTexture(te, en)), x, y + 0.3, 0.155);
    const h = box(g, 0.34, 0.5, 0.14, HIT, x, y + 0.05, 0.2);
    h.castShadow = false;
    return { rocker: rk, dot: dt, hit: h };
  }
  cyl(g, 0.012, 0.012, 1.7, M('#d8d8d4'), 2.98, 2.2, 0.165, 8);
  const outsideSwitch = wallSwitch(2.72, 1.55, '#d62828', '#ff3b30', 'బోర్డు లైట్లు', 'SIGN LIGHTS');
  const diwaliSwitch = wallSwitch(3.26, 1.55, '#2a9d3f', '#39ff6a', 'దీపావళి', 'DIWALI');
  const diwali = buildFestoon(g);

  // Marigold garland over the door.
  const flowers = [];
  const N = 46;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    flowers.push([-doorHalfW + doorHalfW * 2 * t, 2.99 - 0.27 * Math.abs(Math.sin(Math.PI * 2 * t))]);
  }
  for (const fx of [-doorHalfW + 0.02, 0, doorHalfW - 0.02]) {
    for (let k = 1; k <= 5; k++) flowers.push([fx, 2.99 - k * 0.1]);
  }
  const garland = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.06, 10, 8),
    new THREE.MeshStandardMaterial({ roughness: 0.9 }),
    flowers.length
  );
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  flowers.forEach(([fx, fy], i) => {
    m4.makeTranslation(fx, fy, 0.2);
    garland.setMatrixAt(i, m4);
    garland.setColorAt(i, col.set(i % 2 ? '#f59e0b' : '#fbbf24'));
  });
  garland.castShadow = true;
  g.add(garland);

  // Rolling shutter. It slides up behind the front wall.
  const shutter = new THREE.Group();
  shutter.position.set(0, 0, -0.21);
  g.add(shutter);
  const paint = texMat(T.shutterTexture(shop), { roughness: 0.6, metalness: 0.15 });
  const edge = M('#1f5d6b');
  const face = box(shutter, doorHalfW * 2 + 0.08, doorH + 0.06, 0.04, edge, 0, doorH / 2, 0);
  face.material = [edge, edge, edge, edge, paint, M('#184952')];
  box(shutter, doorHalfW * 2 + 0.08, 0.1, 0.07, M('#2a2f33', { metalness: 0.4, roughness: 0.5 }), 0, 0.05, 0);
  box(shutter, 0.5, 0.04, 0.05, M('#c9ccd0', { metalness: 0.6, roughness: 0.4 }), 0, 0.16, 0.05);
  for (const s of [-1, 1]) box(g, 0.07, doorH, 0.1, M('#2a2f33'), s * (doorHalfW + 0.02), doorH / 2, -0.21);

  // Stock kept outside the shop.
  buildOutsideStock(g);

  return { shell: g, shutter, glow: { signMat, roofMat, lampMat, signLight, frontLight }, outsideSwitch, diwaliSwitch, diwali };
}

function waterTank(g, x, y, z, color, k = 1, label = false) {
  const tank = new THREE.Group();
  tank.position.set(x, y, z);
  tank.scale.setScalar(k);
  g.add(tank);
  const m = M(color, { roughness: 0.5 });
  cyl(tank, 0.58, 0.6, 1.25, m, 0, 0.625, 0, 28);
  for (const ry of [0.3, 0.62, 0.94]) {
    const rib = new THREE.Mesh(G('rib', () => new THREE.TorusGeometry(0.6, 0.03, 8, 28)), m);
    rib.rotation.x = Math.PI / 2;
    rib.position.y = ry;
    rib.castShadow = true;
    tank.add(rib);
  }
  ball(tank, 0.58, m, 0, 1.25, 0).scale.set(1, 0.32, 1);
  cyl(tank, 0.2, 0.2, 0.08, m, 0, 1.45, 0, 18);
  if (label) plane(tank, 0.62, 0.3, texMat(T.labelTexture('వాటర్ ట్యాంక్', 'WATER TANK')), 0, 0.72, 0.605);
  return tank;
}

// A parked scooter. Its length runs along X before it is turned by ry.
function scooter(g, x, z, ry, color) {
  const s = new THREE.Group();
  s.position.set(x, 0, z);
  s.rotation.y = ry;
  g.add(s);
  const paint = M(color, { roughness: 0.35, metalness: 0.2 });
  const dark = M('#1b1b1d', { roughness: 0.6 });
  const steel = M('#b9bdc2', { metalness: 0.8, roughness: 0.3 });
  for (const wx of [-0.62, 0.62]) {
    const tyre = new THREE.Mesh(G('tyre', () => new THREE.TorusGeometry(0.2, 0.07, 10, 22)), dark);
    tyre.position.set(wx, 0.27, 0);
    tyre.castShadow = true;
    s.add(tyre);
    cyl(s, 0.1, 0.1, 0.09, steel, wx, 0.27, 0, 14).rotation.x = Math.PI / 2;
  }
  box(s, 0.56, 0.06, 0.32, dark, 0.04, 0.3, 0);
  ball(s, 0.3, paint, -0.45, 0.52, 0).scale.set(1.35, 0.78, 0.62);
  const seat = new THREE.Mesh(G('seat', () => new THREE.CapsuleGeometry(0.1, 0.46, 6, 12)), dark);
  seat.rotation.z = Math.PI / 2;
  seat.scale.z = 1.35;
  seat.position.set(-0.38, 0.79, 0);
  seat.castShadow = true;
  s.add(seat);
  box(s, 0.08, 0.66, 0.38, paint, 0.42, 0.62, 0).rotation.z = -0.25;
  ball(s, 0.25, paint, 0.62, 0.44, 0).scale.set(1, 0.5, 0.5);
  cyl(s, 0.03, 0.03, 0.5, dark, 0.47, 0.98, 0, 8).rotation.z = -0.25;
  cyl(s, 0.02, 0.02, 0.6, dark, 0.41, 1.16, 0, 8).rotation.x = Math.PI / 2;
  ball(s, 0.085, M('#fff7dd', { emissive: '#fff1c2', emissiveIntensity: 0.5 }), 0.5, 1.04, 0).scale.set(0.6, 1, 1.25);
  box(s, 0.04, 0.07, 0.14, M('#d62828', { emissive: '#7a0d0d', emissiveIntensity: 0.6 }), -0.84, 0.6, 0);
  box(s, 0.22, 0.02, 0.2, M('#f3f1ea'), -0.86, 0.48, 0).rotation.z = 1.2;
  return s;
}

function buildOutsideStock(g) {
  // Water tanks: black and white, stacked like in real shops.
  waterTank(g, -3.25, 0, 1.15, '#1d1e21', 1, true);
  waterTank(g, -3.25, 1.48, 1.15, '#f3f1ea', 0.62);
  waterTank(g, -4.8, 0, 1.3, '#f3f1ea', 1.0);
  waterTank(g, -4.8, 1.48, 1.3, '#2b6cb0', 0.7);

  // Long pipes leaning on the wall.
  const pipeCols = ['#a9adb0', '#a9adb0', '#efe3bf', '#efe3bf', '#b8683a', '#a9adb0', '#efe3bf'];
  pipeCols.forEach((c, i) => {
    const r = c === '#b8683a' ? 0.075 : c === '#a9adb0' ? 0.055 : 0.03;
    const p = cyl(g, r, r, 3.3, M(c, { roughness: 0.6 }), 2.98 + i * 0.13, 1.64, 0.52 - (i % 2) * 0.1, 14);
    p.rotation.x = -0.1;
    p.rotation.z = (rnd() - 0.5) * 0.05;
  });

  // Paint buckets: a pyramid on the right, tall columns beside the door.
  const bx = 3.2;
  const bz = 1.45;
  const cols = ['#e63946', '#ffd23f', '#3a86ff', '#2a9d8f', '#f4a261', '#8338ec'];
  let k = 0;
  for (let i = 0; i < 3; i++) paintBucket(g, 0.17, 0.36, cols[k++], bx - 0.36 + i * 0.36, 0, bz, true);
  for (let i = 0; i < 2; i++) paintBucket(g, 0.17, 0.36, cols[k++], bx - 0.18 + i * 0.36, 0.385, bz, true);
  paintBucket(g, 0.17, 0.36, cols[k++], bx, 0.77, bz, true);
  for (let i = 0; i < 5; i++) paintBucket(g, 0.17, 0.36, cols[(i * 2) % 6], -2.72, i * 0.385, 0.42, true);
  for (let i = 0; i < 4; i++) paintBucket(g, 0.17, 0.36, cols[(i * 2 + 1) % 6], -2.72, i * 0.385, 0.8, true);

  // Door mat and a parked scooter.
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.75), M('#2f7d4f', { roughness: 1 }));
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(0, 0.03, 0.75);
  mat.receiveShadow = true;
  g.add(mat);
  scooter(g, 4.6, 2.2, -0.35, '#c62828');
  scooter(g, -6.6, 2.3, 0.3, '#e9e6dc');
}

export function buildWorld(scene) {
  const street = buildStreet(scene);
  const { shutter, glow, outsideSwitch, diwaliSwitch, diwali } = buildShopShell(scene);
  const interior = buildInterior(scene);

  // Daylight (it becomes moonlight at night).
  const hemi = new THREE.HemisphereLight('#dff0ff', '#b79f7c', 0.8);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3d6', 2.6);
  sun.position.set(7, 13, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -20; sc.right = 20; sc.top = 14; sc.bottom = -8; sc.near = 1; sc.far = 45;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const C = (hex) => new THREE.Color(hex);
  const daySky = C('#dff0ff'), nightSky = C('#4f63a6');
  const dayGround = C('#b79f7c'), nightGround = C('#232a3d');
  const daySun = C('#fff3d6'), moon = C('#9fb6ff');

  return {
    ...interior,
    outsideSwitch,
    diwaliSwitch,
    // open: 0 = closed, 1 = fully open
    setShutter(open) {
      shutter.position.y = open * (SHOP.doorH - 0.12);
    },
    // n: 0 = day, 1 = night
    setNight(n) {
      hemi.intensity = 0.8 - 0.66 * n;
      hemi.color.lerpColors(daySky, nightSky, n);
      hemi.groundColor.lerpColors(dayGround, nightGround, n);
      sun.intensity = 2.6 - 2.25 * n;
      sun.color.lerpColors(daySun, moon, n);
      scene.environmentIntensity = 0.45 - 0.39 * n;
      street.lampMat.emissiveIntensity = 3 * n;
      street.lampLight.intensity = 60 * n;
    },
    // k: 0 = board lights off, 1 = on. They look stronger at night (n = 1).
    setSignLights(k, n) {
      glow.signMat.emissiveIntensity = k * (0.3 + 0.7 * n);
      glow.roofMat.emissiveIntensity = k * (0.3 + 0.7 * n);
      glow.lampMat.emissiveIntensity = k * 3;
      glow.signLight.intensity = k * (3 + 14 * n);
      glow.frontLight.intensity = k * (2 + 12 * n);
    },
    // k: 0..1 Diwali lights off/on; they twinkle, and cast more light at night.
    setDiwali(k, n, t) {
      for (const b of diwali.bulbs) b.mesh.material.emissiveIntensity = k * (0.55 + 0.45 * Math.sin(t * 4 + b.phase));
      for (const l of diwali.lights) l.intensity = k * (1.5 + 6 * n);
    },
  };
}
