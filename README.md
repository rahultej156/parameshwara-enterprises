# Parameshwara Enterprises — Paint, Sanitary & Hardware

A scroll-driven 3D website for Parameshwara Enterprises, a paint, sanitary and
hardware shop in Subedari, Hanmakonda, Telangana. As you scroll, a camera moves
through the street, the shop front and the shop inside; the shopkeeper opens the
shutter and shows the products. Text is in Telugu and English.

Built with [Vite](https://vitejs.dev/) and [Three.js](https://threejs.org/).
Everything in the 3D scene — the shop, the products and the shopkeeper — is
drawn in code, so the site stays small and needs no image or model files.

## Run it on your computer

```bash
npm install
npm run dev
```

Then open the address it prints (http://localhost:5180).

## Build for the web

```bash
npm run build
```

The finished site is written to the `dist` folder.

## Deploy on Vercel

Vercel detects Vite automatically. If you ever need to set it by hand:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

## Editing the shop details

All the shop's text — name, address, phone, tagline and the product list — is in
one file: [`src/shopInfo.js`](src/shopInfo.js).
