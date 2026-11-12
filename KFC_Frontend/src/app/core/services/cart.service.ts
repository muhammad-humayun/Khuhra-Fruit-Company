import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Pack } from '../data/pricing.data';
import { I18nService } from '../i18n/i18n.service';
import { Product } from '../models/catalogue.model';

const STORAGE_KEY = 'kfc-cart';

export interface CartLine {
  /** slug plus pack label, so the same product in two pack sizes is two lines. */
  readonly key: string;
  readonly slug: string;
  readonly nameEn: string;
  readonly nameSd: string;
  readonly packLabel: string;
  readonly packLabelSd: string;
  readonly unitPrice: number;
  readonly qty: number;
  readonly image?: string;
}

/**
 * The basket.
 *
 * It holds what the customer wants and totals it up; it does not take payment and does not place an
 * order anywhere. Checkout hands the whole basket to WhatsApp as a written order which the customer
 * sends themselves, which is how a commission agent actually takes an order.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly i18n = inject(I18nService);

  readonly lines = signal<CartLine[]>(load());

  /** Drawer visibility. */
  readonly isOpen = signal(false);

  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.qty, 0));

  readonly subtotal = computed(() => this.lines().reduce((sum, line) => sum + line.qty * line.unitPrice, 0));

  readonly isEmpty = computed(() => this.lines().length === 0);

  constructor() {
    effect(() => {
      const snapshot = this.lines();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // A full or blocked storage quota must not break adding to the basket.
      }
    });
  }

  /** Quantity of one product-and-pack already in the basket. */
  qtyOf(slug: string, packLabel: string): number {
    return this.lines().find((line) => line.key === keyFor(slug, packLabel))?.qty ?? 0;
  }

  add(product: Product, pack: Pack, qty = 1): void {
    const key = keyFor(product.slug, pack.label);

    this.lines.update((lines) => {
      const existing = lines.find((line) => line.key === key);

      if (existing) {
        return lines.map((line) => (line.key === key ? { ...line, qty: line.qty + qty } : line));
      }

      return [
        ...lines,
        {
          key,
          slug: product.slug,
          nameEn: product.nameEn,
          nameSd: product.nameSd,
          packLabel: pack.label,
          packLabelSd: pack.labelSd,
          unitPrice: pack.price,
          qty,
          image: product.imageUrl,
        },
      ];
    });
  }

  /** Sets an absolute quantity. Zero or less removes the line. */
  setQty(key: string, qty: number): void {
    if (qty <= 0) {
      this.remove(key);
      return;
    }

    this.lines.update((lines) => lines.map((line) => (line.key === key ? { ...line, qty } : line)));
  }

  increment(key: string): void {
    this.lines.update((lines) => lines.map((line) => (line.key === key ? { ...line, qty: line.qty + 1 } : line)));
  }

  decrement(key: string): void {
    const line = this.lines().find((l) => l.key === key);
    if (!line) {
      return;
    }
    this.setQty(key, line.qty - 1);
  }

  remove(key: string): void {
    this.lines.update((lines) => lines.filter((line) => line.key !== key));
  }

  clear(): void {
    this.lines.set([]);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  /** The basket written out as an order message, in the customer's language. */
  orderMessage(): string {
    const sindhi = this.i18n.lang() === 'sd';
    const lines = this.lines();

    const head = sindhi
      ? 'السلام عليڪم، مان کُهڙا فروٽ ڪمپني کان هي آرڊر ڏيڻ چاهيان ٿو:'
      : 'Assalam-o-Alaikum, I would like to place this order with Khuhra Fruit Company:';

    const body = lines
      .map((line, index) => {
        const name = sindhi ? line.nameSd : line.nameEn;
        const pack = sindhi ? line.packLabelSd : line.packLabel;
        return `${index + 1}. ${name} - ${pack} x ${line.qty} = PKR ${(line.qty * line.unitPrice).toLocaleString('en-US')}`;
      })
      .join('\n');

    const total = sindhi
      ? `ڪل: PKR ${this.subtotal().toLocaleString('en-US')}`
      : `Total: PKR ${this.subtotal().toLocaleString('en-US')}`;

    const tail = sindhi
      ? 'مهرباني ڪري اڄوڪو ريٽ ۽ دستيابي جي تصديق ڪريو.'
      : 'Please confirm today’s rate and availability.';

    return `${head}\n\n${body}\n\n${total}\n\n${tail}`;
  }
}

function keyFor(slug: string, packLabel: string): string {
  return `${slug}__${packLabel}`;
}

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Anything stored by an older build is dropped rather than trusted.
    return parsed.filter(
      (line): line is CartLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as CartLine).key === 'string' &&
        typeof (line as CartLine).unitPrice === 'number' &&
        typeof (line as CartLine).qty === 'number' &&
        (line as CartLine).qty > 0,
    );
  } catch {
    return [];
  }
}
