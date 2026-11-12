import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let logoInstance = 0;

/**
 * The Khuhra Fruit Company badge mark.
 *
 * A circular badge in the business-card palette: deep blue ring, gold keyline, cream field. Inside
 * are the four lines the business is known for - a watermelon base, a mango, a guava and a small
 * date cluster - with one leaf motif. Four recognisable fruits rather than a dozen tiny ones, so
 * the mark still reads at 20px in the navigation bar and as a favicon.
 *
 * The wordmark is deliberately not inside the SVG: it is rendered as text next to the mark, so it
 * stays sharp, switches to Sindhi with the rest of the site, and never gets squashed on a phone.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      [attr.role]="decorative() ? 'presentation' : 'img'"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [attr.aria-label]="decorative() ? null : 'Khuhra Fruit Company'"
    >
      <defs>
        <linearGradient [attr.id]="ringId" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stop-color="#1A5A9E" />
          <stop offset="1" stop-color="#0A2F5C" />
        </linearGradient>
        <linearGradient [attr.id]="mangoId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FBDE8C" />
          <stop offset="0.5" stop-color="#F2A33A" />
          <stop offset="1" stop-color="#D1760F" />
        </linearGradient>
        <linearGradient [attr.id]="guavaId" x1="0.2" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#CCE09A" />
          <stop offset="1" stop-color="#63902C" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="31" [attr.fill]="ringFill" />
      <circle cx="32" cy="32" r="30.1" fill="none" stroke="#F7B500" stroke-width="1.8" />
      <circle cx="32" cy="32" r="24.5" fill="#FFF7E8" />

      <!-- Watermelon base -->
      <path d="M12.5 34 A19.5 19.5 0 0 0 51.5 34 Z" fill="#1E7A3E" />
      <path d="M15.4 34 A16.6 16.6 0 0 0 48.6 34 Z" fill="#D62828" />
      <ellipse cx="26" cy="40.2" rx="1.1" ry="1.7" fill="#33200F" />
      <ellipse cx="32" cy="43.4" rx="1.1" ry="1.7" fill="#33200F" />
      <ellipse cx="38" cy="40.2" rx="1.1" ry="1.7" fill="#33200F" />

      <!-- Date cluster, tucked behind the guava -->
      <ellipse cx="45.2" cy="19.4" rx="2.5" ry="3.9" fill="#8B4A1E" transform="rotate(26 45.2 19.4)" />
      <ellipse cx="48.6" cy="22.8" rx="2.5" ry="3.9" fill="#A75E2A" transform="rotate(42 48.6 22.8)" />

      <!-- Guava -->
      <circle cx="40.2" cy="26.4" r="7" [attr.fill]="guavaFill" />
      <circle cx="37.7" cy="23.8" r="1.9" fill="#FFFFFF" opacity="0.4" />

      <!-- Mango -->
      <ellipse cx="25" cy="24.2" rx="9.6" ry="6.6" [attr.fill]="mangoFill" transform="rotate(-24 25 24.2)" />
      <ellipse cx="21.5" cy="21.4" rx="2.7" ry="1.5" fill="#FFFFFF" opacity="0.45" transform="rotate(-24 21.5 21.4)" />

      <!-- Leaf motif -->
      <path
        d="M31.6 15.6 c 4.6 -3 9.2 -1 9.6 3 c -4.5 3 -8.8 1.4 -9.6 -3 z"
        fill="#1E7A3E"
        transform="rotate(-16 31.6 15.6)"
      />
      <path
        d="M31.6 15.6 c -4.1 -3.4 -8.5 -2 -9.1 2 c 4.1 3.3 8.1 2 9.1 -2 z"
        fill="#2E8B3D"
        transform="rotate(12 31.6 15.6)"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }
    svg {
      filter: drop-shadow(0 2px 4px rgb(10 47 92 / 25%));
    }
  `,
})
export class Logo {
  readonly size = input<number>(44);

  /** True when a text label sits next to the mark, so the mark itself adds nothing for a screen reader. */
  readonly decorative = input<boolean>(false);

  private readonly uid = ++logoInstance;

  readonly ringId = `kfc-logo-ring-${this.uid}`;
  readonly mangoId = `kfc-logo-mango-${this.uid}`;
  readonly guavaId = `kfc-logo-guava-${this.uid}`;

  readonly ringFill = `url(#${this.ringId})`;
  readonly mangoFill = `url(#${this.mangoId})`;
  readonly guavaFill = `url(#${this.guavaId})`;
}
