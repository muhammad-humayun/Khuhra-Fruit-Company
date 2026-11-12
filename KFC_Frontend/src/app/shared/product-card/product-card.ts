import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Pack, packsForProduct } from '../../core/data/pricing.data';
import { I18nService } from '../../core/i18n/i18n.service';
import { Product } from '../../core/models/catalogue.model';
import { CartService } from '../../core/services/cart.service';
import { isInSeason } from '../../core/services/catalogue.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { marketMonth } from '../../core/util/market-time';
import { ProductImage } from '../product-image/product-image';

/**
 * A shop card: photograph, name in both languages, pack sizes, price and a quantity stepper.
 *
 * "Add" becomes a - 1 + stepper once the item is in the basket, so a load can be built without
 * leaving the grid. A product with no price set offers a WhatsApp enquiry instead of a number.
 */
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductImage],
  host: { class: 'scard' },
  template: `
    @let product = this.product();
    @let pack = selectedPack();

    <div class="scard__media">
      <app-product-image
        class="scard__img"
        [src]="product.imageUrl"
        [label]="i18n.productName(product)"
        [eager]="eager()"
      />

      @if (inSeason()) {
        <span class="chip chip--season scard__tag">{{ i18n.t('common.inSeasonNow') }}</span>
      }
    </div>

    <div class="scard__body">
      <h3 class="scard__title">{{ i18n.productName(product) }}</h3>
      <p class="scard__alt" [attr.dir]="altDir()" [attr.lang]="altLang()">{{ altName() }}</p>

      @if (packs().length > 1) {
        <div class="packs" role="group" [attr.aria-label]="i18n.t('shop.packSize')">
          @for (option of packs(); track option.label) {
            <button
              type="button"
              class="packs__btn"
              [class.is-active]="option.label === pack?.label"
              [attr.aria-pressed]="option.label === pack?.label"
              (click)="choose(option)"
            >
              {{ i18n.lang() === 'sd' ? option.labelSd : option.label }}
            </button>
          }
        </div>
      } @else if (packs().length === 1) {
        <p class="scard__packOne">{{ i18n.lang() === 'sd' ? packs()[0].labelSd : packs()[0].label }}</p>
      }

      <div class="scard__foot">
        @if (pack) {
          <span class="scard__price">{{ i18n.formatMoney(pack.price) }}</span>

          @if (qty() === 0) {
            <button type="button" class="btn btn--add" (click)="add()">
              {{ i18n.t('shop.add') }}
            </button>
          } @else {
            <div class="stepper" role="group" [attr.aria-label]="i18n.productName(product)">
              <button
                type="button"
                class="stepper__btn"
                [attr.aria-label]="i18n.t('shop.decrease')"
                (click)="dec()"
              >
                &minus;
              </button>
              <span class="stepper__qty" aria-live="polite">{{ qty() }}</span>
              <button
                type="button"
                class="stepper__btn"
                [attr.aria-label]="i18n.t('shop.increase')"
                (click)="inc()"
              >
                +
              </button>
            </div>
          }
        } @else {
          <span class="scard__ask">{{ i18n.t('shop.priceOnRequest') }}</span>
          <a class="btn btn--wa btn--sm" [href]="waLink()" target="_blank" rel="noopener">
            <span class="btn__waIcon" aria-hidden="true"></span>
            {{ i18n.t('common.whatsapp') }}
          </a>
        }
      </div>
    </div>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  /** True for cards in the first screenful, so their photos load immediately. */
  readonly eager = input<boolean>(false);

  protected readonly i18n = inject(I18nService);
  protected readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);

  /** Which pack the shopper has chosen; the first pack until they pick. */
  private readonly chosen = signal<string | null>(null);

  protected readonly packs = computed(() => packsForProduct(this.product()));

  protected readonly selectedPack = computed<Pack | undefined>(() => {
    const options = this.packs();
    if (options.length === 0) {
      return undefined;
    }

    const label = this.chosen();
    return options.find((p) => p.label === label) ?? options[0];
  });

  protected readonly qty = computed(() => {
    const pack = this.selectedPack();
    return pack ? this.cart.qtyOf(this.product().slug, pack.label) : 0;
  });

  protected readonly inSeason = computed(() => {
    const product = this.product();
    return product.seasonMonths.length > 0 && isInSeason(product, marketMonth());
  });

  protected readonly waLink = computed(() => this.whatsapp.productLink(this.product()));

  protected readonly altName = computed(() =>
    this.i18n.lang() === 'sd' ? this.product().nameEn : this.product().nameSd,
  );

  protected readonly altDir = computed(() => (this.i18n.lang() === 'sd' ? 'ltr' : 'rtl'));
  protected readonly altLang = computed(() => (this.i18n.lang() === 'sd' ? 'en' : 'sd'));

  protected choose(pack: Pack): void {
    this.chosen.set(pack.label);
  }

  protected add(): void {
    const pack = this.selectedPack();
    if (pack) {
      this.cart.add(this.product(), pack, 1);
    }
  }

  protected inc(): void {
    this.add();
  }

  protected dec(): void {
    const pack = this.selectedPack();
    if (pack) {
      this.cart.decrement(`${this.product().slug}__${pack.label}`);
    }
  }
}
