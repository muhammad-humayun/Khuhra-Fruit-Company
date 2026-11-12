import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslationKey } from '../../core/i18n/translations';
import { CartService } from '../../core/services/cart.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';

interface NavLink {
  readonly path: string;
  readonly key: TranslationKey;
  /** Exact matching only for the home route, so it does not stay active everywhere. */
  readonly exact?: boolean;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/', key: 'nav.home', exact: true },
  { path: '/fruits', key: 'nav.fruits' },
  { path: '/vegetables', key: 'nav.vegetables' },
  { path: '/about', key: 'nav.about' },
  { path: '/contact', key: 'nav.contact' },
];

/** Sticky site header. Compacts on scroll and collapses into a panel on small screens. */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Logo, LanguageSwitcher],
  host: {
    class: 'siteheader',
    '[class.is-compact]': 'compact()',
    '[class.is-open]': 'menuOpen()',
  },
  template: `
    <div class="siteheader__bar container">
      <a class="brand" routerLink="/" (click)="closeMenu()">
        <app-logo class="brand__mark" [size]="46" [decorative]="true" />
        <span class="brand__text">
          <strong class="brand__name">{{ i18n.brandName() }}</strong>
          <span class="brand__tagline">{{ i18n.tagline() }}</span>
        </span>
      </a>

      <nav class="sitenav" [attr.aria-label]="i18n.t('a11y.mainNav')">
        <ul class="sitenav__list">
          @for (link of navLinks; track link.path) {
            <li>
              <a
                class="sitenav__link"
                [routerLink]="link.path"
                routerLinkActive="is-active"
                [routerLinkActiveOptions]="{ exact: !!link.exact }"
                (click)="closeMenu()"
              >
                {{ i18n.t(link.key) }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="siteheader__actions">
        <app-language-switcher />
        <a
          class="btn btn--wa btn--sm siteheader__wa"
          [href]="waLink()"
          target="_blank"
          rel="noopener"
          [attr.aria-label]="i18n.t('common.whatsappInquiry')"
        >
          <span class="btn__waIcon" aria-hidden="true"></span>
          {{ i18n.t('common.whatsapp') }}
        </a>

        <button
          type="button"
          class="cartbtn"
          [attr.aria-label]="i18n.t('cart.open')"
          (click)="cart.open()"
        >
          <span class="cartbtn__icon" aria-hidden="true"></span>
          @if (cart.count() > 0) {
            <span class="cartbtn__badge">{{ cart.count() }}</span>
          }
        </button>
        <button
          type="button"
          class="siteheader__burger"
          [attr.aria-expanded]="menuOpen()"
          [attr.aria-label]="menuOpen() ? i18n.t('a11y.closeMenu') : i18n.t('a11y.openMenu')"
          (click)="toggleMenu()"
        >
          <span aria-hidden="true"></span>
        </button>
      </div>
    </div>
  `,
})
export class Header {
  protected readonly i18n = inject(I18nService);
  protected readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly navLinks = NAV_LINKS;
  protected readonly menuOpen = signal(false);
  protected readonly compact = signal(false);

  protected readonly waLink = computed(() => this.whatsapp.generalLink());

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.compact.set(window.scrollY > 24);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
