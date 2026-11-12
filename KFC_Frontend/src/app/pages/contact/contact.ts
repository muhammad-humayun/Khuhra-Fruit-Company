import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BUSINESS } from '../../core/business';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pagehead">
      <div class="container">
        <h1 class="pagehead__title">{{ i18n.t('contact.title') }}</h1>
        <p class="pagehead__sub">{{ i18n.t('contact.subtitle') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container contactgrid">
        <div class="infocard">
          <h2 class="infocard__title">{{ i18n.t('contact.phonesTitle') }}</h2>
          <ul class="sitefooter__phones">
            @for (phone of phones; track phone.tel; let first = $first) {
              <li class="phoneline">
                <a class="phoneline__num" [href]="'tel:' + phone.tel">{{ phone.display }}</a>
                @if (first) {
                  <span class="chip chip--quiet">{{ i18n.t('contact.primary') }}</span>
                }
                @if (phone.isWhatsApp) {
                  <span class="chip chip--wa">{{ i18n.t('common.whatsapp') }}</span>
                }
                <button
                  type="button"
                  class="phoneline__copy"
                  [attr.aria-label]="i18n.t('common.copy') + ' ' + phone.display"
                  (click)="copy(phone.display)"
                >
                  {{ copied() === phone.display ? i18n.t('common.copied') : '⧉' }}
                </button>
              </li>
            }
          </ul>

          <h2 class="infocard__title">{{ i18n.t('contact.hoursTitle') }}</h2>
          <p class="muted">{{ i18n.t('contact.hoursBody') }}</p>
        </div>

        <div class="infocard infocard--wa">
          <h2 class="infocard__title">{{ i18n.t('contact.whatsappTitle') }}</h2>
          <p>{{ i18n.t('contact.whatsappBody') }}</p>
          <p class="infocard__big">{{ business.whatsApp.display }}</p>
          <a class="btn btn--wa btn--block" [href]="waLink()" target="_blank" rel="noopener">
            <span class="btn__waIcon" aria-hidden="true"></span>
            {{ i18n.t('common.whatsappInquiry') }}
          </a>

          <h2 class="infocard__title">{{ i18n.t('contact.addressTitle') }}</h2>
          <p>{{ i18n.address() }}</p>
          <a class="btn btn--outline btn--block" [href]="business.maps.directionsUrl" target="_blank" rel="noopener">
            {{ i18n.t('common.getDirections') }}
          </a>
        </div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <header class="sectionhead">
          <h2 class="sectionhead__title">{{ i18n.t('contact.mapTitle') }}</h2>
          <p class="sectionhead__sub">{{ i18n.t('contact.mapNote') }}</p>
        </header>

        <div class="mapframe mapframe--tall">
          <iframe
            [src]="mapUrl"
            [title]="i18n.t('a11y.mapTitle')"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div class="centered">
          <a class="btn btn--outline" [href]="business.maps.searchUrl" target="_blank" rel="noopener">
            {{ i18n.t('common.openInMaps') }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class Contact {
  protected readonly i18n = inject(I18nService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly business = BUSINESS;
  protected readonly phones = BUSINESS.phones;
  protected readonly copied = signal<string | null>(null);

  protected readonly waLink = computed(() => this.whatsapp.generalLink());

  /** A constant from `business.ts`, so trusting it as a resource URL is safe. */
  protected readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(BUSINESS.maps.embedUrl);

  constructor() {
    inject(SeoService).setPage(
      'Contact',
      `Call ${BUSINESS.phones[0].display} or message ${BUSINESS.whatsApp.display} on WhatsApp. ${BUSINESS.nameEn}, ${BUSINESS.addressEn}.`,
    );
  }

  protected async copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(value);
      setTimeout(() => this.copied.set(null), 1800);
    } catch {
      // Clipboard access can be blocked; the tel: link next to it still works.
    }
  }
}
