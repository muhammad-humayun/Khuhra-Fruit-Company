import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { CATEGORIES, PRODUCTS } from '../data/catalogue.data';
import { photoFor } from '../data/produce-photos';
import { Category, PackType, Product, ProductKind, ProductQuery } from '../models/catalogue.model';
import { marketMonth } from '../util/market-time';

/** The API envelope every controller returns (BOL_ApiResponse&lt;T&gt;). */
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * What `/api/products` actually sends. It is deliberately narrower than the client `Product`: the
 * API knows nothing about the retired illustration set or the origin-verification flags, so those
 * are filled in by `fromApiProduct` rather than pretended to arrive.
 */
interface ApiProduct {
  id: number;
  kind: ProductKind;
  slug: string;
  categorySlug: string;
  nameEn: string;
  nameSd: string;
  localName: string | null;
  descriptionEn: string | null;
  descriptionSd: string | null;
  imageUrl: string | null;
  /** Comma separated month numbers, or empty for year round. */
  seasonMonths: string | null;
  basePrice: number | null;
  packType: PackType;
  isActive: boolean;
  sortOrder: number;
}

/**
 * The single place product and category data is read from.
 *
 * Components never hold catalogue arrays of their own; they ask this service and filter through
 * `query`.
 */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly http = inject(HttpClient);

  private readonly rawProducts = signal<readonly Product[]>(APP_CONFIG.useApi ? [] : PRODUCTS);
  private readonly rawCategories = signal<readonly Category[]>(APP_CONFIG.useApi ? [] : CATEGORIES);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Products with their photograph attached. */
  readonly products = computed<Product[]>(() =>
    this.rawProducts().map((product) => ({
      ...product,
      // An owner-supplied photo on the product always wins over the bundled one.
      imageUrl: product.imageUrl ?? photoFor(product.slug),
    })),
  );

  /**
   * Both follow the curated `sortOrder` rather than the order they happen to sit in the data file,
   * which is what puts amrood at the front of the fruit list.
   */
  readonly fruits = computed(() => bySortOrder(this.products().filter((p) => p.kind === 'fruit')));

  readonly vegetables = computed(() =>
    bySortOrder(this.products().filter((p) => p.kind === 'vegetable')),
  );

  /** Categories with a live product count, for the filter rail. */
  readonly categories = computed<Category[]>(() => {
    const products = this.products();

    return this.rawCategories()
      .map((category) => ({
        ...category,
        productCount: products.filter((p) => p.categorySlug === category.slug).length,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  });

  constructor() {
    if (APP_CONFIG.useApi) {
      this.loadFromApi();
    }
  }

  /**
   * Re-reads the catalogue from the API.
   *
   * Called by the setup screen after a save, so an edit shows up on the shop straight away instead
   * of waiting for the next full page load.
   */
  reload(): void {
    if (APP_CONFIG.useApi) {
      this.loadFromApi();
    }
  }

  categoriesFor(kind: ProductKind): Category[] {
    return this.categories().filter((c) => c.kind === kind);
  }

  /** Applies the catalogue filters. Sorting is by the curated order, not alphabetical. */
  query(query: ProductQuery): Product[] {
    const month = marketMonth();
    const search = query.search?.trim().toLowerCase() ?? '';

    return this.products()
      .filter((product) => {
        if (query.kind && product.kind !== query.kind) {
          return false;
        }
        if (query.categorySlug && product.categorySlug !== query.categorySlug) {
          return false;
        }
        if (query.inSeasonOnly && !isInSeason(product, month)) {
          return false;
        }
        if (search && !matchesSearch(product, search)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  bySlug(slug: string): Product | undefined {
    return this.products().find((p) => p.slug === slug);
  }

  /** Products whose typical season covers the current month. */
  inSeasonNow(kind?: ProductKind): Product[] {
    const month = marketMonth();

    return this.products()
      .filter((p) => (!kind || p.kind === kind) && p.seasonMonths.length > 0 && isInSeason(p, month))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private loadFromApi(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<ApiProduct[]>>(`${APP_CONFIG.apiBaseUrl}/api/products`).subscribe({
      next: (response) => {
        this.rawProducts.set((response.data ?? []).map(fromApiProduct));
        this.loading.set(false);
      },
      error: () => {
        // Fall back to the bundled catalogue so the shop still renders if the API is down.
        this.rawProducts.set(PRODUCTS);
        this.error.set('Could not reach the catalogue service. Showing the bundled catalogue.');
        this.loading.set(false);
      },
    });

    this.http.get<ApiResponse<Category[]>>(`${APP_CONFIG.apiBaseUrl}/api/categories`).subscribe({
      next: (response) => this.rawCategories.set(response.data ?? []),
      error: () => this.rawCategories.set(CATEGORIES),
    });
  }
}

/** Empty `seasonMonths` means year round, which matches the bundled catalogue convention. */
function fromApiProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    kind: product.kind,
    categorySlug: product.categorySlug,
    slug: product.slug,
    nameEn: product.nameEn,
    nameSd: product.nameSd,
    localName: product.localName ?? undefined,
    descriptionEn: product.descriptionEn ?? '',
    descriptionSd: product.descriptionSd ?? '',
    imageUrl: product.imageUrl ?? undefined,
    seasonMonths: parseMonths(product.seasonMonths),
    basePrice: product.basePrice,
    packType: product.packType,
    sortOrder: product.sortOrder,

    // Fields the API does not carry. The illustration set was retired, and the origin badge is only
    // ever shown for data the owner has verified by hand - which an API row has not been.
    artKey: product.slug,
    isConfirmedByBusiness: true,
    isOriginVerified: false,
    defaultUnit: unitFor(product.packType),
  };
}

function parseMonths(raw: string | null): number[] {
  return (raw ?? '')
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);
}

function unitFor(packType: PackType | undefined): Product['defaultUnit'] {
  switch (packType) {
    case 'dozen':
      return 'DOZEN';
    case 'piece':
      return 'PIECE';
    case 'small':
    case 'kg':
      return 'KG';
    default:
      return 'UNKNOWN';
  }
}

function bySortOrder(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** An empty season list means the product is traded year round. */
export function isInSeason(product: Product, month: number): boolean {
  return product.seasonMonths.length === 0 || product.seasonMonths.includes(month);
}

function matchesSearch(product: Product, needle: string): boolean {
  return (
    product.nameEn.toLowerCase().includes(needle) ||
    product.nameSd.includes(needle) ||
    (product.localName?.toLowerCase().includes(needle) ?? false) ||
    product.slug.includes(needle)
  );
}
