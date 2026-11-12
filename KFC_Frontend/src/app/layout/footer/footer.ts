import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BUSINESS } from '../../core/business';
import { I18nService } from '../../core/i18n/i18n.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { LanguageSwitcher } from '../../shared/language-switcher/language-switcher';
import { Logo } from '../../shared/logo/logo';
import { NAV_LINKS } from '../header/header';

/**
 * Site footer: identity, all four numbers, quick links, the language switcher and the map.
 *
 * The map is a keyless Google Maps embed of a market-area search, and the note beside it says
 * exactly that. No coordinates are hard-coded, because the shop pin has not been confirmed.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, LanguageSwitcher],
  host: { class: 'sitefooter' },
  template: `
    <div class="container sitefooter__grid">
      <div class="sitefooter__brandCol">
        <div class="brand brand--footer">
          <app-logo class="brand__mark" [size]="56" [decorative]="true" />
          <span class="brand__text">
            <strong class="brand__name">{{ i18n.brandName() }}</strong>
            <span class="brand__tagline">{{ i18n.tagline() }}</span>
          </span>
        </div>
        <p class="sitefooter__address">{{ i18n.address() }}</p>
        <a class="btn btn--wa btn--sm" [href]="waLink()" target="_blank" rel="noopener">
          <span class="btn__waIcon" aria-hidden="true"></span>
          {{ i18n.t('common.whatsappInquiry') }}
        </a>
        <div class="sitefooter__lang">
          <span class="sitefooter__langLabel">{{ i18n.t('common.language') }}</span>
          <app-language-switcher />
        </div>
      </div>

      <nav class="sitefooter__col" [attr.aria-label]="i18n.t('a11y.footerNav')">
        <h2 class="sitefooter__heading">{{ i18n.t('footer.quickLinks') }}</h2>
        <ul class="sitefooter__links">
          @for (link of navLinks; track link.path) {
            <li><a [routerLink]="link.path">{{ i18n.t(link.key) }}</a></li>
          }
        </ul>
      </nav>

      <div class="sitefooter__col">
        <h2 class="sitefooter__heading">{{ i18n.t('footer.contactTitle') }}</h2>
        <ul class="sitefooter__phones">
          @for (phone of phones; track phone.tel) {
            <li class="phoneline">
              <a class="phoneline__num" [href]="'tel:' + phone.tel">{{ phone.display }}</a>
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
        <p class="sitefooter__note">{{ i18n.t('footer.note') }}</p>
      </div>

      <div class="sitefooter__col sitefooter__mapCol">
        <h2 class="sitefooter__heading">{{ i18n.t('footer.findUs') }}</h2>
        <div class="mapframe">
          <iframe
            [src]="mapUrl"
            [title]="i18n.t('a11y.mapTitle')"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <p class="sitefooter__note">{{ i18n.t('contact.mapNote') }}</p>
        <div class="sitefooter__mapActions">
          <a class="btn btn--ghost btn--sm" [href]="business.maps.directionsUrl" target="_blank" rel="noopener">
            {{ i18n.t('common.getDirections') }}
          </a>
          <a class="link" [href]="business.maps.searchUrl" target="_blank" rel="noopener">
            {{ i18n.t('common.openInMaps') }}
          </a>
        </div>
      </div>
    </div>

    <div class="sitefooter__bottom">
      <div class="container sitefooter__bottomInner">
        <span>&copy; {{ year }} {{ i18n.brandName() }}. {{ i18n.t('footer.rights') }}</span>
        <span class="sitefooter__bottomTag">{{ i18n.tagline() }}</span>
      </div>
    </div>
  `,
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly business = BUSINESS;
  protected readonly phones = BUSINESS.phones;
  protected readonly navLinks = NAV_LINKS;
  protected readonly year = new Date().getFullYear();
  protected readonly copied = signal<string | null>(null);

  protected readonly waLink = computed(() => this.whatsapp.generalLink());

  /**
   * An iframe src is a resource URL, so Angular requires it to be explicitly trusted. Trusting it
   * here is safe: the value is a constant in `business.ts` and nothing a visitor types can reach it.
   */
  protected readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(BUSINESS.maps.embedUrl);

  protected async copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(value);
      setTimeout(() => this.copied.set(null), 1800);
    } catch {
      // Clipboard access can be blocked; the number is still a tel: link next to the button.
    }
  }
}
