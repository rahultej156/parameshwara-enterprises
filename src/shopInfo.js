// ---------------------------------------------------------------
// Shop details. Edit this file to change text on the website.
// "Te" means Telugu text, "En" means English text.
// Leave a value as '' (empty) if you do not want to show it.
// ---------------------------------------------------------------

const addressEn = 'Near Telangana Junction, Ideal School Line, Subedari, Hanmakonda – 506001';

export const shop = {
  nameTe: 'పరమేశ్వర ఎంటర్‌ప్రైజెస్',
  nameEn: 'PARAMESHWARA ENTERPRISES',
  taglineTe: 'పెయింట్స్ • శానిటరీ • హార్డ్‌వేర్',
  taglineEn: 'PAINT • SANITARY • HARDWARE',

  proprietorTe: 'మోర రాజ్‌కుమార్',
  proprietorEn: 'Mora Rajkumar',

  phone: '919494841910', // with country code 91, used for the Call and WhatsApp buttons
  phoneDisplay: '94948 41910', // how the number is shown on screen and on the signboard

  addressTe: 'తెలంగాణ జంక్షన్ దగ్గర, ఐడియల్ స్కూల్ లైన్, సుబేదారి, హనుమకొండ – 506001',
  addressEn,
  areaEn: 'Subedari, Hanmakonda', // short form, painted on the signboard

  timingsTe: '', // for example 'ఉదయం 8 నుంచి రాత్రి 9 వరకు'
  timingsEn: '', // for example '8 am to 9 pm'

  // Opens Google Maps and searches for the address. Replace it with the
  // shop's own Google Maps link for an exact pin.
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Parameshwara Enterprises, ' + addressEn),
};

// Items a customer can add to their list ("చీటీ").
// These are sample items. Change names to match the real shop.
export const products = {
  paint: [
    { id: 'paint-1l', te: 'పెయింట్ — 1 లీటర్ డబ్బా', en: 'Paint, 1 litre tin' },
    { id: 'paint-4l', te: 'పెయింట్ — 4 లీటర్ల డబ్బా', en: 'Paint, 4 litre tin' },
    { id: 'paint-20l', te: 'పెయింట్ — 20 లీటర్ల బకెట్', en: 'Paint, 20 litre bucket' },
  ],
  pipes: [
    { id: 'cpvc', te: 'CPVC పైపు', en: 'CPVC pipe (hot and cold water)' },
    { id: 'swr', te: 'SWR పైపు', en: 'SWR pipe (waste water)' },
    { id: 'ugd', te: 'UGD పైపు', en: 'UGD pipe (underground drainage)' },
  ],
  electrical: [
    { id: 'switch', te: 'ఎలక్ట్రిక్ స్విచ్‌లు', en: 'Electric switches' },
    { id: 'wire', te: 'వైర్ కాయిల్', en: 'Electric wire coil' },
    { id: 'board', te: 'స్విచ్ బోర్డు', en: 'Switch board' },
  ],
  hardware: [
    { id: 'nails', te: 'మేకులు (కిలో)', en: 'Nails, per kg' },
    { id: 'gamela', te: 'కాంక్రీట్ గమేళా', en: 'Concrete tub (gamela)' },
  ],
};
