import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProductKind } from '../../core/models/catalogue.model';
import { CatalogueService } from '../../core/services/catalogue.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from '../../shared/product-card/product-card';

/**
 * The shop page behind both /fruits and /vegetables.
 *
 * The two routes are separate; `kind` arrives from route data and `c` from the `?c=` query string,
 * both through the router's component input binding. One component serves both because the
 * furniture - search, category rail, grid - is identical.
 */
@Component({
  selector: 'app-catalogue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCard],
  templateUrl: './catalogue.html',
})
export class Catalogue {
  /** Bound from route data. */
  readonly kind = input.required<ProductKind>();

  /** Bound from the `?c=` query parameter, so a category tile can deep-link into a filter. */
  readonly c = input<string | undefined>(undefined);

  protected readonly i18n = inject(I18nService);
  protected readonly catalogue = inject(CatalogueService);
  private readonly seo = inject(SeoService);

  protected readonly search = signal('');
  protected readonly activeCategory = signal<string | null>(null);
  protected readonly inSeasonOnly = signal(false);

  protected readonly isFruit = computed(() => this.kind() === 'fruit');

  protected readonly title = computed(() =>
    this.i18n.t(this.isFruit() ? 'cat.fruitsTitle' : 'cat.vegetablesTitle'),
  );

  protected readonly categories = computed(() => this.catalogue.categoriesFor(this.kind()));

  protected readonly total = computed(() => this.catalogue.query({ kind: this.kind() }).length);

  protected readonly results = computed(() =>
    this.catalogue.query({
      kind: this.kind(),
      categorySlug: this.activeCategory() ?? undefined,
      search: this.search(),
      inSeasonOnly: this.inSeasonOnly(),
    }),
  );

  protected readonly hasFilters = computed(
    () => this.search().trim().length > 0 || this.activeCategory() !== null || this.inSeasonOnly(),
  );

  constructor() {
    effect(() => {
      this.seo.setPage(
        this.isFruit() ? 'Fruits' : 'Vegetables',
        this.isFruit()
          ? 'Mangoes, dates, guavas, melons, citrus and the full seasonal fruit range from Khuhra Fruit Company, Sabzi Mandi, Larkana.'
          : 'Potatoes, onions, tomatoes, gourds, greens and roots from Khuhra Fruit Company, Sabzi Mandi, Larkana.',
      );
    });

    // Reset the filters when moving between the two shops, honouring any ?c= deep link.
    effect(() => {
      this.kind();
      const deepLink = this.c();

      this.search.set('');
      this.inSeasonOnly.set(false);
      this.activeCategory.set(deepLink ?? null);
    });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected selectCategory(slug: string | null): void {
    this.activeCategory.set(slug);
  }

  protected toggleSeason(): void {
    this.inSeasonOnly.update((value) => !value);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.activeCategory.set(null);
    this.inSeasonOnly.set(false);
  }
}
