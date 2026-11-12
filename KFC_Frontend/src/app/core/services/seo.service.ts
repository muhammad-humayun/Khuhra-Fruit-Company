import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BUSINESS } from '../business';
import { I18nService } from '../i18n/i18n.service';

/**
 * Per-route titles and meta, plus one LocalBusiness JSON-LD block.
 *
 * The structured data carries only confirmed facts: name, role, the four phone numbers and the
 * market address. There are no coordinates, no opening hours and no price range, because none of
 * those have been confirmed - and a wrong pin or a wrong closing time is worse than none.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18n = inject(I18nService);

  setPage(pageTitle: string, description: string): void {
    const full = `${pageTitle} | ${BUSINESS.nameEn}`;

    this.title.setTitle(full);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  /** Written once on startup. */
  writeStructuredData(): void {
    const id = 'kfc-structured-data';

    if (document.getElementById(id)) {
      return;
    }

    const data = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: BUSINESS.nameEn,
      alternateName: BUSINESS.nameSd,
      description: `${BUSINESS.taglineEn} at ${BUSINESS.marketEn}.`,
      telephone: BUSINESS.phones.map((phone) => phone.tel),
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Sabzi Mandi',
        addressLocality: BUSINESS.cityEn,
        addressRegion: 'Sindh',
        addressCountry: 'PK',
      },
      availableLanguage: ['en', 'sd'],
      hasMap: BUSINESS.maps.searchUrl,
    };

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /** Keeps the document language attributes in step with the switcher. */
  get currentLang(): string {
    return this.i18n.lang();
  }
}
