/**
 * Catalogue shapes, mirroring the API contract (BOL_Product, BOL_Category) so that switching the
 * data source from the bundled catalogue to the Web API needs no component changes.
 */

export type ProductKind = 'fruit' | 'vegetable';

/** Unit a product is normally quoted in. Pack labels and prices live in `pricing.data.ts`. */
export type UnitCode = 'KG' | '40KG' | 'DOZEN' | 'PIECE' | 'UNKNOWN';

/**
 * How a product is sold, which decides the pack sizes the card offers.
 * Set by the admin screen; mirrors the PackType column in the database.
 */
export type PackType = 'kg' | 'small' | 'dozen' | 'piece' | 'none';

export interface Category {
  readonly id: number;
  readonly kind: ProductKind;
  readonly slug: string;
  readonly nameEn: string;
  readonly nameSd: string;
  readonly sortOrder: number;
  productCount?: number;
}

export interface Product {
  readonly id: number;
  readonly kind: ProductKind;
  readonly categorySlug: string;
  readonly slug: string;
  readonly nameEn: string;
  readonly nameSd: string;
  /** Transliterated local name, e.g. "Aam", "Khajoor". */
  readonly localName?: string;
  readonly descriptionEn: string;
  readonly descriptionSd: string;
  /** Product photograph. Falls back to a lettered tile when absent. */
  readonly imageUrl?: string;
  /** Legacy key for the retired illustration set; kept so catalogue data stays valid. */
  readonly artKey: string;
  /** Month numbers for the typical market season. Empty means available year round. */
  readonly seasonMonths: readonly number[];
  /** True only when the owner has confirmed the business deals in this product. */
  readonly isConfirmedByBusiness: boolean;
  /** Only rendered when `isOriginVerified` is true. */
  readonly originRegion?: string;
  readonly isOriginVerified: boolean;
  readonly defaultUnit: UnitCode;
  readonly sortOrder: number;

  /**
   * The one price the admin edits, for the smallest pack. Null or absent means "rate on request",
   * which is the honest answer for anything whose rate moves daily.
   *
   * When the shop is reading the API these two fields decide what the card shows. Without them it
   * falls back to the bundled table in `pricing.data.ts`.
   */
  readonly basePrice?: number | null;
  readonly packType?: PackType;
}

/** Filters applied to a catalogue listing. */
export interface ProductQuery {
  kind?: ProductKind;
  categorySlug?: string;
  search?: string;
  inSeasonOnly?: boolean;
}
