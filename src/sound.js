// All sounds are made in code with the browser's Web Audio system, so the
// site needs no sound files. Browsers only allow sound after the visitor
// taps or clicks once, so unlock() is called on the first tap.

let ctx = null;
let master = null;
let enabled = true;
let noise = null;
const loops = {};

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = enabled ? 0.8 : 0;
  master.connect(ctx.destination);

  // Two seconds of hiss, reused by many sounds.
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  buildLoops();
  return ctx;
}

export function unlock() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume();
}

export function setEnabled(on) {
  enabled = on;
  if (on) unlock();
  if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05);
}
export const isEnabled = () => enabled;

function ready() {
  return ctx && ctx.state === 'running' && enabled;
}

function noiseSource(loop = false) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = loop;
  return src;
}

// A short burst of filtered hiss: the base of clicks, steps and taps.
function burst({ freq, q = 1, type = 'bandpass', gain = 0.5, attack = 0.001, decay = 0.05, when = 0 }) {
  const t = ctx.currentTime + when;
  const src = noiseSource();
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random());
  src.stop(t + attack + decay + 0.05);
}

// A short musical note.
function tone({ freq, to = freq, type = 'sine', gain = 0.2, attack = 0.005, decay = 0.3, when = 0 }) {
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + attack + decay + 0.05);
}

// ---------- One-shot sounds ----------

// Wall switch: a sharp click with a small body.
export function click() {
  if (!ready()) return;
  burst({ freq: 3200, q: 1.2, gain: 0.7, decay: 0.018 });
  burst({ freq: 900, q: 2, gain: 0.5, decay: 0.035, when: 0.004 });
  tone({ freq: 180, to: 90, type: 'triangle', gain: 0.25, decay: 0.05 });
}

// Soft tap for buttons on the page.
export function tap() {
  if (!ready()) return;
  burst({ freq: 2000, q: 1.5, gain: 0.3, decay: 0.02 });
  tone({ freq: 620, to: 520, gain: 0.08, decay: 0.07 });
}

// Tube light starting: two small ticks and a faint buzz.
export function tubeOn() {
  if (!ready()) return;
  burst({ freq: 5200, q: 3, gain: 0.25, decay: 0.012, when: 0.03 });
  burst({ freq: 5200, q: 3, gain: 0.3, decay: 0.012, when: 0.13 });
  tone({ freq: 100, type: 'sawtooth', gain: 0.03, decay: 0.35, when: 0.13 });
}

// Bulb lighting up: a warm little chime.
export function bulbOn() {
  if (!ready()) return;
  tone({ freq: 880, gain: 0.12, decay: 0.5 });
  tone({ freq: 1320, gain: 0.07, decay: 0.7, when: 0.04 });
}

// Bulb being twisted into the holder.
export function twist() {
  if (!ready()) return;
  for (let i = 0; i < 4; i++) burst({ freq: 2600, q: 4, gain: 0.16, decay: 0.02, when: i * 0.07 });
}

// Bulb or item picked up or put down.
export function pick() {
  if (!ready()) return;
  burst({ freq: 700, q: 1, gain: 0.3, decay: 0.05 });
}

// One footstep in chappals.
export function step() {
  if (!ready()) return;
  burst({ freq: 260, q: 0.8, type: 'lowpass', gain: 0.5, decay: 0.07 });
  burst({ freq: 1800, q: 1, gain: 0.12, decay: 0.04, when: 0.03 });
}

// Day to night, or night to day.
export function whoosh(toNight) {
  if (!ready()) return;
  tone({ freq: toNight ? 520 : 260, to: toNight ? 180 : 620, gain: 0.1, attack: 0.05, decay: 0.7 });
}

// Small "ding" when an item is added to the list.
export function ding() {
  if (!ready()) return;
  tone({ freq: 1040, gain: 0.1, decay: 0.25 });
}

// Pipe sliding out of the rack: a soft scrape.
export function slide() {
  if (!ready()) return;
  const t = ctx.currentTime;
  const src = noiseSource();
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(1700, t);
  f.frequency.exponentialRampToValueAtTime(650, t + 0.3);
  f.Q.value = 1.1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random());
  src.stop(t + 0.4);
}

// Diwali lights coming on: a little rising sparkle.
export function sparkle() {
  if (!ready()) return;
  [1200, 1500, 1900, 2400].forEach((fr, i) => tone({ freq: fr, gain: 0.06, decay: 0.22, when: i * 0.05 }));
}

// ---------- Sounds that keep running ----------

function buildLoops() {
  // Fan: low hum plus moving air.
  {
    const out = ctx.createGain();
    out.gain.value = 0;
    const air = noiseSource(true);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.5;
    const wobble = ctx.createOscillator();
    wobble.frequency.value = 7;
    const wobbleDepth = ctx.createGain();
    wobbleDepth.gain.value = 0.18;
    wobble.connect(wobbleDepth).connect(airGain.gain);
    air.connect(lp).connect(airGain).connect(out);
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 96;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.12;
    hum.connect(humGain).connect(out);
    out.connect(master);
    air.start();
    wobble.start();
    hum.start();
    loops.fan = out;
  }
  // Shutter: metal rattle.
  {
    const out = ctx.createGain();
    out.gain.value = 0;
    const src = noiseSource(true);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100;
    bp.Q.value = 0.9;
    const chop = ctx.createGain();
    chop.gain.value = 0.55;
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 23;
    const depth = ctx.createGain();
    depth.gain.value = 0.45;
    lfo.connect(depth).connect(chop.gain);
    src.connect(bp).connect(chop).connect(out);
    const rumble = noiseSource(true);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    const rg = ctx.createGain();
    rg.gain.value = 0.9;
    rumble.connect(lp).connect(rg).connect(out);
    out.connect(master);
    src.start();
    rumble.start(0, 0.7);
    lfo.start();
    loops.shutter = out;
  }
  // Crickets at night.
  {
    const out = ctx.createGain();
    out.gain.value = 0;
    for (const [freq, rate, slow] of [[4300, 38, 0.9], [4750, 44, 0.6]]) {
      const o = ctx.createOscillator();
      o.frequency.value = freq;
      const trill = ctx.createGain();
      trill.gain.value = 0;
      const fast = ctx.createOscillator();
      fast.type = 'square';
      fast.frequency.value = rate;
      const fastDepth = ctx.createGain();
      fastDepth.gain.value = 0.5;
      fast.connect(fastDepth).connect(trill.gain);
      const phrase = ctx.createGain();
      phrase.gain.value = 0.5;
      const slowOsc = ctx.createOscillator();
      slowOsc.type = 'square';
      slowOsc.frequency.value = slow;
      const slowDepth = ctx.createGain();
      slowDepth.gain.value = 0.5;
      slowOsc.connect(slowDepth).connect(phrase.gain);
      o.connect(trill).connect(phrase).connect(out);
      o.start();
      fast.start();
      slowOsc.start();
    }
    out.connect(master);
    loops.crickets = out;
  }
}

function setLoop(name, level) {
  if (!ctx || !loops[name]) return;
  loops[name].gain.setTargetAtTime(level, ctx.currentTime, 0.08);
}

// Called every frame with levels from 0 to 1.
export function ambience({ fan = 0, shutter = 0, crickets = 0 }) {
  setLoop('fan', fan * 0.22);
  setLoop('shutter', shutter * 0.5);
  setLoop('crickets', crickets * 0.05);
}
