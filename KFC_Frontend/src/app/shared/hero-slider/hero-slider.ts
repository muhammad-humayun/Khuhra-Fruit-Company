import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_INTERVAL_MS, HERO_SLIDES } from '../../core/data/hero-slides.data';
import { I18nService } from '../../core/i18n/i18n.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

/**
 * The full-bleed hero carousel.
 *
 * Slides cross-fade rather than slide, which keeps the curved bottom edge intact and avoids a
 * horizontal scroll container at full width. Autoplay stops while the pointer or keyboard focus is
 * inside it, while the tab is hidden, and entirely when the visitor prefers reduced motion - an
 * image that moves on its own is the first thing to go for anyone sensitive to it.
 */
@Component({
  selector: 'app-hero-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: {
    class: 'hero',
    '(mouseenter)': 'pause()',
    '(mouseleave)': 'resume()',
    '(focusin)': 'pause()',
    '(focusout)': 'resume()',
  },
  template: `
    <div
      class="hero__stage"
      role="region"
      aria-roledescription="carousel"
      [attr.aria-label]="i18n.t('hero.label')"
    >
      @for (slide of slides; track slide.id; let i = $index) {
        <div
          class="hero__slide"
          [class.is-active]="i === index()"
          role="group"
          aria-roledescription="slide"
          [attr.aria-label]="(i + 1) + ' / ' + slides.length"
          [attr.aria-hidden]="i === index() ? null : 'true'"
          [attr.inert]="i === index() ? null : ''"
        >
          <img
            class="hero__img"
            [src]="slide.image"
            [attr.srcset]="slide.imageSmall + ' 960w, ' + slide.image + ' 1920w'"
            sizes="100vw"
            alt=""
            [attr.loading]="i === 0 ? 'eager' : 'lazy'"
            [attr.fetchpriority]="i === 0 ? 'high' : null"
            decoding="async"
          />

          <div class="hero__scrim"></div>

          <div class="container hero__content">
            <h1 class="hero__title">{{ i18n.t(slide.titleKey) }}</h1>
            <p class="hero__sub">{{ i18n.t(slide.subKey) }}</p>

            @if (slide.whatsapp) {
              <a class="hero__cta" [href]="waLink()" target="_blank" rel="noopener">
                {{ i18n.t(slide.ctaKey) }}
              </a>
            } @else {
              <a class="hero__cta" [routerLink]="slide.route">{{ i18n.t(slide.ctaKey) }}</a>
            }
          </div>
        </div>
      }

      <button
        type="button"
        class="hero__arrow hero__arrow--prev"
        [attr.aria-label]="i18n.t('hero.prev')"
        (click)="prev()"
      >
        ‹
      </button>
      <button
        type="button"
        class="hero__arrow hero__arrow--next"
        [attr.aria-label]="i18n.t('hero.next')"
        (click)="next()"
      >
        ›
      </button>

      <div class="hero__dots">
        @for (slide of slides; track slide.id; let i = $index) {
          <button
            type="button"
            class="hero__dot"
            [class.is-active]="i === index()"
            [attr.aria-label]="i18n.t('hero.goTo', { n: i + 1 })"
            [attr.aria-current]="i === index() ? 'true' : null"
            (click)="goTo(i)"
          ></button>
        }
      </div>
    </div>
  `,
})
export class HeroSlider {
  protected readonly i18n = inject(I18nService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly slides = HERO_SLIDES;
  protected readonly index = signal(0);

  protected readonly waLink = computed(() => this.whatsapp.generalLink());

  private timer: ReturnType<typeof setInterval> | undefined;
  private paused = false;

  constructor() {
    this.start();

    // Stop the timer while the tab is in the background, so a buried tab is not churning.
    const onVisibility = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener('visibilitychange', onVisibility);

    inject(DestroyRef).onDestroy(() => {
      this.stop();
      document.removeEventListener('visibilitychange', onVisibility);
    });
  }

  protected next(): void {
    this.index.update((i) => (i + 1) % this.slides.length);
    this.restart();
  }

  protected prev(): void {
    this.index.update((i) => (i - 1 + this.slides.length) % this.slides.length);
    this.restart();
  }

  protected goTo(i: number): void {
    this.index.set(i);
    this.restart();
  }

  protected pause(): void {
    this.paused = true;
    this.stop();
  }

  protected resume(): void {
    this.paused = false;
    this.start();
  }

  private start(): void {
    if (this.timer !== undefined || this.paused || prefersReducedMotion()) {
      return;
    }

    this.timer = setInterval(() => {
      this.index.update((i) => (i + 1) % this.slides.length);
    }, HERO_INTERVAL_MS);
  }

  private stop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /** Gives the visitor a full interval to read a slide they just chose. */
  private restart(): void {
    this.stop();
    this.start();
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
