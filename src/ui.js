// The text cards that scroll over the 3D scene, the customer's list, and
// the button that switches between Telugu and English.
import { shop, products } from './shopInfo.js';
import { emblemDataURL } from './textures.js';

const Z = '‌'; // keeps Telugu letters from joining where they should not

// Writes one piece of text in both languages. The page shows only one of
// them, depending on the chosen language (see style.css).
const L = (te, en) => `<span class="l-te">${te}</span><span class="l-en">${en}</span>`;

// One entry per scroll step. "side" is where the card sits on wide screens.
const STEPS = [
  {
    key: 'hero', side: 'left', plain: true,
    eyebrow: [shop.taglineTe, shop.taglineEn],
    title: ['ఇల్లు కట్టాలా? ముందు మా షాపుకి రండి.', 'Building a home? Come to our shop first.'],
    body: [
      'పెయింట్స్, శానిటరీ, హార్డ్' + Z + 'వేర్ — ఇంటికి కావలసినవన్నీ ఒకే చోట.',
      'Paints, sanitary and hardware. Everything your home needs, in one place.',
    ],
    hint: ['కిందికి స్క్రోల్ చేయండి ↓', 'Scroll down ↓'],
  },
  {
    key: 'shutter', side: 'left',
    eyebrow: ['01 · ఉదయం', '01 · Morning'],
    title: ['ప్రతి ఉదయం షట్టర్ తెరుచుకుంటుంది.', 'The shutter goes up every morning.'],
    body: ['మీ పని ఆగకూడదు. అందుకే మేము ముందే సిద్ధంగా ఉంటాం.', 'Your work should not wait. So we are ready early.'],
    tip: ['గోడ మీద ఉన్న ఎర్ర స్విచ్ నొక్కండి. బోర్డు లైట్లు వెలుగుతాయి.', 'Tap the red switch on the wall. The board lights come on.'],
  },
  {
    key: 'welcome', side: 'left',
    eyebrow: ['02 · స్వాగతం', '02 · Welcome'],
    title: ['లోపలికి రండి.', 'Come inside.'],
    body: ['రంగుల నుంచి పైపుల వరకు, అన్నీ ఇక్కడే ఉన్నాయి.', 'From paints to pipes, it is all here.'],
  },
  {
    key: 'paint', side: 'left', items: 'paint',
    eyebrow: ['03 · రంగులు', '03 · Paints'],
    title: ['ప్రతి గోడకు ఒక రంగు.', 'A colour for every wall.'],
    body: ['Asian Paints తో పాటు మంచి బ్రాండ్ల పెయింట్లు.', 'Asian Paints and other good brands.'],
  },
  {
    key: 'pipes', side: 'right', items: 'pipes',
    eyebrow: ['04 · పైపులు', '04 · Pipes'],
    title: ['నీరు సాఫీగా, పైపు గట్టిగా.', 'Smooth water, strong pipes.'],
    body: ['CPVC, SWR, UGD — మూడు రకాల పైపులు స్టాక్' + Z + 'లో.', 'CPVC, SWR and UGD pipes in stock.'],
  },
  {
    key: 'electrical', side: 'right', items: 'electrical',
    eyebrow: ['05 · ఎలక్ట్రికల్స్', '05 · Electricals'],
    title: ['ఒక్క స్విచ్' + Z + 'తో ఇల్లంతా వెలుగు.', 'One switch lights up the home.'],
    body: ['స్విచ్' + Z + 'లు, వైర్లు, స్విచ్ బోర్డులు.', 'Switches, wires and switch boards.'],
  },
  {
    key: 'hardware', side: 'left', items: 'hardware',
    eyebrow: ['06 · హార్డ్' + Z + 'వేర్', '06 · Hardware'],
    title: ['మేకు నుంచి గమేళా వరకు.', 'From a nail to a concrete tub.'],
    body: ['కట్టడం పనికి కావలసిన చిన్న, పెద్ద సామాన్లు.', 'Small and big items for building work.'],
  },
  {
    key: 'list', side: 'left', list: true,
    eyebrow: ['07 · మీ చీటీ', '07 · Your list'],
    title: ['మీ సామాన్ల చీటీ సిద్ధం.', 'Your list is ready.'],
    body: ['ఈ చీటీతో షాపుకి రండి, లేదా మాకు పంపండి.', 'Bring this list to the shop, or send it to us.'],
    tip: [
      'టేబుల్ మీద ఉన్న బల్బును నొక్కండి. అంకుల్ దాన్ని టెస్ట్ చేసి చూపిస్తారు. ఫ్యాన్, లైట్ల స్విచ్' + Z + 'లు కూడా పని చేస్తాయి.',
      'Tap the bulb on the counter. Uncle will test it for you. The fan and light switches work too.',
    ],
  },
  {
    key: 'visit', side: 'left', visit: true,
    eyebrow: ['08 · రండి', '08 · Visit'],
    title: ['రండి, కలుద్దాం.', 'Come, let us meet.'],
    body: [shop.nameTe, 'Parameshwara Enterprises'],
    tip: [
      'టేబుల్ మీద ఉన్న బల్బును నొక్కండి. అంకుల్ దాన్ని టెస్ట్ చేసి చూపిస్తారు. ఫ్యాన్, లైట్ల స్విచ్' + Z + 'లు కూడా పని చేస్తాయి.',
      'Tap the bulb on the counter. Uncle will test it for you. The fan and light switches work too.',
    ],
  },
];

