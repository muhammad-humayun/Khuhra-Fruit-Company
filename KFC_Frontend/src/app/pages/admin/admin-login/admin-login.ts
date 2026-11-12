import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { Logo } from '../../../shared/logo/logo';

/**
 * Admin sign-in.
 *
 * This screen only signs in. There is no registration form: the admin account is created once,
 * directly against the API, and from then on the only thing anyone needs here is a way in. Taking
 * the form away also means a stranger who finds this page has nothing to fill in but a password
 * they do not know.
 *
 * The account can be re-created if it is ever lost - `/api/auth/register` is still there and still
 * works, but only while no admin exists. See the AuthController for that rule.
 */
@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo],
  template: `
    <div class="adminauth">
      <div class="adminauth__card">
        <a class="adminauth__brand" routerLink="/" aria-label="Khuhra Fruit Company home">
          <app-logo [size]="44" />
          <span class="adminauth__brandText">Khuhra Fruit Company</span>
        </a>

        <h1 class="adminauth__title">Shop setup</h1>

        <p class="adminauth__lead">Sign in to add items and change prices.</p>

        @if (notConfigured()) {
          <div class="adminauth__alert" role="alert">
            <strong>Sign-in is not switched on yet.</strong>
            The server needs <code>Auth:SigningKey</code> set before an admin can sign in. See
            <code>appsettings.json</code> for how to set it.
          </div>
        }

        <form class="adminauth__form" (submit)="submit($event)">
          <label class="field">
            <span class="field__label">Email</span>
            <input
              class="field__input"
              type="email"
              name="email"
              autocomplete="username"
              required
              [value]="email()"
              (input)="email.set(asValue($event))"
            />
          </label>

          <label class="field">
            <span class="field__label">Password</span>
            <input
              class="field__input"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              [value]="password()"
              (input)="password.set(asValue($event))"
            />
          </label>

          @if (error()) {
            <p class="adminauth__error" role="alert">{{ error() }}</p>
          }

          <button class="btn btn--primary adminauth__submit" type="submit" [disabled]="busy()">
            @if (busy()) {
              Please wait…
            } @else {
              Sign in
            }
          </button>
        </form>

        <a class="adminauth__back" routerLink="/">Back to the shop</a>
      </div>
    </div>
  `,
})
export class AdminLogin {
  /** Where to go after signing in, from `?next=`. Set by the route guard. */
  readonly next = input<string | undefined>(undefined);

  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Null until `/api/auth/status` answers. */
  private readonly configured = signal<boolean | null>(null);

  /**
   * Shown when the server has no signing key. Without this the screen would simply reject every
   * password with no hint that the fault is in the server's configuration, not the password.
   */
  protected readonly notConfigured = computed(() => this.configured() === false);

  constructor() {
    // Already signed in? Go straight through rather than showing a pointless form.
    if (this.auth.isSignedIn()) {
      void this.router.navigateByUrl('/admin');
      return;
    }

    this.auth.status().subscribe({
      next: (response) => this.configured.set(response.data?.configured ?? false),
      error: () => this.error.set('Could not reach the server. Is the API running?'),
    });
  }

  protected asValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected submit(event: Event): void {
    event.preventDefault();

    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.error.set(null);

    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: (response) => {
        this.busy.set(false);

        if (!response.data) {
          this.error.set(response.message || 'That did not work. Please try again.');
          return;
        }

        this.auth.accept(response.data);
        this.password.set('');
        void this.router.navigateByUrl(this.next() || '/admin');
      },
      error: (response: { error?: { message?: string }; status?: number }) => {
        this.busy.set(false);

        // The API's own message is written for the admin to read, so prefer it.
        this.error.set(
          response.error?.message ??
            (response.status === 0
              ? 'Could not reach the server. Is the API running?'
              : 'That did not work. Please try again.'),
        );
      },
    });
  }
}
