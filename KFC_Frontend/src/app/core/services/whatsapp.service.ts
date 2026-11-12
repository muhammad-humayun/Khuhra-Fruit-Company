import { Injectable, inject } from '@angular/core';
import { BUSINESS } from '../business';
import { I18nService } from '../i18n/i18n.service';
import { Product } from '../models/catalogue.model';

/**
 * Builds wa.me links with a prepared message.
 *
 * Nothing is sent from the site and nothing is stored: the link opens WhatsApp with the text ready,
 * and the customer presses send themselves.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly i18n = inject(I18nService);

  /** A product-specific enquiry, in the visitor's current language. */
  productLink(product: Product): string {
    return this.link(this.i18n.t('msg.product', { product: this.i18n.productName(product) }));
  }

  /** A general enquiry with no product attached. */
  generalLink(): string {
    return this.link(this.i18n.t('msg.general'));
  }

  /**
   * encodeURIComponent is what makes spaces, newlines and Sindhi characters survive the trip:
   * it percent-encodes them as UTF-8, which is what wa.me expects.
   */
  private link(message: string): string {
    return `https://wa.me/${BUSINESS.whatsApp.waNumber}?text=${encodeURIComponent(message)}`;
  }
}
