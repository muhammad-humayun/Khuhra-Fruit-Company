/**
 * Prints the bundled catalogue as JSON so it can be migrated into SQL Server.
 *
 * Run:  npx tsx scripts/export-catalogue.ts > catalogue.json
 *
 * This exists so the 43 products, their Sindhi names, seasons, photos and prices move into the
 * database exactly as they are, rather than being retyped by hand.
 */
import { CATEGORIES, PRODUCTS } from '../src/app/core/data/catalogue.data';
import { PRICING } from '../src/app/core/data/pricing.data';
import { PRODUCE_PHOTOS } from '../src/app/core/data/produce-photos';

/**
 * The shop sells each product in a set of pack sizes derived from one base price. The admin only
 * ever edits that base price, so the database stores the base price plus which pack set to use.
 */
function packTypeFor(slug: string): 'kg' | 'small' | 'dozen' | 'piece' | 'none' {
  const packs = PRICING[slug];
  if (!packs || packs.length === 0) {
    return 'none';
  }

  const first = packs[0].label;
  if (first === '250 g') return 'small';
  if (first === '1 dozen') return 'dozen';
  if (first === '1 piece') return 'piece';
  return 'kg';
}

/** The smallest pack's price is the number the admin edits. */
function basePriceFor(slug: string): number | null {
  const packs = PRICING[slug];
  if (!packs || packs.length === 0) {
    return null;
  }

  if (packTypeFor(slug) === 'small') {
    // Small packs are quoted per kilo, with 250g as a quarter of it.
    return packs[packs.length - 1].price;
  }

  return packs[0].price;
}

const out = {
  categories: CATEGORIES.map((c) => ({
    kind: c.kind,
    slug: c.slug,
    nameEn: c.nameEn,
    nameSd: c.nameSd,
    sortOrder: c.sortOrder,
  })),
  products: PRODUCTS.map((p) => ({
    categorySlug: p.categorySlug,
    kind: p.kind,
    slug: p.slug,
    nameEn: p.nameEn,
    nameSd: p.nameSd,
    localName: p.localName ?? null,
    descriptionEn: p.descriptionEn,
    descriptionSd: p.descriptionSd,
    imageUrl: p.imageUrl ?? PRODUCE_PHOTOS[p.slug] ?? null,
    seasonMonths: p.seasonMonths.join(','),
    basePrice: basePriceFor(p.slug),
    packType: packTypeFor(p.slug),
    sortOrder: p.sortOrder,
  })),
};

console.log(JSON.stringify(out, null, 2));
