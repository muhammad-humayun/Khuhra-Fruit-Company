import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * A product photograph.
 *
 * If the photo is missing or fails to load, it falls back to a tinted tile carrying the product's
 * first letter, so a grid never shows a broken-image icon. The tint is derived from the name, which
 * keeps neighbouring tiles visually distinct without storing a colour per product.
 */
@Component({
  selector: 'app-product-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pimg' },
  template: `
    @if (src() && !failed()) {
      <img
        class="pimg__photo"
        [src]="src()"
        [alt]="label()"
        [attr.loading]="eager() ? 'eager' : 'lazy'"
        decoding="async"
        (error)="failed.set(true)"
      />
    } @else {
      <span class="pimg__fallback" [style.--tint]="tint()" role="img" [attr.aria-label]="label()">
        {{ initial() }}
      </span>
    }
  `,
})
export class ProductImage {
  readonly src = input<string | undefined>(undefined);
  readonly label = input<string>('');

  /** Set for above-the-fold images so they are not lazily deferred. */
  readonly eager = input<boolean>(false);

  protected readonly failed = signal(false);

  protected readonly initial = computed(() => this.label().trim().charAt(0).toUpperCase() || '?');

  protected readonly tint = computed(() => {
    const name = this.label();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 360;
    }
    return `hsl(${hash} 42% 88%)`;
  });
}
