// Starts the page: builds the 3D scene, then links scrolling to the camera
// and to the shopkeeper's movements.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import './style.css';
import { buildWorld } from './world.js';
import { createOwner, poseOwner, reachWith } from './character.js';
import { createInteractions } from './interact.js';
import * as sound from './sound.js';
import { initUI } from './ui.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => x * x * (3 - 2 * x);
const span = (a, b, x) => clamp01((x - a) / (b - a)); // 0 before a, 1 after b
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Camera stops. One per scroll step, in the same order as the cards in ui.js.
// "phone" is a different camera spot used on tall phone screens, where the
// view is narrow and the text card sits at the bottom.
const SHOTS = [
  { pos: V(1.6, 2.4, 15.5), look: V(-3.4, 3.7, 0), phone: { pos: V(0, 2.4, 17), look: V(0, 5.2, 0) } }, // street
  { pos: V(-1.0, 1.8, 7.8), look: V(-1.4, 1.9, 0), phone: { pos: V(0.9, 1.8, 8.6), look: V(0.9, 1.9, 0) } }, // shutter
  { pos: V(-0.5, 1.7, 3.6), look: V(-0.6, 1.5, -4) }, // looking in
  { pos: V(-0.6, 1.55, -4.0), look: V(-3.7, 1.4, -3.9) }, // paints
  { pos: V(-0.9, 1.5, -2.6), look: V(-0.7, 1.15, -6.6) }, // pipes
  { pos: V(0.1, 1.65, -5.7), look: V(3.8, 1.6, -5.2) }, // electricals
  { pos: V(-0.7, 1.5, -1.0), look: V(-3.3, 0.6, -0.8) }, // hardware
  { pos: V(0.3, 1.5, -0.5), look: V(1.75, 1.15, -3.1), phone: { pos: V(1.7, 1.55, -0.1), look: V(2.55, 1.2, -3.0) } }, // counter, list
  { pos: V(1.0, 1.6, -0.4), look: V(1.75, 1.3, -3.3), phone: { pos: V(1.6, 1.6, -0.2), look: V(2.45, 1.3, -3.2) } }, // goodbye
];

// ---------- The shopkeeper's path ----------
const STAND = V(1.2, 0, 1.5); // waiting outside
const DOOR = V(0, 0, 0.8); // in front of the shutter
const INSIDE = [DOOR, V(-0.5, 0, -1.4), V(-0.3, 0, -3.3), V(2.2, 0, -3.3)];
const insideLens = INSIDE.slice(1).map((p, i) => p.distanceTo(INSIDE[i]));
const insideTotal = insideLens.reduce((a, b) => a + b, 0);
const STRIDE = (Math.PI * 2) / 1.25; // one full walk cycle every 1.25 metres
const ramp = (u) => Math.min(1, u * 8, (1 - u) * 8);

// Given the scroll step number s (0 to 8, with fractions), says where the
// shopkeeper is and what he is doing.
function ownerAt(s, camera) {
  const st = { pos: STAND.clone(), heading: 0, phase: 0, walk: 0, bend: 0, lift: 0, wave: 0, beckon: 0, shutter: 0 };
  if (s < 1.0) {
    // At the start he calls the visitor in with his hand.
    st.beckon = 1 - smooth(span(0.45, 0.85, s));
    return st;
  }

  if (s < 1.3) {
    const u = span(1.0, 1.3, s);
    st.pos.lerpVectors(STAND, DOOR, u);
    st.heading = u > 0.85 ? Math.PI : Math.atan2(DOOR.x - STAND.x, DOOR.z - STAND.z);
    st.phase = u * STAND.distanceTo(DOOR) * STRIDE;
    st.walk = ramp(u);
    return st;
  }

  st.pos.copy(DOOR);
  st.heading = Math.PI;
  if (s < 1.5) {
    st.bend = smooth(span(1.3, 1.5, s));
    return st;
  }
  if (s < 1.8) {
    const u = smooth(span(1.5, 1.8, s));
    st.bend = 1 - u;
    st.lift = u;
    st.shutter = u;
    return st;
  }
  st.shutter = 1;
  if (s < 1.9) {
    st.lift = 1 - smooth(span(1.8, 1.9, s));
    return st;
  }

  if (s < 2.75) {
    const u = span(1.9, 2.75, s);
    let d = u * insideTotal;
    st.phase = d * STRIDE;
    st.walk = ramp(u);
    for (let i = 0; i < insideLens.length; i++) {
      if (d <= insideLens[i] || i === insideLens.length - 1) {
        const a = INSIDE[i];
        const b = INSIDE[i + 1];
        st.pos.lerpVectors(a, b, clamp01(d / insideLens[i]));
        st.heading = Math.atan2(b.x - a.x, b.z - a.z);
        break;
      }
      d -= insideLens[i];
    }
    return st;
  }

  // Behind the counter: turn towards the customer (the camera).
  st.pos.copy(INSIDE[INSIDE.length - 1]);
  st.heading = Math.atan2(camera.position.x - st.pos.x, camera.position.z - st.pos.z);
  st.wave = smooth(span(7.45, 7.9, s));
  return st;
}

