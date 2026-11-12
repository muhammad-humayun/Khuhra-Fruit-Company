/**
 * Shop prices.
 *
 * ===========================================================================
 *  THE NUMBERS BELOW ARE PLACEHOLDERS. THEY ARE NOT REAL KHUHRA FRUIT COMPANY
 *  RATES AND THEY ARE NOT GOVERNMENT-NOTIFIED RATES.
 *
 *  They exist so the shop works end to end before your real rates are entered.
 *  While `PRICES_ARE_PLACEHOLDERS` is true the site shows a banner saying the
 *  prices are samples. Replace the numbers below with your own rates, then set
 *  the flag to false and the banner disappears.
 * ===========================================================================
 *
 * You only ever edit one number per product: the price for the smallest pack. The larger packs are
 * derived from it, with the maund priced at 38x rather than 40x because a full maund normally
 * carries a wholesale margin. Change `packsFor` if your pricing works differently.
 */

import { PackType } from '../models/catalogue.model';

export const PRICES_ARE_PLACEHOLDERS = true;

export interface Pack {
  readonly label: string;
  readonly labelSd: string;
  readonly price: number;
  /** Used to sort and to pick the default pack. */
  readonly order: number;
}

const round = (n: number) => Math.round(n / 5) * 5;

/** Weight packs: single kilo, a 5 kg lot, and a full maund at a wholesale rate. */
function kgPacks(perKg: number): Pack[] {
  return [
    { label: '1 kg', labelSd: '1 ڪلو', price: perKg, order: 1 },
    { label: '5 kg', labelSd: '5 ڪلو', price: round(perKg * 5), order: 2 },
    { label: '40 kg (maund)', labelSd: '40 ڪلو (مڻ)', price: round(perKg * 38), order: 3 },
  ];
}

/** Small-quantity packs for the aromatics and anything sold in grams. */
function smallPacks(perKg: number): Pack[] {
  return [
    { label: '250 g', labelSd: '250 گرام', price: round(perKg / 4), order: 1 },
    { label: '500 g', labelSd: '500 گرام', price: round(perKg / 2), order: 2 },
    { label: '1 kg', labelSd: '1 ڪلو', price: perKg, order: 3 },
  ];
}

function dozenPacks(perDozen: number): Pack[] {
  return [
    { label: '1 dozen', labelSd: '1 درجن', price: perDozen, order: 1 },
    { label: '2 dozen', labelSd: '2 درجن', price: round(perDozen * 2), order: 2 },
  ];
}

function piecePacks(perPiece: number): Pack[] {
  return [
    { label: '1 piece', labelSd: '1 داڻو', price: perPiece, order: 1 },
    { label: '3 pieces', labelSd: '3 داڻا', price: round(perPiece * 2.9), order: 2 },
  ];
}

/**
 * Product slug to its packs. A product with no entry here shows "Rate on request" with a WhatsApp
 * button instead of a price, which is the right answer for anything whose rate moves daily.
 */
export const PRICING: Record<string, readonly Pack[]> = {
  // Fruits
  mango: kgPacks(180),
  watermelon: piecePacks(350),
  melon: kgPacks(120),
  falsa: kgPacks(300),
  jamun: kgPacks(260),
  apple: kgPacks(220),
  pear: kgPacks(240),
  pomegranate: kgPacks(360),
  grapes: kgPacks(320),
  peach: kgPacks(260),
  plum: kgPacks(300),
  apricot: kgPacks(340),
  cherry: kgPacks(900),
  orange: kgPacks(140),
  'sweet-lime': kgPacks(120),
  banana: dozenPacks(150),
  guava: kgPacks(150),
  papaya: kgPacks(130),
  chikoo: kgPacks(200),
  dates: smallPacks(450),

  // Vegetables
  potato: kgPacks(60),
  onion: kgPacks(80),
  tomato: kgPacks(90),
  'green-chilli': smallPacks(160),
  garlic: smallPacks(400),
  ginger: smallPacks(420),
  lemon: smallPacks(180),
  cucumber: kgPacks(70),
  'bitter-gourd': kgPacks(120),
  'ridge-gourd': kgPacks(90),
  'bottle-gourd': kgPacks(70),
  tinda: kgPacks(110),
  pumpkin: kgPacks(60),
  spinach: kgPacks(50),
  cabbage: kgPacks(60),
  cauliflower: kgPacks(90),
  okra: kgPacks(140),
  peas: kgPacks(180),
  beans: kgPacks(160),
  carrot: kgPacks(80),
  eggplant: kgPacks(70),

  // Deliberately absent, because "whatever is arriving this week" has no fixed price:
  // 'other-seasonal-fruit', 'other-seasonal-vegetables'
};

export function packsFor(slug: string): readonly Pack[] {
  return PRICING[slug] ?? [];
}

/**
 * The packs a card should show.
 *
 * The admin screen sets one price and one pack type per item, and this turns that pair into the
 * ladder of packs a shopper picks from - so changing a price in the admin screen changes every pack
 * on the shop immediately, with no code change and nothing to republish.
 *
 * A product with no price falls back to the bundled table, and if that has nothing either the card
 * shows "rate on request" with a WhatsApp button. That is why a brand new item is still usable the
 * moment it is added, before any price is typed in.
 */
export function packsForProduct(product: {
  slug: string;
  basePrice?: number | null;
  packType?: PackType;
}): readonly Pack[] {
  const price = product.basePrice;

  if (typeof price === 'number' && price > 0) {
    switch (product.packType) {
      case 'small':
        return smallPacks(price);
      case 'dozen':
        return dozenPacks(price);
      case 'piece':
        return piecePacks(price);
      case 'none':
        // Priced, but sold however it arrives - one price, no pack ladder.
        return [{ label: 'per lot', labelSd: 'في لاٽ', price, order: 1 }];
      case 'kg':
      default:
        return kgPacks(price);
    }
  }

  return packsFor(product.slug);
}
