// The shopkeeper. Built from simple shapes in code, so no outside tool or
// sign-in is needed. He wears a checked shirt and pant with chappals, and
// carries a phone and a pen in his left shirt pocket.
// He faces +Z. His left side is +X, his right side is -X.
import * as THREE from 'three';
import { shirtTexture } from './textures.js';

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });

function mesh(parent, geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
const group = (parent, x = 0, y = 0, z = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
};
const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 8, 18);
const sphere = (r) => new THREE.SphereGeometry(r, 28, 20);
const tube = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 22);

const THIGH = 0.34; // hip joint to knee
const SHIN = 0.4; // knee to ankle
const ANKLE = 0.074; // ankle to the bottom of the chappal

export function createOwner() {
  const skin = mat('#b9794c', { roughness: 0.6 });
  const skinDark = mat('#a3663d', { roughness: 0.6 });
  const cloth = shirtTexture();
  cloth.repeat.set(9, 4);
  const shirt = new THREE.MeshStandardMaterial({ map: cloth, roughness: 0.8 });
  const shirtTrim = mat('#b7cde6', { roughness: 0.8 });
  const pant = mat('#343946', { roughness: 0.85 });
  const pantDark = mat('#2a2e39', { roughness: 0.85 });
  const hair = mat('#221d1a', { roughness: 0.85 });
  const grey = mat('#77716c', { roughness: 0.85 });
  const sole = mat('#5a3a22');
  const strap = mat('#1b1b1b', { roughness: 0.5 });
  const metal = mat('#d8dbe0', { metalness: 0.8, roughness: 0.3 });

  const root = new THREE.Group();
  root.scale.setScalar(1.05);
  const hips = group(root, 0, THIGH + SHIN + ANKLE + 0.08, 0);
  mesh(hips, tube(0.205, 0.19, 0.2), pant, 0, -0.06, 0).scale.z = 0.76;

  // ----- Legs -----
  const legs = {};
  for (const [name, side] of [['L', 1], ['R', -1]]) {
    const thigh = group(hips, side * 0.1, -0.08, 0);
    mesh(thigh, sphere(0.092), pant);
    mesh(thigh, tube(0.092, 0.073, THIGH), pant, 0, -THIGH / 2, 0);
    const knee = group(thigh, 0, -THIGH, 0);
    mesh(knee, sphere(0.073), pant);
    mesh(knee, tube(0.072, 0.058, SHIN - 0.02), pant, 0, -(SHIN - 0.02) / 2, 0);
    mesh(knee, tube(0.062, 0.062, 0.03), pantDark, 0, -SHIN + 0.035, 0);
    const ankle = group(knee, 0, -SHIN, 0);
    mesh(ankle, sphere(0.04), skin, 0, 0, 0);
    mesh(ankle, sphere(0.05), skin, 0, -0.036, 0.06).scale.set(0.86, 0.5, 2.0);
    for (let i = 0; i < 5; i++) {
      mesh(ankle, sphere(0.0135 - i * 0.0012), skinDark, side * (0.03 - i * 0.015), -0.046, 0.155 - i * 0.005);
    }
    mesh(ankle, tube(0.058, 0.058, 0.02), sole, 0, -0.064, 0.06).scale.set(0.95, 1, 2.3);
    for (const s of [-1, 1]) {
      const st = mesh(ankle, new THREE.BoxGeometry(0.015, 0.012, 0.115), strap, s * 0.026, -0.016, 0.082);
      st.rotation.set(0.12, s * -0.46, s * -0.3);
    }
    legs[name] = { thigh, knee, ankle };
  }

  // ----- Body -----
  const torso = group(hips, 0, 0.02, 0);
  const profile = [
    [0.218, -0.13], [0.226, -0.04], [0.232, 0.08], [0.226, 0.2], [0.21, 0.32],
    [0.197, 0.42], [0.186, 0.49], [0.15, 0.545], [0.095, 0.585], [0.064, 0.6],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  mesh(torso, new THREE.LatheGeometry(profile, 30), shirt).scale.z = 0.74;
  mesh(torso, sphere(0.19), shirt, 0, 0.12, 0.05).scale.set(0.98, 0.9, 0.72);

  // Button strip, buttons and collar.
  const strip = mesh(torso, new THREE.BoxGeometry(0.034, 0.5, 0.008), shirtTrim, 0, 0.27, 0.172);
  strip.rotation.x = 0.1;
  for (let i = 0; i < 5; i++) {
    mesh(torso, sphere(0.0095), mat('#f8f8f8', { roughness: 0.3 }), 0, 0.49 - i * 0.1, 0.155 + i * 0.0098);
  }
  mesh(torso, tube(0.07, 0.1, 0.05), shirtTrim, 0, 0.6, -0.005).scale.z = 0.86;
  for (const s of [-1, 1]) {
    const wing = mesh(torso, new THREE.BoxGeometry(0.085, 0.012, 0.06), shirtTrim, s * 0.052, 0.585, 0.088);
    wing.rotation.set(0.95, s * 0.35, s * -0.5);
  }

  // Left shirt pocket with a phone and a pen in it.
  const pocket = group(torso, 0.1, 0.39, 0.131);
  pocket.rotation.y = 0.4;
  mesh(pocket, new THREE.BoxGeometry(0.104, 0.108, 0.012), shirtTrim, 0, 0, 0.006);
  mesh(pocket, new THREE.BoxGeometry(0.108, 0.014, 0.016), mat('#9db9d8'), 0, 0.05, 0.008);
  // Phone: dark body, lighter edge, camera.
  mesh(pocket, new THREE.BoxGeometry(0.07, 0.14, 0.012), mat('#101216', { roughness: 0.2 }), -0.013, 0.05, -0.004);
  mesh(pocket, new THREE.BoxGeometry(0.074, 0.008, 0.014), mat('#5b6270', { metalness: 0.6, roughness: 0.3 }), -0.013, 0.121, -0.004);
  mesh(pocket, new THREE.BoxGeometry(0.03, 0.026, 0.006), mat('#2a2f3a', { roughness: 0.2 }), -0.026, 0.096, 0.004);
  mesh(pocket, sphere(0.0065), mat('#0a0a0a', { roughness: 0.1 }), -0.026, 0.096, 0.008);
  // Pen: blue body, silver cap and clip.
  mesh(pocket, tube(0.008, 0.008, 0.14), mat('#1d4ed8', { roughness: 0.3 }), 0.038, 0.05, -0.001);
  mesh(pocket, tube(0.0088, 0.0088, 0.04), metal, 0.038, 0.105, -0.001);
  mesh(pocket, sphere(0.0088), metal, 0.038, 0.126, -0.001);
  mesh(pocket, new THREE.BoxGeometry(0.006, 0.055, 0.005), metal, 0.038, 0.082, 0.015);

  // ----- Head -----
  mesh(torso, tube(0.056, 0.062, 0.12), skin, 0, 0.62, 0);
  const head = group(torso, 0, 0.64, 0);
  const HY = 0.17;
  mesh(head, sphere(0.175), skin, 0, HY, 0).scale.set(0.96, 1.06, 1);
  mesh(head, sphere(0.13), skin, 0, HY - 0.075, 0.022).scale.set(1.04, 0.9, 1);

  const cap = mesh(head, new THREE.SphereGeometry(0.186, 30, 20, 0, Math.PI * 2, 0, 1.75), hair, 0, HY + 0.008, -0.012);
  cap.scale.set(0.99, 1.06, 1.03);
  cap.rotation.x = -0.82;
  mesh(head, sphere(0.075), hair, 0.03, HY + 0.158, 0.085).scale.set(1.5, 0.5, 1.05);

  for (const s of [-1, 1]) {
    mesh(head, sphere(0.05), grey, s * 0.163, HY + 0.045, 0.02).scale.set(0.35, 1, 1.25);
    mesh(head, sphere(0.036), skin, s * 0.17, HY - 0.012, -0.005).scale.set(0.5, 1, 0.8);
    mesh(head, sphere(0.018), skinDark, s * 0.178, HY - 0.012, 0.002).scale.set(0.4, 1, 0.7);

    const ex = s * 0.064;
    const ey = HY + 0.02;
    mesh(head, sphere(0.027), mat('#fbfbf7', { roughness: 0.25 }), ex, ey, 0.148).scale.set(1.12, 0.86, 0.5);
    mesh(head, sphere(0.0145), mat('#2a180e', { roughness: 0.2 }), ex, ey, 0.1615).scale.z = 0.6;
    mesh(head, sphere(0.0048), mat('#ffffff', { roughness: 0.1 }), ex + 0.006, ey + 0.006, 0.1705);
    const lid = mesh(head, capsule(0.0055, 0.046), hair, ex, ey + 0.023, 0.156);
    lid.rotation.set(0, s * 0.35, Math.PI / 2 - s * 0.06);
    const brow = mesh(head, capsule(0.0095, 0.046), hair, ex, ey + 0.055, 0.157);
    brow.rotation.set(0, s * 0.35, Math.PI / 2 + s * 0.14);

    const mo = mesh(head, capsule(0.02, 0.056), hair, s * 0.042, HY - 0.07, 0.158);
    mo.rotation.set(0, s * 0.4, s * 1.3);
  }
  mesh(head, sphere(0.022), skin, 0, HY - 0.002, 0.168).scale.set(0.8, 1.7, 1);
  mesh(head, sphere(0.03), skin, 0, HY - 0.032, 0.178).scale.set(1.15, 0.85, 1);
  mesh(head, sphere(0.022), hair, 0, HY - 0.064, 0.17).scale.set(1.3, 0.8, 0.8);
  // Smile under the moustache.
  const smile = mesh(head, new THREE.TorusGeometry(0.04, 0.0085, 8, 16, Math.PI), mat('#7a3528', { roughness: 0.5 }), 0, HY - 0.078, 0.146);
  smile.rotation.set(-0.25, 0, Math.PI);

  // ----- Arms and hands -----
  const arms = {};
  for (const [name, side] of [['L', 1], ['R', -1]]) {
    const shoulder = group(torso, side * 0.215, 0.5, 0);
    mesh(shoulder, capsule(0.05, 0.2), skin, 0, -0.16, 0);
    mesh(shoulder, capsule(0.069, 0.13), shirt, 0, -0.095, 0);
    mesh(shoulder, tube(0.073, 0.073, 0.022), shirtTrim, 0, -0.2, 0);
    const elbow = group(shoulder, 0, -0.27, 0);
    mesh(elbow, sphere(0.05), skin);
    mesh(elbow, tube(0.048, 0.04, 0.22), skin, 0, -0.12, 0);
    if (name === 'L') {
      mesh(elbow, tube(0.045, 0.043, 0.03), mat('#1b1b1b', { roughness: 0.4 }), 0, -0.2, 0);
      const dial = mesh(elbow, tube(0.027, 0.027, 0.012), mat('#f3f1ea', { roughness: 0.2 }), 0.045, -0.2, 0);
      dial.rotation.z = Math.PI / 2;
    }
    const hand = group(elbow, 0, -0.26, 0);
    mesh(hand, sphere(0.046), skin, 0, -0.02, 0).scale.set(0.52, 1.12, 0.95);
    for (let i = 0; i < 4; i++) {
      const f = mesh(hand, capsule(0.0115, 0.04), skin, side * -0.006, -0.082, -0.03 + i * 0.02);
      f.rotation.z = side * 0.25;
    }
    const thumb = mesh(hand, capsule(0.0135, 0.032), skin, side * -0.01, -0.035, 0.05);
    thumb.rotation.x = -0.7;
    arms[name] = { shoulder, elbow };
  }

  return { root, hips, torso, head, legs, arms };
}

// Sets the body pose.
//   phase   : walking cycle position (grows with distance walked)
//   walk    : 0 = standing, 1 = walking
//   bend    : 0 = straight, 1 = squatting to hold the shutter handle
//   lift    : 0 = arms down, 1 = arms pushed up over the head
//   wave    : 0 = no wave, 1 = waving with the right hand
//   beckon  : 0 = no, 1 = calling the visitor in with the right hand
//   t       : time in seconds, for small idle movement
export function poseOwner(o, { phase = 0, walk = 0, bend = 0, lift = 0, wave = 0, beckon = 0, t = 0 }) {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  const swing = 0.55 * walk;

  const set = (leg, thigh, knee) => {
    leg.thigh.rotation.x = thigh;
    leg.knee.rotation.x = knee;
    leg.ankle.rotation.x = -(thigh + knee);
    return THIGH * Math.cos(thigh) + SHIN * Math.cos(thigh + knee);
  };
  const hL = set(o.legs.L, -s * swing - bend * 1.15, walk * 0.9 * Math.max(0, c) + bend * 2.0);
  const hR = set(o.legs.R, s * swing - bend * 1.15, walk * 0.9 * Math.max(0, -c) + bend * 2.0);
  // The leg that reaches lower is the one standing on the ground.
  o.hips.position.y = Math.max(hL, hR) + 0.08 + ANKLE;

  const breathe = Math.sin(t * 1.8) * 0.012 * (1 - walk);
  o.torso.rotation.x = bend * 0.75 + breathe;
  o.torso.rotation.y = s * 0.12 * walk;
  o.head.rotation.x = -bend * 0.35 - lift * 0.3;
  o.head.rotation.y = Math.sin(t * 0.7) * 0.12 * (1 - walk) * (1 - bend);

  const reach = -bend * 0.9 - lift * 2.7;
  const relax = (1 - bend) * (1 - lift);
  o.arms.L.shoulder.rotation.set(s * swing * 0.9 + reach, 0, 0.09 * relax);
  o.arms.L.elbow.rotation.set(-(0.18 + walk * 0.35) * relax, 0, 0);

  const w = wave;
  o.arms.R.shoulder.rotation.set((-s * swing * 0.9 + reach) * (1 - w), 0, -0.09 * relax * (1 - w) - w * 2.45);
  o.arms.R.elbow.rotation.set(-(0.18 + walk * 0.35) * relax * (1 - w), 0, w * (-0.55 + Math.sin(t * 7) * 0.45));

  // "Come in": the right arm is held out and the forearm keeps folding
  // back towards the body.
  if (beckon > 0) {
    const sh = o.arms.R.shoulder.rotation;
    const el = o.arms.R.elbow.rotation;
    const pull = Math.sin(t * 6.5);
    sh.x += (-1.3 - sh.x) * beckon;
    sh.z += (-0.35 - sh.z) * beckon;
    el.x += (-(1.05 + 0.6 * pull) - el.x) * beckon;
    el.z *= 1 - beckon;
    o.head.rotation.x += 0.07 * pull * beckon;
    o.torso.rotation.x += 0.05 * beckon;
  }
}

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qa = new THREE.Quaternion();
const DOWN = new THREE.Vector3(0, -1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
const UPPER_ARM = 0.27; // shoulder to elbow
const FOREARM = 0.3; // elbow to the middle of the hand

// Bends one arm so that the hand reaches a point in the world.
// weight: 0 = keep the normal pose, 1 = reach fully.
// Call it after poseOwner.
export function reachWith(o, side, worldTarget, weight) {
  if (weight <= 0) return;
  const arm = o.arms[side];
  o.root.updateWorldMatrix(true, true);
  const local = o.torso.worldToLocal(_v.copy(worldTarget)).sub(arm.shoulder.position);
  const a = UPPER_ARM;
  const b = FOREARM;
  const dist = Math.max(0.12, Math.min(local.length(), a + b - 0.004));
  local.normalize();
  const cos = (x) => Math.acos(Math.min(1, Math.max(-1, x)));
  const elbowAngle = cos((a * a + b * b - dist * dist) / (2 * a * b));
  const shoulderOffset = cos((a * a + dist * dist - b * b) / (2 * a * dist));
  _q.setFromUnitVectors(DOWN, local);
  _q.multiply(_qa.setFromAxisAngle(X_AXIS, shoulderOffset));
  arm.shoulder.quaternion.slerp(_q, weight);
  arm.elbow.rotation.set(arm.elbow.rotation.x + (-(Math.PI - elbowAngle) - arm.elbow.rotation.x) * weight, 0, 0);
}