async function fontsReady() {
  const sample = 'పరమేశ్వర ఎంటర్‌ప్రైజెస్';
  const wanted = ['400 40px Ramabhadra', '800 40px "Noto Sans Telugu"', '600 40px "Noto Sans Telugu"', '700 40px "DM Sans"'];
  const load = Promise.all(wanted.map((f) => document.fonts.load(f, sample).catch(() => {})));
  // Do not wait for ever if the internet is slow. Windows fonts are the fallback.
  await Promise.race([load, new Promise((r) => setTimeout(r, 3000))]);
}

async function start() {
  await fontsReady();
  const stepCount = initUI();

  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  // Soft light from all sides. It makes metal, glass and skin look more real.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  const world = buildWorld(scene);
  const owner = createOwner();
  scene.add(owner.root);
  const inter = createInteractions({ world, camera, canvas, getStep: () => s });

  // ---------- Scroll position -> step number ----------
  const scrim = document.querySelector('.hero-scrim');
  const cards = [...document.querySelectorAll('.step .card')];
  let anchors = [];
  let W = 1;
  let H = 1;
  let tall = false;
  let baseFov = 42;
  const shotFor = (i) => (tall && SHOTS[i].phone) || SHOTS[i];
  function measure() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    W = w;
    H = h;
    tall = w / h < 1;
    // On tall phone screens, widen the view so the shop still fits.
    baseFov = tall ? 42 + (1 - w / h) * 48 : 42;
    camera.clearViewOffset();
    camera.aspect = w / h;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();

    const max = document.documentElement.scrollHeight - h;
    const phone = w <= 760;
    anchors = cards.map((card, i) => {
      if (i === 0) return 0;
      if (i === cards.length - 1) return max;
      const r = card.getBoundingClientRect();
      const top = r.top + window.scrollY;
      return phone ? top + r.height - h * 0.94 : top + r.height / 2 - h / 2;
    });
  }
  function stepFromScroll() {
    const y = window.scrollY;
    for (let i = 0; i < anchors.length - 1; i++) {
      if (y <= anchors[i + 1]) return i + clamp01((y - anchors[i]) / (anchors[i + 1] - anchors[i]));
    }
    return stepCount - 1;
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('relayout', measure);
  new ResizeObserver(measure).observe(document.getElementById('story'));

  // ---------- Animation loop ----------
  let s = stepFromScroll();
  let heading = 0;
  let last = performance.now();
  let snap = true;
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const head = new THREE.Vector3();
  const bubble = document.getElementById('bubble');
  let prevPhase = 0;
  let prevShutter = 0;

  // ---------- Sound ----------
  // Browsers allow sound only after the visitor taps or clicks once.
  for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, sound.unlock, { passive: true });
  const soundBtn = document.getElementById('soundBtn');
  soundBtn.addEventListener('click', () => {
    sound.setEnabled(!sound.isEnabled());
    soundBtn.textContent = sound.isEnabled() ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-pressed', String(sound.isEnabled()));
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.stepper button')) sound.ding();
    else if (e.target.closest('button, a')) sound.tap();
  });

  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    const target = stepFromScroll();
    s = snap ? target : s + (target - s) * (1 - Math.exp(-dt * 5));

    // Camera: rest at each stop, glide between stops.
    const i = Math.min(SHOTS.length - 2, Math.floor(s));
    const u = smooth(span(0.15, 0.85, s - i));
    pos.lerpVectors(shotFor(i).pos, shotFor(i + 1).pos, u);
    look.lerpVectors(shotFor(i).look, shotFor(i + 1).look, u);
    camera.position.copy(pos);
    camera.lookAt(look);
    if (tall) {
      // On a phone the text card covers the lower half of the screen. So
      // the picture is pushed up: the thing being shown sits in the upper
      // part, where it can be seen and tapped. The first screen is left
      // alone because its text is at the top.
      const f = 0.42 * smooth(span(0.35, 1, s));
      const fullH = H * (1 + f);
      const half = Math.tan(THREE.MathUtils.degToRad(baseFov) / 2) * (1 + f);
      camera.aspect = W / fullH;
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(half));
      camera.setViewOffset(W, fullH, 0, H * f, W, H);
    }

    const st = ownerAt(s, camera);
    let diff = st.heading - heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    heading = snap ? st.heading : heading + diff * (1 - Math.exp(-dt * 9));
    owner.root.position.copy(st.pos);
    owner.root.rotation.y = heading;
    poseOwner(owner, { ...st, t: now / 1000 });

    world.setShutter(st.shutter);
    // Switches, fans, day and night, and the bulb test.
    const reach = inter.update(dt, now / 1000, s);
    if (reach.weight > 0) {
      owner.torso.rotation.x += reach.lean;
      reachWith(owner, 'L', reach.target, reach.weight);
    }
    scrim.style.opacity = String(1 - smooth(span(0.35, 0.9, s)));

    // Speech bubble above his head while he calls the visitor in.
    if (st.beckon > 0.02) {
      head.set(st.pos.x, 2.0, st.pos.z).project(camera);
      bubble.style.opacity = String(st.beckon);
      bubble.style.transform = `translate(${((head.x + 1) / 2) * W}px, ${((1 - head.y) / 2) * H}px) translate(-50%, -100%)`;
    } else {
      bubble.style.opacity = '0';
    }

    // Sounds that follow the scene.
    if (!snap) {
      if (st.walk > 0.4 && Math.floor(st.phase / Math.PI) !== Math.floor(prevPhase / Math.PI)) sound.step();
      const indoors = smooth(span(1.6, 2.4, s));
      sound.ambience({
        fan: inter.state.fanK * (0.15 + 0.85 * indoors),
        shutter: Math.min(1, (Math.abs(st.shutter - prevShutter) / Math.max(dt, 0.001)) * 1.5),
        crickets: inter.state.nightK * (1 - 0.75 * indoors),
      });
    }
    prevPhase = st.phase;
    prevShutter = st.shutter;

    snap = false;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // For testing: click a 3D object by name, for example __tap('bulb').
  // Names: bulb, outside, sw-bulb, sw-fan, sw-light0, sw-light1, sw-light2.
  // For a switch, half is 'down' (lower half, switches on) or 'up'.
  window.__tap = (name, half = 'down') => {
    const sw3d = name === 'outside' ? world.outsideSwitch : name === 'diwali' ? world.diwaliSwitch : name === 'bulb' ? null : world.board.switches[name.slice(3)];
    const at = sw3d
      ? sw3d.rocker.localToWorld(new THREE.Vector3(0, half === 'up' ? 0.02 : -0.02, 0.02))
      : world.bulb.hit.getWorldPosition(new THREE.Vector3());
    const p = at.project(camera);
    const r = canvas.getBoundingClientRect();
    const init = { clientX: r.left + ((p.x + 1) / 2) * r.width, clientY: r.top + ((1 - p.y) / 2) * r.height, bubbles: true };
    const el = document.elementFromPoint(init.clientX, init.clientY);
    el?.dispatchEvent(new MouseEvent('click', init));
    return { x: Math.round(init.clientX), y: Math.round(init.clientY), on: el?.id || el?.className, state: JSON.stringify(inter.state) };
  };

  // For testing: jump straight to a step, for example __jump(3.5).
  window.__jump = (v) => {
    const k = Math.min(anchors.length - 2, Math.floor(v));
    window.scrollTo(0, anchors[k] + (anchors[k + 1] - anchors[k]) * (v - k));
    snap = true;
  };
}

start();
