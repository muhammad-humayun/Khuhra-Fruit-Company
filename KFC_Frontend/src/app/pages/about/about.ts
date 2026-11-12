import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS } from '../../core/business';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo],
  template: `
    <section class="pagehead">
      <div class="container">
        <h1 class="pagehead__title">{{ i18n.t('about.title') }}</h1>
        <p class="pagehead__sub">{{ i18n.t('about.subtitle') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container aboutgrid">
        <div class="prose">
          <h2>{{ i18n.t('about.roleTitle') }}</h2>
          <p>{{ i18n.t('about.roleBody') }}</p>

          <h2>{{ i18n.t('about.honestyTitle') }}</h2>
          <p>{{ i18n.t('about.honestyBody') }}</p>
        </div>

        <aside class="factcard">
          <app-logo [size]="76" [decorative]="true" />
          <h2 class="factcard__title">{{ i18n.t('about.factsTitle') }}</h2>
          <dl class="factlist">
            <dt>{{ i18n.t('about.fact.business') }}</dt>
            <dd>{{ i18n.brandName() }}</dd>

            <dt>{{ i18n.t('about.fact.role') }}</dt>
            <dd>{{ i18n.tagline() }}</dd>

            <dt>{{ i18n.t('about.fact.location') }}</dt>
            <dd>{{ i18n.address() }}</dd>

            <dt>{{ i18n.t('about.fact.languages') }}</dt>
            <dd>{{ i18n.t('about.fact.languagesValue') }}</dd>
          </dl>

          <a class="btn btn--wa btn--block" [href]="waLink()" target="_blank" rel="noopener">
            <span class="btn__waIcon" aria-hidden="true"></span>
            {{ i18n.t('common.whatsappInquiry') }}
          </a>
        </aside>
      </div>
    </section>

    <section class="band band--slim">
      <div class="container band__inner">
        <div>
          <h2 class="band__title">{{ i18n.t('about.ctaTitle') }}</h2>
          <p class="band__text">{{ business.addressEn }}</p>
        </div>
        <div class="band__actions">
          <a class="btn btn--gold btn--lg" routerLink="/contact">{{ i18n.t('nav.contact') }}</a>
          <a class="btn btn--light btn--lg" routerLink="/vegetables">{{ i18n.t('nav.vegetables') }}</a>
        </div>
      </div>
    </section>
  `,
})
export class About {
  protected readonly i18n = inject(I18nService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly business = BUSINESS;
  protected readonly waLink = computed(() => this.whatsapp.generalLink());

  constructor() {
    inject(SeoService).setPage(
      'About Us',
      `${BUSINESS.nameEn} is a ${BUSINESS.taglineEn} at ${BUSINESS.marketEn}, Sindh.`,
    );
  }
}