const cart = new Map(); // item id -> quantity
const allItems = Object.values(products).flat();
let lang = 'te';

function itemRows(group) {
  return `<ul class="items">${products[group]
    .map(
      (p) => `
      <li data-id="${p.id}">
        <span class="item-name">${L(p.te, p.en)}</span>
        <span class="stepper">
          <button type="button" data-d="-1" aria-label="less">−</button>
          <output>0</output>
          <button type="button" data-d="1" aria-label="more">+</button>
        </span>
      </li>`
    )
    .join('')}</ul>`;
}

function visitBlock() {
  const row = (label, value) =>
    value[0] || value[1] ? `<div class="info-row"><span>${L(...label)}</span><b>${L(...value)}</b></div>` : '';
  const phone = shop.phoneDisplay ? '+91 ' + shop.phoneDisplay : '';
  let buttons = '';
  if (shop.phone) buttons += `<a class="btn" href="tel:+${shop.phone}">${L('కాల్ చేయండి', 'Call')}</a>`;
  if (shop.mapsUrl) {
    buttons += `<a class="btn ghost" href="${shop.mapsUrl}" target="_blank" rel="noopener">${L('దారి చూడండి', 'Directions')}</a>`;
  }
  return `
    <div class="info">
      ${row(['చిరునామా', 'Address'], [shop.addressTe, shop.addressEn])}
      ${row(['ఫోన్', 'Phone'], [phone, phone])}
      ${row(['యజమాని', 'Proprietor'], [shop.proprietorTe, shop.proprietorEn])}
      ${row(['సమయం', 'Timings'], [shop.timingsTe, shop.timingsEn])}
    </div>
    ${buttons ? `<div class="actions">${buttons}</div>` : ''}`;
}

function listBlock() {
  return `
    <div class="chit">
      <div class="chit-head">${L(shop.nameTe, 'Parameshwara Enterprises')}</div>
      <ul id="chitRows"></ul>
      <p class="chit-note">${L(
        `ధరలు మారుతూ ఉంటాయి. షాపులో లేదా ఫోన్${Z}లో అడగండి.`,
        'Prices change. Please ask at the shop or on the phone.'
      )}</p>
    </div>
    <div class="actions">
      <button class="btn" id="copyList" type="button">${L('చీటీ కాపీ చేయండి', 'Copy list')}</button>
      ${shop.phone ? `<a class="btn ghost" id="waList" target="_blank" rel="noopener">${L('WhatsApp లో పంపండి', 'Send on WhatsApp')}</a>` : ''}
    </div>`;
}

