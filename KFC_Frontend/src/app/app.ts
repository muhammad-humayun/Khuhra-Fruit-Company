import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BUSINESS } from './core/business';
import { APP_CONFIG } from './core/config/app-config';
import { PRICES_ARE_PLACEHOLDERS } from './core/data/pricing.data';
import { I18nService } from './core/i18n/i18n.service';
import { CartService } from './core/services/cart.service';
import { SeoService } from './core/services/seo.service';
import { WhatsappService } from './core/services/whatsapp.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { CartDrawer } from './shared/cart-drawer/cart-drawer';
import { ChatWidget } from './shared/chat-widget/chat-widget';

const NOTICE_KEY = 'kfc-price-notice-dismissed';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CartDrawer, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(I18nService);
  protected readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly business = BUSINESS;
  protected readonly waLink = computed(() => this.whatsapp.generalLink());

  private readonly noticeDismissed = signal(readDismissed());

  /**
   * True on /admin and /admin/login.
   *
   * The owner's screens are a workspace, not a shop page, so the header nav, footer, basket drawer,
   * WhatsApp button and phone bar are all left off - they would only get in the way of a long form.
   */
  protected readonly isAdminRoute = signal(isAdminUrl(location.pathname));

  /**
   * Shown only while the shop is running on the bundled sample prices. Once it is reading the API,
   * prices are whatever the admin typed in, so calling them samples would be wrong.
   */
  protected readonly showPriceNotice = computed(
    () => PRICES_ARE_PLACEHOLDERS && !APP_CONFIG.useApi && !this.noticeDismissed(),
  );

  constructor() {
    inject(SeoService).writeStructuredData();

    // `location.pathname` is only right for the first paint, so keep it current as routes change.
    inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute.set(isAdminUrl(event.urlAfterRedirects));
      }
    });
  }

  protected dismissPriceNotice(): void {
    this.noticeDismissed.set(true);
    try {
      sessionStorage.setItem(NOTICE_KEY, '1');
    } catch {
      // Not worth failing over; it just reappears next page load.
    }
  }
}

function isAdminUrl(url: string): boolean {
  return url === '/admin' || url.startsWith('/admin/') || url.startsWith('/admin?');
}

/** Session-scoped, so the notice comes back on a fresh visit while prices are still samples. */
function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(NOTICE_KEY) === '1';
  } catch {
    return false;
  }
}
