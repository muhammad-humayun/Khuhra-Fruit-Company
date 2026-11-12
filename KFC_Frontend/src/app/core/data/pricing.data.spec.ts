import { describe, expect, it } from 'vitest';
import { packsFor, packsForProduct } from './pricing.data';

/**
 * These cover the one calculation that decides what a customer is charged.
 *
 * The admin screen stores a single price per item; everything a shopper sees is derived from it
 * here. A mistake in this function would quietly overcharge or undercharge on every order, which is
 * exactly the sort of fault no one notices by looking at the screen.
 */
describe('packsForProduct', () => {
  it('builds the kilo ladder from the admin price', () => {
    const packs = packsForProduct({ slug: 'anything', basePrice: 200, packType: 'kg' });

    expect(packs.map((p) => p.label)).toEqual(['1 kg', '5 kg', '40 kg (maund)']);
    // The single kilo is exactly what was typed in - never rounded.
    expect(packs[0].price).toBe(200);
    expect(packs[1].price).toBe(1000);
    // A maund is priced at 38x, not 40x, because it carries a wholesale margin.
    expect(packs[2].price).toBe(7600);
  });

  it('divides down for small quantities', () => {
    const packs = packsForProduct({ slug: 'garlic', basePrice: 400, packType: 'small' });

    expect(packs.map((p) => p.label)).toEqual(['250 g', '500 g', '1 kg']);
    expect(packs[0].price).toBe(100);
    expect(packs[1].price).toBe(200);
    expect(packs[2].price).toBe(400);
  });

  it('treats the price as a dozen price for dozen items', () => {
    const packs = packsForProduct({ slug: 'banana', basePrice: 150, packType: 'dozen' });

    expect(packs.map((p) => p.label)).toEqual(['1 dozen', '2 dozen']);
    expect(packs[0].price).toBe(150);
    expect(packs[1].price).toBe(300);
  });

  it('treats the price as a per-piece price for piece items', () => {
    const packs = packsForProduct({ slug: 'watermelon', basePrice: 350, packType: 'piece' });

    expect(packs[0].price).toBe(350);
    expect(packs.length).toBe(2);
  });

  it('offers a single pack when there is no pack ladder', () => {
    const packs = packsForProduct({ slug: 'mixed-crate', basePrice: 2500, packType: 'none' });

    expect(packs.length).toBe(1);
    expect(packs[0].price).toBe(2500);
  });

  it('defaults to the kilo ladder when the pack type is missing', () => {
    const packs = packsForProduct({ slug: 'mystery', basePrice: 100 });

    expect(packs.map((p) => p.label)).toEqual(['1 kg', '5 kg', '40 kg (maund)']);
  });

  /**
   * The important half. An item with no price must fall through to "rate on request" rather than
   * being advertised at zero - which is what a naive `price ?? 0` would do.
   */
  it('falls back to the bundled table when the admin has set no price', () => {
    const fromApi = packsForProduct({ slug: 'mango', basePrice: null, packType: 'kg' });

    expect(fromApi).toEqual(packsFor('mango'));
  });

  it('returns nothing to price for an unpriced item that is not in the bundled table', () => {
    expect(packsForProduct({ slug: 'brand-new-item', basePrice: null, packType: 'kg' })).toEqual([]);
    expect(packsForProduct({ slug: 'brand-new-item', packType: 'kg' })).toEqual([]);
  });

  it('never advertises a zero or negative price', () => {
    // A zero slipping through as a real price would show "PKR 0" on the shop and let it be ordered.
    expect(packsForProduct({ slug: 'brand-new-item', basePrice: 0, packType: 'kg' })).toEqual([]);
    expect(packsForProduct({ slug: 'brand-new-item', basePrice: -5, packType: 'kg' })).toEqual([]);
  });

  it('prefers the admin price over the bundled one for a product in both', () => {
    const bundled = packsFor('mango')[0].price;
    const live = packsForProduct({ slug: 'mango', basePrice: bundled + 70, packType: 'kg' })[0].price;

    expect(live).toBe(bundled + 70);
  });
});
