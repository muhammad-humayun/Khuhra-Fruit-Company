import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { Product } from '../../core/models/catalogue.model';
import { ProductCard } from '../product-card/product-card';

/**
 * A titled block of products laid out on the page, with a "see more" link to the full shop.
 *
 * This used to be a sideways scroller. It is a plain grid now: everything in the block is visible
 * at once, four across on desktop, with no scrollbar to drag and nothing hidden off the edge.
 */
@Component({
  selector: 'app-product-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard],
  host: { class: 'psec' },
  template: `
    <header class="psec__head">
      <h2 class="psec__title">{{ title() }}</h2>

      @if (link()) {
        <a class="psec__more" [routerLink]="link()">
          {{ i18n.t('home.seeMore') }}
          <span class="psec__moreArrow" aria-hidden="true">→</span>
        </a>
      }
    </header>

    <div class="pgrid">
      @for (product of products(); track product.slug) {
        <app-product-card [product]="product" [eager]="eager()" />
      }
    </div>
  `,
})
export class ProductSection {
  readonly title = input.required<string>();
  readonly products = input.required<readonly Product[]>();

  /** Route for the "see more" link. Omit to hide it. */
  readonly link = input<string | undefined>(undefined);

  /** Set for the first block on the page so its photos are not lazily deferred. */
  readonly eager = input<boolean>(false);

  protected readonly i18n = inject(I18nService);
}
