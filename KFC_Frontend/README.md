# Khuhra Fruit Company — Web Shop

Storefront for **Khuhra Fruit Company**, a Sabzi Fruit Commission Agent at Sabzi Mandi, Larkana, Sindh.

Customers browse fruits and vegetables, build a basket, and send the order as a WhatsApp message.
There is no payment gateway: the basket becomes a written order that the customer sends themselves,
which is how a commission agent actually takes an order.

Fully bilingual — **English and Sindhi**, with right-to-left layout, switchable at runtime with no reload.

## Stack

- **Angular 22** — standalone components, zoneless, signals throughout
- **TypeScript 6**, **SCSS**
- **Vitest** for unit tests
- No UI framework; the design system is hand-written in `src/styles/`

## Running it

```bash
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build into dist/
npm test           # unit tests
```

If a build fails with an out-of-memory error, raise the heap:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## The three files an owner edits

| What | File |
|---|---|
| **Prices** | `src/app/core/data/pricing.data.ts` |
| **Phone numbers, address, map** | `src/app/core/business.ts` |
| **Product list, names, seasons** | `src/app/core/data/catalogue.data.ts` |

### ⚠️ Prices are placeholders

`pricing.data.ts` ships with **sample numbers that are not Khuhra Fruit Company's real rates.**
While `PRICES_ARE_PLACEHOLDERS` is `true`, the site shows a banner saying so.

You edit **one number per product** — the pack sizes derive from it, with a maund priced at 38× rather
than 40× for the wholesale margin:

```ts
mango: kgPacks(180),   // ← your rate per kg
```

Once the real rates are in, set `PRICES_ARE_PLACEHOLDERS = false` and the banner disappears.

## Photographs

Every product has a real photograph. They are freely licensed images from Wikimedia Commons
(CC BY, CC BY-SA, GFDL, CC0 and public domain), and the licences that require attribution are
credited in `src/app/core/data/produce-photos.ts`.

They currently load from Wikimedia's CDN. To serve them from your own site instead:

```bash
node scripts/fetch-produce-images.mjs public/produce src/app/core/data/produce-photos.ts
```

That downloads all of them into `public/produce/` and rewrites the paths. To use your own photo for a
product, drop it at `public/produce/<slug>.jpg`, point that product's entry at it, and delete its credit.

## Structure

```
src/app/
  core/
    business.ts          confirmed business facts - the single source for NAP data
    config/              API on/off switch
    data/                catalogue, pricing, hero slides, photo credits
    i18n/                English + Sindhi dictionary and the language service
    models/              shapes mirroring the Web API contract
    services/            catalogue, cart, WhatsApp, SEO
  layout/                header, footer
  pages/                 home, catalogue (fruits + vegetables), about, contact, 404
  shared/                hero slider, product rail, product card, cart drawer, logo
```

## Backend

An ASP.NET Core Web API lives alongside this app (`../KFC`) using Dapper and stored procedures.
The shop reads its items and prices from it (`useApi: true` in `src/app/core/config/app-config.ts`),
the admin area at `/admin` writes to it, and the AI chat widget talks to its `/api/chat` endpoint.

If the API cannot be reached, the shop falls back to the bundled catalogue in `core/data`, so the
public pages still render. Set `useApi: false` to run the site with no backend at all. See the
[root README](../README.md) and [SETUP.md](../SETUP.md) for the full picture.

## Notes

- **Sindhi translations are a working draft.** They are written in the common market register and
  should be reviewed by a native Sindhi speaker before launch.
- The site deliberately makes **no claims about delivery, farm ownership, certifications, opening
  hours or customer reviews**, because none of that has been confirmed by the owner.
