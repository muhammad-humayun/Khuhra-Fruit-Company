import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';

/**
 * The frame every admin screen sits inside: sidebar, top bar, and the page itself.
 *
 * The screens used to each carry their own header, which meant the sign-out button and the links
 * between them were repeated and had to be kept in step. Here they are written once, each child
 * screen is only its own content, and the sidebar can show which one you are on.
 *
 * The icons are inline SVG rather than an icon font or a package. Three small shapes are not worth
 * a dependency, and drawn this way they inherit the link's colour, so the active state needs no
 * second rule. They are written out in the template rather than bound through `innerHTML`, because
 * Angular's sanitizer strips SVG from bound HTML - the alternative would be to bypass sanitization,
 * which is not a habit worth forming for decoration.
 */
@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="ashell" [class.is-navopen]="navOpen()">
      <aside class="ashell__side">
        <div class="aside__head">
          <span class="aside__headLabel">Menu</span>
          <button
            class="aside__burger"
            type="button"
            aria-label="Close menu"
            (click)="navOpen.set(false)"
          >
            <span class="aside__burgerBar"></span>
            <span class="aside__burgerBar"></span>
            <span class="aside__burgerBar"></span>
          </button>
        </div>

        <nav class="anav" aria-label="Admin sections">
          <a
            class="anav__item"
            routerLink="/admin"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="is-active"
          >
            <span class="anav__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </span>
            <span class="anav__label">Dashboard</span>
          </a>

          <a class="anav__item" routerLink="/admin/items" routerLinkActive="is-active">
            <span class="anav__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
                <path d="m3 8 9 5 9-5" />
                <path d="M12 13v8" />
              </svg>
            </span>
            <span class="anav__label">Items &amp; Prices</span>
          </a>

          <a class="anav__item" routerLink="/admin/users" routerLinkActive="is-active">
            <span class="anav__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                <path d="M17 5.3a3.5 3.5 0 0 1 0 6.4" />
                <path d="M18.5 20a6.3 6.3 0 0 0-3-5.4" />
              </svg>
            </span>
            <span class="anav__label">Admin Users</span>
          </a>

          <p class="anav__group">Shop</p>

          <a class="anav__item" routerLink="/">
            <span class="anav__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9h18l-1.2-4.2A1.5 1.5 0 0 0 18.4 4H5.6a1.5 1.5 0 0 0-1.4 1.1Z" />
                <path d="M4.5 9v10a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V9" />
                <path d="M9.5 20.5V14h5v6.5" />
              </svg>
            </span>
            <span class="anav__label">View Shop</span>
          </a>

          <p class="anav__group">Account</p>

          <button class="anav__item anav__item--btn" type="button" (click)="signOut()">
            <span class="anav__ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </span>
            <span class="anav__label">Sign out</span>
          </button>
        </nav>
      </aside>

      <!-- Closes the sidebar when it is overlaying the page on a phone. -->
      <div class="ashell__scrim" (click)="navOpen.set(false)"></div>

      <div class="ashell__main">
        <header class="atop">
          <button
            class="atop__burger"
            type="button"
            aria-label="Open menu"
            (click)="navOpen.set(true)"
          >
            <span class="aside__burgerBar"></span>
            <span class="aside__burgerBar"></span>
            <span class="aside__burgerBar"></span>
          </button>

          <span class="atop__brand">KHUHRA FRUIT COMPANY</span>

          <div class="atop__user">
            <span class="atop__userName">{{ displayName() }}</span>
            <span class="atop__avatar" aria-hidden="true">{{ initial() }}</span>
          </div>
        </header>

        <main class="ashell__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminShell {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  /** Only matters on a phone, where the sidebar overlays the page instead of sitting beside it. */
  protected readonly navOpen = signal(false);

  protected readonly displayName = computed(
    () => this.auth.displayName() || this.auth.admin()?.email || 'Admin',
  );

  protected readonly initial = computed(() => this.displayName().charAt(0).toUpperCase());

  constructor() {
    // Any navigation closes the overlay, including the browser's back button.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.navOpen.set(false);
      }
    });
  }

  protected signOut(): void {
    this.auth.signOut();
    void this.router.navigateByUrl('/admin/login');
  }
}
