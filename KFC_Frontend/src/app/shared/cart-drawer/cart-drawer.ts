import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BUSINESS } from '../../core/business';
import { I18nService } from '../../core/i18n/i18n.service';
import { CartService } from '../../core/services/cart.service';

/**
 * The basket panel.
 *
 * Checkout composes the whole basket into a WhatsApp message. The note above the button says
 * plainly that nothing is charged here and that the rate is confirmed before packing, because that
 * is how the business actually works - there is no payment gateway behind this.
 */
@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cart.isOpen()) {
      <div class="cartdrawer__scrim" (click)="cart.close()" aria-hidden="true"></div>

      <aside
        class="cartdrawer"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="i18n.t('cart.title')"
      >
        <header class="cartdrawer__head">
          <h2 class="cartdrawer__title">
            {{ i18n.t('cart.title') }}
            <span class="cartdrawer__count">{{ i18n.t('cart.itemCount', { count: cart.count() }) }}</span>
          </h2>
          <button
            type="button"
            class="cartdrawer__close"
            [attr.aria-label]="i18n.t('cart.close')"
            (click)="cart.close()"
          >
            &times;
          </button>
        </header>

        @if (cart.isEmpty()) {
          <div class="cartdrawer__empty">
            <p class="cartdrawer__emptyTitle">{{ i18n.t('cart.empty') }}</p>
            <p class="muted">{{ i18n.t('cart.emptyHint') }}</p>
            <button type="button" class="btn btn--outline" (click)="cart.close()">
              {{ i18n.t('cart.continue') }}
            </button>
          </div>
        } @else {
          <ul class="cartlines">
            @for (line of cart.lines(); track line.key) {
              <li class="cartline">
                @if (line.image) {
                  <img class="cartline__img" [src]="line.image" alt="" loading="lazy" />
                } @else {
                  <span class="cartline__img cartline__img--blank" aria-hidden="true"></span>
                }

                <div class="cartline__info">
                  <strong class="cartline__name">{{ i18n.lang() === 'sd' ? line.nameSd : line.nameEn }}</strong>
                  <span class="cartline__pack">
                    {{ i18n.lang() === 'sd' ? line.packLabelSd : line.packLabel }}
                    &middot; {{ i18n.formatMoney(line.unitPrice) }}
                  </span>

                  <div class="cartline__controls">
                    <div class="stepper stepper--sm">
                      <button
                        type="button"
                        class="stepper__btn"
                        [attr.aria-label]="i18n.t('shop.decrease')"
                        (click)="cart.decrement(line.key)"
                      >
                        &minus;
                      </button>
                      <span class="stepper__qty">{{ line.qty }}</span>
                      <button
                        type="button"
                        class="stepper__btn"
                        [attr.aria-label]="i18n.t('shop.increase')"
                        (click)="cart.increment(line.key)"
                      >
                        +
                      </button>
                    </div>

                    <button type="button" class="cartline__remove" (click)="cart.remove(line.key)">
                      {{ i18n.t('cart.remove') }}
                    </button>
                  </div>
                </div>

                <span class="cartline__total">{{ i18n.formatMoney(line.qty * line.unitPrice) }}</span>
              </li>
            }
          </ul>

          <footer class="cartdrawer__foot">
            <div class="cartdrawer__totalRow">
              <span>{{ i18n.t('cart.subtotal') }}</span>
              <strong class="cartdrawer__total">{{ i18n.formatMoney(cart.subtotal()) }}</strong>
            </div>

            <p class="cartdrawer__note">{{ i18n.t('cart.note') }}</p>

            <a class="btn btn--wa btn--block btn--lg" [href]="checkoutLink()" target="_blank" rel="noopener">
              <span class="btn__waIcon" aria-hidden="true"></span>
              {{ i18n.t('cart.checkout') }}
            </a>

            <button type="button" class="link link--btn cartdrawer__clear" (click)="cart.clear()">
              {{ i18n.t('cart.clear') }}
            </button>
          </footer>
        }
      </aside>
    }
  `,
})
export class CartDrawer {
  protected readonly cart = inject(CartService);
  protected readonly i18n = inject(I18nService);

  protected readonly checkoutLink = computed(
    () => `https://wa.me/${BUSINESS.whatsApp.waNumber}?text=${encodeURIComponent(this.cart.orderMessage())}`,
  );
}
