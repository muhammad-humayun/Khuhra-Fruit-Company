import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

/** English / Sindhi toggle. Switching is instant - no reload, no separate build. */
@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="langswitch" role="group" [attr.aria-label]="i18n.t('a11y.languageSwitcher')">
      <button
        type="button"
        class="langswitch__btn"
        [class.is-active]="i18n.lang() === 'en'"
        [attr.aria-pressed]="i18n.lang() === 'en'"
        (click)="i18n.setLang('en')"
      >
        EN
      </button>
      <button
        type="button"
        class="langswitch__btn langswitch__btn--sd"
        [class.is-active]="i18n.lang() === 'sd'"
        [attr.aria-pressed]="i18n.lang() === 'sd'"
        (click)="i18n.setLang('sd')"
      >
        سنڌي
      </button>
    </div>
  `,
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18nService);
}
