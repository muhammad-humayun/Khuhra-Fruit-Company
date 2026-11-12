/**
 * Pulls one freely-licensed photograph per catalogue product from Wikimedia Commons,
 * saves it into the Angular app's public/produce folder, and writes a TS map with the
 * attribution each licence requires.
 *
 * Run:  node fetch-produce-images.mjs <outDirForImages> <outTsFile>
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'KhuhraFruitCompanySiteBuild/1.0 (catalogue image sourcing; contact: site owner)';

const TERMS = [
  ['mango', 'Mangifera indica fruit mango'],
  ['watermelon', 'Watermelon Citrullus lanatus fruit'],
  ['melon', 'Muskmelon Cucumis melo fruit'],
  ['falsa', 'Grewia asiatica falsa fruit'],
  ['jamun', 'Syzygium cumini jamun fruit'],
  ['apple', 'Apple red fruit'],
  ['pear', 'Pear Pyrus fruit'],
  ['pomegranate', 'Pomegranate Punica granatum fruit'],
  ['grapes', 'Grapes bunch Vitis vinifera'],
  ['peach', 'Peach Prunus persica fruit'],
  ['plum', 'Plum Prunus domestica fruit'],
  ['apricot', 'Apricot Prunus armeniaca fruit'],
  ['cherry', 'Cherries Prunus avium fruit'],
  ['orange', 'Orange citrus sinensis fruit'],
  ['sweet-lime', 'Citrus limetta sweet lime mosambi'],
  ['banana', 'Banana bunch Musa fruit'],
  ['guava', 'Guava Psidium guajava fruit'],
  ['papaya', 'Papaya Carica papaya fruit'],
  ['chikoo', 'Manilkara zapota sapodilla chikoo fruit'],
  ['dates', 'Dates Phoenix dactylifera fruit'],
  ['other-seasonal-fruit', 'Fruit market stall basket'],
  ['potato', 'Potatoes Solanum tuberosum tubers'],
  ['onion', 'Onions Allium cepa bulbs'],
  ['tomato', 'Tomatoes Solanum lycopersicum'],
  ['green-chilli', 'Green chili peppers Capsicum'],
  ['garlic', 'Garlic Allium sativum bulbs'],
  ['ginger', 'Ginger Zingiber officinale rhizome'],
  ['lemon', 'Lemons Citrus limon fruit'],
  ['cucumber', 'Cucumber Cucumis sativus'],
  ['bitter-gourd', 'Momordica charantia bitter gourd'],
  ['ridge-gourd', 'Luffa acutangula ridge gourd'],
  ['bottle-gourd', 'Lagenaria siceraria bottle gourd'],
  ['tinda', 'Praecitrullus fistulosus tinda apple gourd'],
  ['pumpkin', 'Pumpkin Cucurbita'],
  ['spinach', 'Spinach Spinacia oleracea leaves'],
  ['cabbage', 'Cabbage Brassica oleracea head'],
  ['cauliflower', 'Cauliflower Brassica oleracea botrytis'],
  ['okra', 'Okra Abelmoschus esculentus pods'],
  ['peas', 'Green peas Pisum sativum pods'],
  ['beans', 'Green beans Phaseolus vulgaris'],
  ['carrot', 'Carrots Daucus carota'],
  ['eggplant', 'Eggplant aubergine Solanum melongena'],
  ['other-seasonal-vegetables', 'Vegetable market stall produce'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** Prefer a real photo: bitmap, landscape-ish, decent size, filename echoing the subject. */
function score(page, slug) {
  const info = page.imageinfo?.[0];
  if (!info) return -1;
  const title = (page.title || '').toLowerCase();
  const w = info.width ?? 0;
  const h = info.height ?? 0;
  if (!w || !h) return -1;
  if (!/\.(jpe?g|png)$/i.test(title)) return -1;

  let s = 0;
  const head = slug.split('-')[0];
  if (title.includes(head)) s += 40;
  const ratio = w / h;
  if (ratio >= 1.1 && ratio <= 2.2) s += 25;
  else if (ratio >= 0.85) s += 10;
  if (w >= 1200) s += 15;
  else if (w >= 800) s += 8;
  // Drawings, diagrams, maps, stamps and logos are not what a shop card wants.
  if (/(map|diagram|chart|logo|stamp|coat of arms|illustration|drawing|botanical|plate|icon|svg)/.test(title)) s -= 60;
  if (/(flower|leaf only|tree|plantation|field|seedling)/.test(title)) s -= 12;
  return s;
}

async function pick(slug, term) {
  const data = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: '6',
    gsrlimit: '18',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '900',
  });

  const pages = Object.values(data?.query?.pages ?? {});
  if (!pages.length) return null;

  const ranked = pages
    .map((p) => ({ p, s: score(p, slug) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (!ranked.length) return null;

  const best = ranked[0].p;
  const info = best.imageinfo[0];
  const meta = info.extmetadata ?? {};
  const strip = (v) => (v ? String(v).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '');

  return {
    slug,
    title: best.title,
    thumb: info.thumburl ?? info.url,
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height,
    artist: strip(meta.Artist?.value) || 'Wikimedia Commons contributor',
    license: strip(meta.LicenseShortName?.value) || 'See source',
    descriptionUrl: info.descriptionurl,
    candidates: ranked.slice(0, 3).map((x) => x.p.title),
  };
}

const [, , imgDir, tsOut] = process.argv;
await mkdir(imgDir, { recursive: true });

const results = [];
for (const [slug, term] of TERMS) {
  try {
    const hit = await pick(slug, term);
    if (!hit) {
      console.log(`MISS  ${slug}`);
      results.push({ slug, failed: true });
      continue;
    }

    const res = await fetch(hit.thumb, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(join(imgDir, `${slug}.jpg`), buf);

    hit.bytes = buf.length;
    results.push(hit);
    console.log(`OK    ${slug.padEnd(28)} ${(buf.length / 1024).toFixed(0).padStart(5)}KB  ${hit.title}`);
  } catch (err) {
    console.log(`FAIL  ${slug}: ${err.message}`);
    results.push({ slug, failed: true });
  }
  await sleep(220);
}

const ok = results.filter((r) => !r.failed);

const ts = `/**
 * Photograph credits.
 *
 * Every image in \`public/produce\` came from Wikimedia Commons under a free licence. The licences
 * require attribution, which is why this file exists and why the credits page renders it. If you
 * replace a photo with your own, delete its entry here too.
 *
 * Generated by scripts/fetch-produce-images.mjs - re-run it rather than editing by hand.
 */

export interface PhotoCredit {
  readonly slug: string;
  readonly file: string;
  readonly artist: string;
  readonly license: string;
  readonly sourceUrl: string;
}

export const PHOTO_CREDITS: readonly PhotoCredit[] = [
${ok
  .map(
    (r) =>
      `  { slug: '${r.slug}', file: '${r.slug}.jpg', artist: ${JSON.stringify(r.artist)}, license: ${JSON.stringify(
        r.license,
      )}, sourceUrl: ${JSON.stringify(r.descriptionUrl)} },`,
  )
  .join('\n')}
];

/** Slug -> served image path. */
export const PRODUCE_PHOTOS: Record<string, string> = {
${ok.map((r) => `  '${r.slug}': 'produce/${r.slug}.jpg',`).join('\n')}
};
`;

await writeFile(tsOut, ts, 'utf8');
console.log(`\n${ok.length}/${TERMS.length} images saved. Credits written to ${tsOut}`);
