import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo],
  template: `
    <section class="section notfound">
      <div class="container narrow centered">
        <app-logo [size]="88" [decorative]="true" />
        <h1 class="notfound__title">{{ i18n.t('notFound.title') }}</h1>
        <p>{{ i18n.t('notFound.body') }}</p>
        <div class="notfound__actions">
          <a class="btn btn--gold btn--lg" routerLink="/">{{ i18n.t('notFound.cta') }}</a>
          <a class="btn btn--outline btn--lg" routerLink="/fruits">{{ i18n.t('nav.fruits') }}</a>
          <a class="btn btn--outline btn--lg" routerLink="/vegetables">{{ i18n.t('nav.vegetables') }}</a>
        </div>
      </div>
    </section>
  `,
})
export class NotFound {
  protected readonly i18n = inject(I18nService);

  constructor() {
    inject(SeoService).setPage('Page not found', 'That page does not exist.');
  }
}
