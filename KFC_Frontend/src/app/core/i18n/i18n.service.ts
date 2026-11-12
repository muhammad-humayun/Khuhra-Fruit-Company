import { Injectable, computed, effect, signal } from '@angular/core';
import { BUSINESS } from '../business';
import { Product, Category } from '../models/catalogue.model';
import { EN, Lang, TRANSLATIONS, TranslationKey } from './translations';

const STORAGE_KEY = 'kfc-lang';

/**
 * Runtime language switching for English and Sindhi.
 *
 * `t` is an arrow property rather than a method so templates can call it directly. Because template
 * expressions run inside the component's reactive context, calling `t(...)` reads the `lang` signal
 * and the view re-renders on a language change - no impure pipe and no page reload.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(readInitialLang());

  readonly dir = computed<'ltr' | 'rtl'>(() => (this.lang() === 'sd' ? 'rtl' : 'ltr'));
  readonly isRtl = computed(() => this.dir() === 'rtl');

  readonly brandName = computed(() => (this.lang() === 'sd' ? BUSINESS.nameSd : BUSINESS.nameEn));
  readonly tagline = computed(() => (this.lang() === 'sd' ? BUSINESS.taglineSd : BUSINESS.taglineEn));
  readonly address = computed(() => (this.lang() === 'sd' ? BUSINESS.addressSd : BUSINESS.addressEn));
  readonly market = computed(() => (this.lang() === 'sd' ? BUSINESS.marketSd : BUSINESS.marketEn));
  readonly city = computed(() => (this.lang() === 'sd' ? BUSINESS.citySd : BUSINESS.cityEn));

  constructor() {
    effect(() => {
      const lang = this.lang();
      const root = document.documentElement;

      // Drives every logical CSS property, the Sindhi font stack and the RTL layout.
      root.lang = lang;
      root.dir = this.dir();
      root.setAttribute('data-lang', lang);

      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // A blocked storage API is not a reason to fail; the choice just will not persist.
      }
    });
  }

  /** Looks up a string, falling back to English and then to the key itself. */
  readonly t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dictionary = TRANSLATIONS[this.lang()];
    let value: string = dictionary[key] ?? EN[key] ?? key;

    if (params) {
      for (const name of Object.keys(params)) {
        value = value.split('{' + name + '}').join(String(params[name]));
      }
    }

    return value;
  };

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Picks whichever of two strings matches the current language. */
  readonly pick = (en: string, sd: string): string => (this.lang() === 'sd' ? sd : en);

  readonly productName = (product: Product): string => this.pick(product.nameEn, product.nameSd);

  readonly productDescription = (product: Product): string =>
    this.pick(product.descriptionEn, product.descriptionSd);

  readonly categoryName = (category: Category): string => this.pick(category.nameEn, category.nameSd);

  readonly monthName = (month: number): string => this.t(('month.' + month) as TranslationKey);

  /**
   * Formats a date as "12 Oct 2026" with localized month names.
   * Western digits are kept in both languages, which is how prices and dates are read in the mandi.
   */
  readonly formatDate = (iso: string | null | undefined): string => {
    if (!iso) {
      return '';
    }

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return `${date.getDate()} ${this.monthName(date.getMonth() + 1)} ${date.getFullYear()}`;
  };

  /** Formats money with thousands separators and no trailing decimals on whole amounts. */
  readonly formatMoney = (amount: number | null | undefined, currency = 'PKR'): string => {
    if (amount === null || amount === undefined) {
      return '';
    }

    const hasFraction = Math.abs(amount % 1) > 0.004;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    });

    return `${currency} ${formatted}`;
  };
}

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'sd' || stored === 'en') {
      return stored;
    }
  } catch {
    // Ignore and fall through to the default.
  }

  return 'en';
}
