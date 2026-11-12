import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS } from '../../core/business';
import { I18nService } from '../../core/i18n/i18n.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { SeoService } from '../../core/services/seo.service';
import { HeroSlider } from '../../shared/hero-slider/hero-slider';
import { ProductImage } from '../../shared/product-image/product-image';
import { ProductSection } from '../../shared/product-section/product-section';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HeroSlider, ProductSection, ProductImage],
  templateUrl: './home.html',
})
export class Home {
  protected readonly i18n = inject(I18nService);
  protected readonly catalogue = inject(CatalogueService);
  protected readonly business = BUSINESS;

  /** Category tiles, each borrowing the photo of its first product. */
  protected readonly categoryTiles = computed(() => {
    const products = this.catalogue.products();

    return this.catalogue.categories().map((category) => ({
      slug: category.slug,
      name: this.i18n.categoryName(category),
      count: category.productCount ?? 0,
      image: products.find((p) => p.categorySlug === category.slug)?.imageUrl,
      route: category.kind === 'fruit' ? '/fruits' : '/vegetables',
    }));
  });

  /** Eight per block: two tidy rows of four on desktop, with "see more" for the rest. */
  protected readonly seasonal = computed(() => this.catalogue.inSeasonNow().slice(0, 8));
  protected readonly fruitPicks = computed(() => this.catalogue.fruits().slice(0, 8));
  protected readonly vegetablePicks = computed(() => this.catalogue.vegetables().slice(0, 8));

  constructor() {
    inject(SeoService).setPage(
      'Fresh Fruits & Vegetables from Larkana',
      `${BUSINESS.nameEn} - ${BUSINESS.taglineEn} at ${BUSINESS.marketEn}. Order fruits and vegetables on WhatsApp.`,
    );
  }
}