function listText() {
  const lines = allItems.filter((p) => cart.get(p.id)).map((p) => `${cart.get(p.id)} × ${p[lang]}`);
  const head = lang === 'te' ? `${shop.nameTe} — చీటీ` : 'Parameshwara Enterprises — list';
  return `${head}\n${lines.join('\n')}`;
}

function refresh() {
  let total = 0;
  for (const q of cart.values()) total += q;
  document.getElementById('listCount').textContent = total;
  document.querySelectorAll('.items li').forEach((li) => {
    li.querySelector('output').textContent = cart.get(li.dataset.id) || 0;
  });
  const rows = document.getElementById('chitRows');
  const chosen = allItems.filter((p) => cart.get(p.id));
  rows.innerHTML = chosen.length
    ? chosen.map((p) => `<li><b>${cart.get(p.id)} ×</b><span>${L(p.te, p.en)}</span></li>`).join('')
    : `<li class="empty">${L('ఇంకా ఏమీ ఎంచుకోలేదు. పైకి వెళ్లి + నొక్కండి.', 'Nothing chosen yet. Go up and press +.')}</li>`;
  const wa = document.getElementById('waList');
  if (wa) wa.href = `https://wa.me/${shop.phone}?text=${encodeURIComponent(listText())}`;
}

function setLang(next) {
  lang = next === 'en' ? 'en' : 'te';
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  // The button shows the language you can switch to.
  document.getElementById('langBtn').textContent = lang === 'te' ? 'English' : 'తెలుగు';
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* saving the choice is optional */
  }
  refresh();
  // Card sizes change with the language, so the scroll positions are measured again.
  window.dispatchEvent(new Event('relayout'));
}

export function initUI() {
  document.getElementById('brandEmblem').src = emblemDataURL(160);
  document.getElementById('brandName').innerHTML = L(shop.nameTe, 'Parameshwara Enterprises');
  document.getElementById('pillLabel').innerHTML = L('మీ చీటీ', 'My list');
  document.getElementById('bubble').innerHTML = L('రండి రండి! లోపలికి రండి.', 'Come, come! Step inside.');

  const story = document.getElementById('story');
  story.innerHTML = STEPS.map(
    (s) => `
    <section class="step side-${s.side}" data-key="${s.key}" id="${s.key === 'hero' ? 'top' : s.key}">
      <div class="card ${s.plain ? 'plain' : ''}">
        <p class="eyebrow">${L(...s.eyebrow)}</p>
        <${s.plain ? 'h1' : 'h2'}>${L(...s.title)}</${s.plain ? 'h1' : 'h2'}>
        <p class="body">${L(...s.body)}</p>
        ${s.tip ? `<p class="tip">${L(...s.tip)}</p>` : ''}
        ${s.items ? itemRows(s.items) : ''}
        ${s.list ? listBlock() : ''}
        ${s.visit ? visitBlock() : ''}
        ${s.hint ? `<p class="hint">${L(...s.hint)}</p>` : ''}
      </div>
    </section>`
  ).join('');

  story.addEventListener('click', (e) => {
    const b = e.target.closest('.stepper button');
    if (!b) return;
    const id = b.closest('li').dataset.id;
    const q = Math.max(0, Math.min(99, (cart.get(id) || 0) + Number(b.dataset.d)));
    if (q) cart.set(id, q);
    else cart.delete(id);
    refresh();
  });

  const copyBtn = document.getElementById('copyList');
  const copyLabel = copyBtn.innerHTML;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(listText());
      copyBtn.innerHTML = L('కాపీ అయింది ✓', 'Copied ✓');
    } catch {
      copyBtn.innerHTML = L('కాపీ కాలేదు', 'Could not copy');
    }
    setTimeout(() => (copyBtn.innerHTML = copyLabel), 1800);
  });

  document.getElementById('listPill').addEventListener('click', () => {
    document.getElementById('list').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.getElementById('langBtn').addEventListener('click', () => setLang(lang === 'te' ? 'en' : 'te'));

  let saved = 'te';
  try {
    saved = localStorage.getItem('lang') || 'te';
  } catch {
    /* default to Telugu */
  }
  setLang(saved);
  return STEPS.length;
}
