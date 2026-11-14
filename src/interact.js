// Things the visitor can click in the 3D scene:
//   - the bulb on the counter (the shopkeeper tests it on the testing board)
//   - the switches on the testing board (bulb, fan, three tube lights)
//   - the switch on the outside wall (lights up the boards)
// and the sun / moon button that changes day to night.
import * as THREE from 'three';
import * as sound from './sound.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => x * x * (3 - 2 * x);
// Moves a value towards its goal a little every frame.
const ease = (cur, goal, dt, rate) => cur + (goal - cur) * (1 - Math.exp(-dt * rate));

const BULB_TEST_SECONDS = 3.6;

export function createInteractions({ world, camera, canvas, getStep }) {
  const st = {
    night: false, nightK: 0,
    sign: false, signK: 0,
    fan: true, fanK: 1,
    lights: [true, true, true],
    bulbIn: false, // is the bulb in the holder?
    lit: false, litK: 0,
    seq: null, // the running "test the bulb" animation: { dir, p }
    diwali: false, diwaliK: 0,
  };
  // One loose pipe per bay that slides out when the bay is clicked.
  const pulls = world.pullPipes.map((p) => ({ ...p, v: 0, hold: 0 }));

  const sw = world.board.switches;
  const bulb = world.bulb;
  const rest = bulb.rest.clone();
  const seat = new THREE.Vector3();
  const swPos = new THREE.Vector3();
  const grip = new THREE.Vector3(0, 0.11, -0.03); // where the hand holds the bulb
  const hold = new THREE.Vector3();
  const target = new THREE.Vector3();
  const bulbPos = new THREE.Vector3();
  const out = { weight: 0, lean: 0, target };

  const inside = () => getStep() >= 1.85; // the shutter is open
  const atCounter = () => getStep() >= 2.8; // the shopkeeper is behind the counter

  function toggleBulb() {
    sound.pick();
    if (st.bulbIn) {
      st.lit = false;
      st.seq = { dir: -1, p: 1 };
    } else {
      st.seq = { dir: 1, p: 0 };
    }
  }

  // A rocker switch works like a real wall switch in India: press the lower
  // half in to switch ON, press the upper half in to switch OFF.
  // On a touch screen the switch is too small for that, so a tap flips it.
  // Returns the new state.
  function press(sw3d, current, point, touch) {
    sound.click();
    if (touch || !point) return !current;
    const upperHalf = sw3d.rocker.worldToLocal(point.clone()).y > 0;
    return !upperHalf;
  }

  const targets = [
    {
      hit: world.outsideSwitch.hit,
      ok: () => getStep() < 2.6,
      click: (pt, touch) => (st.sign = press(world.outsideSwitch, st.sign, pt, touch)),
    },
    { hit: bulb.hit, ok: () => atCounter() && !st.seq, click: toggleBulb },
    {
      hit: sw.bulb.hit,
      ok: inside,
      click: (pt, touch) => {
        const want = press(sw.bulb, st.lit, pt, touch);
        if (!st.bulbIn || st.seq) return; // no bulb in the holder: nothing lights
        if (want && !st.lit) sound.bulbOn();
        st.lit = want;
      },
    },
    {
      hit: world.diwaliSwitch.hit,
      ok: () => getStep() < 2.6,
      click: (pt, touch) => {
        st.diwali = press(world.diwaliSwitch, st.diwali, pt, touch);
        if (st.diwali) sound.sparkle();
      },
    },
    { hit: sw.fan.hit, ok: inside, click: (pt, touch) => (st.fan = press(sw.fan, st.fan, pt, touch)) },
    ...[0, 1, 2].map((i) => ({
      hit: sw['light' + i].hit,
      ok: inside,
      click: (pt, touch) => {
        const want = press(sw['light' + i], st.lights[i], pt, touch);
        if (want && !st.lights[i]) sound.tubeOn();
        st.lights[i] = want;
      },
    })),
    ...pulls.map((p) => ({
      hit: p.hit,
      ok: () => getStep() >= 2.2 && getStep() <= 5.6,
      click: () => {
        p.hold = 1.2;
        sound.slide();
      },
    })),
  ];

  // ---------- Finding what was clicked ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const live = targets.filter((t) => t.ok());
    const hits = ray.intersectObjects(live.map((t) => t.hit), false);
    if (!hits.length) return null;
    return { target: live.find((t) => t.hit === hits[0].object), point: hits[0].point };
  }
  canvas.addEventListener('click', (e) => {
    const hit = pick(e);
    if (hit) hit.target.click(hit.point, e.pointerType === 'touch');
  });
  canvas.addEventListener('pointermove', (e) => {
    canvas.style.cursor = pick(e) ? 'pointer' : '';
  });

  // ---------- Day / night button ----------
  const dayBtn = document.getElementById('dayBtn');
  function showNight() {
    document.documentElement.dataset.night = st.night ? '1' : '0';
    dayBtn.textContent = st.night ? '🌙' : '☀️';
    dayBtn.setAttribute('aria-pressed', String(st.night));
  }
  dayBtn.addEventListener('click', () => {
    st.night = !st.night;
    sound.whoosh(st.night);
    showNight();
  });
  showNight();

  function setRocker(s, on) {
    s.rocker.rotation.x = on ? 0.28 : -0.28; // ON: lower half pressed in
    s.dot.material.emissiveIntensity = on ? 2.5 : 0;
  }

  // Called every frame. Returns where the shopkeeper's left hand should
  // reach (weight 0 means "do not reach").
  function update(dt, t, s) {
    st.nightK = ease(st.nightK, st.night ? 1 : 0, dt, 3);
    st.signK = ease(st.signK, st.sign ? 1 : 0, dt, 8);
    world.setNight(st.nightK);
    world.setSignLights(st.signK, st.nightK);
    st.diwaliK = ease(st.diwaliK, st.diwali ? 1 : 0, dt, 4);
    world.setDiwali(st.diwaliK, st.nightK, t);

    // Pipes sliding out and easing back.
    for (const p of pulls) {
      const goal = p.hold > 0 ? 1 : 0;
      p.hold = Math.max(0, p.hold - dt);
      p.v = ease(p.v, goal, dt, goal > 0 ? 9 : 4);
      p.group.position.z = p.baseZ + p.v * 0.95;
    }

    st.fanK = ease(st.fanK, st.fan ? 1 : 0, dt, 1.5);
    world.fan.rotation.y += dt * 7 * st.fanK;
    world.tableFan.rotation.z += dt * 26 * st.fanK;

    world.tubes.forEach((tube, i) => {
      tube.level = ease(tube.level, st.lights[i] ? 1 : 0, dt, 14);
      tube.mat.emissiveIntensity = 0.04 + 2.16 * tube.level;
      tube.light.intensity = 9 * tube.level;
    });

    setRocker(sw.fan, st.fan);
    setRocker(sw.bulb, st.lit);
    for (let i = 0; i < 3; i++) setRocker(sw['light' + i], st.lights[i]);
    setRocker(world.outsideSwitch, st.sign);
    setRocker(world.diwaliSwitch, st.diwali);

    // ----- The bulb test -----
    world.board.seat.getWorldPosition(seat);
    sw.bulb.rocker.getWorldPosition(swPos);
    out.weight = 0;
    out.lean = 0;
    bulb.bulb.rotation.y = 0;

    // If the visitor scrolls away while the test is running, finish it at once.
    if (st.seq && s < 2.75) st.seq.p = st.seq.dir > 0 ? 1 : 0;

    if (st.seq) {
      const before = st.seq.p;
      st.seq.p += (st.seq.dir * dt) / BULB_TEST_SECONDS;
      const p = clamp01(st.seq.p);
      // Play a sound when the animation passes each moment.
      const passed = (mark) => (before < mark) !== (st.seq.p < mark);
      if (passed(0.25)) sound.pick();
      if (passed(0.63)) sound.twist();
      if (st.seq.dir > 0 && passed(0.86)) {
        sound.click();
        sound.bulbOn();
      }
      let w = 1;
      if (p < 0.25) {
        // Hand goes to the bulb on the counter.
        bulbPos.copy(rest);
        target.copy(rest).add(grip);
        w = smooth(p / 0.25);
      } else if (p < 0.62) {
        // Bulb is carried to the holder.
        const u = smooth((p - 0.25) / 0.37);
        bulbPos.lerpVectors(rest, seat, u);
        bulbPos.y += Math.sin(Math.PI * u) * 0.2;
        target.copy(bulbPos).add(grip);
      } else if (p < 0.72) {
        // Bulb is twisted into the holder.
        bulbPos.copy(seat);
        bulb.bulb.rotation.y = (p - 0.62) * 40;
        target.copy(seat).add(grip);
      } else if (p < 0.86) {
        // Hand moves to the switch.
        bulbPos.copy(seat);
        hold.copy(seat).add(grip);
        target.lerpVectors(hold, swPos, smooth((p - 0.72) / 0.14));
      } else {
        // Switch pressed, hand goes back.
        bulbPos.copy(seat);
        target.copy(swPos);
        w = 1 - smooth((p - 0.86) / 0.14);
      }
      bulb.bulb.position.copy(bulbPos);
      out.weight = w;
      out.lean = w * 0.3;
      if (st.seq.dir > 0 && p >= 0.86) st.lit = true;
      if (st.seq.dir > 0 && p >= 1) {
        st.bulbIn = true;
        st.seq = null;
      } else if (st.seq.dir < 0 && p <= 0) {
        st.bulbIn = false;
        st.seq = null;
      }
    } else {
      bulb.bulb.position.copy(st.bulbIn ? seat : rest);
    }

    st.litK = ease(st.litK, st.lit ? 1 : 0, dt, 10);
    // A soft pulse on the bulb while it waits on the counter says "tap me".
    const invite = !st.bulbIn && !st.seq && atCounter() ? 0.3 + 0.3 * Math.sin(t * 3) : 0;
    bulb.glass.emissiveIntensity = Math.max(st.litK * 2.4, invite);
    bulb.light.intensity = st.litK * 4;
    return out;
  }

  return { update, state: st };
}
