import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { AdminUser, AdminUsersService } from '../../../core/services/admin-users.service';

/**
 * Who can get into the shop setup screens.
 *
 * Every account added here has exactly the same powers as the one that added it, including adding
 * and removing other admins. The screen says so plainly rather than leaving it to be discovered.
 */
@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="adminpage">
      <header class="apage__head">
        <div>
          <h1 class="apage__title">Admin Users</h1>
          <p class="apage__sub">Who can sign in and change the shop.</p>
        </div>

        <button class="btn btn--primary btn--sm" type="button" (click)="openForm()">
          + Add an admin
        </button>
      </header>

      @if (flash()) {
        <p class="adminflash" role="status">{{ flash() }}</p>
      }

      @if (error()) {
        <p class="adminflash adminflash--bad" role="alert">{{ error() }}</p>
      }

      <div class="admintools">
        <p class="adminpage__count">
          {{ activeCount() }} can sign in
          @if (disabledCount() > 0) {
            &middot; {{ disabledCount() }} switched off
          }
        </p>
      </div>

      @if (loading()) {
        <p class="adminpage__empty">Loading…</p>
      } @else {
        <ul class="itemlist">
          @for (user of users(); track user.id) {
            <li class="itemrow itemrow--user" [class.is-hidden]="!user.isActive">
              <div class="itemrow__media">
                <span class="itemrow__letter" aria-hidden="true">
                  {{ user.displayName.charAt(0) }}
                </span>
              </div>

              <div class="itemrow__names">
                <strong class="itemrow__name">
                  {{ user.displayName }}
                  @if (user.id === myId()) {
                    <span class="tag tag--you">you</span>
                  }
                  @if (!user.isActive) {
                    <span class="tag tag--off">no access</span>
                  }
                </strong>
                <span class="itemrow__meta">{{ user.email }}</span>
                <span class="itemrow__meta">
                  Added {{ shortDate(user.createdAt) }} &middot;
                  {{ user.lastLoginAt ? 'last signed in ' + shortDate(user.lastLoginAt) : 'never signed in' }}
                </span>
              </div>

              <div class="itemrow__actions">
                @if (user.id === myId()) {
                  <span class="itemrow__norate">Ask another admin to remove your access</span>
                } @else {
                  <button
                    class="btn btn--ghost btn--xs"
                    type="button"
                    [disabled]="savingId() === user.id"
                    (click)="toggle(user)"
                  >
                    {{ user.isActive ? 'Remove access' : 'Restore access' }}
                  </button>
                }
              </div>
            </li>
          }
        </ul>
      }
    </div>

    @if (formOpen()) {
      <div class="adminmodal">
        <div class="adminmodal__backdrop" (click)="closeForm()"></div>
        <div class="adminmodal__panel adminmodal__panel--narrow" role="dialog" aria-modal="true">
          <form class="apform" (submit)="create($event)">
            <header class="apform__head">
              <h2 class="apform__title">Add an admin</h2>
              <button class="apform__close" type="button" aria-label="Close" (click)="closeForm()">
                &times;
              </button>
            </header>

            <div class="apform__body">
              <p class="apform__note">
                This person will be able to do everything you can: add items, change prices, and add
                or remove other admins. There are no lesser roles yet.
              </p>

              <label class="field">
                <span class="field__label">Name</span>
                <input
                  class="field__input"
                  type="text"
                  required
                  maxlength="120"
                  [value]="newName()"
                  (input)="newName.set(asValue($event))"
                />
              </label>

              <label class="field">
                <span class="field__label">Email</span>
                <input
                  class="field__input"
                  type="email"
                  autocomplete="off"
                  required
                  [value]="newEmail()"
                  (input)="newEmail.set(asValue($event))"
                />
                <span class="field__hint">This is what they sign in with.</span>
              </label>

              <label class="field">
                <span class="field__label">First password</span>
                <input
                  class="field__input"
                  type="text"
                  autocomplete="off"
                  required
                  minlength="8"
                  [value]="newPassword()"
                  (input)="newPassword.set(asValue($event))"
                />
                <span class="field__hint">
                  At least 8 characters. Give it to them yourself - the server keeps only a one-way
                  hash, so nobody can read it back later, including you.
                </span>
              </label>

              @if (formError()) {
                <p class="apform__error" role="alert">{{ formError() }}</p>
              }
            </div>

            <footer class="apform__foot">
              <button class="btn btn--ghost" type="button" (click)="closeForm()">Cancel</button>
              <button class="btn btn--primary" type="submit" [disabled]="busy()">
                {{ busy() ? 'Adding…' : 'Add admin' }}
              </button>
            </footer>
          </form>
        </div>
      </div>
    }
  `,
})
export class AdminUsers {
  protected readonly auth = inject(AdminAuthService);
  private readonly api = inject(AdminUsersService);
  private readonly router = inject(Router);

  protected readonly users = signal<readonly AdminUser[]>([]);
  protected readonly myId = signal<number | null>(null);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly flash = signal<string | null>(null);
  protected readonly savingId = signal<number | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly newName = signal('');
  protected readonly newEmail = signal('');
  protected readonly newPassword = signal('');

  protected readonly activeCount = computed(() => this.users().filter((u) => u.isActive).length);
  protected readonly disabledCount = computed(() => this.users().filter((u) => !u.isActive).length);

  constructor() {
    this.load();

    this.api.me().subscribe({
      next: (response) => this.myId.set(response.data?.id ?? null),
      error: () => this.myId.set(null),
    });
  }

  protected asValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected shortDate(iso: string): string {
    const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  }

  protected openForm(): void {
    this.newName.set('');
    this.newEmail.set('');
    this.newPassword.set('');
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    // Clear it rather than leave a password sitting in memory behind a closed panel.
    this.newPassword.set('');
  }

  protected create(event: Event): void {
    event.preventDefault();

    if (this.busy()) {
      return;
    }

    if (this.newPassword().length < 8) {
      this.formError.set('The password needs at least 8 characters.');
      return;
    }

    this.busy.set(true);
    this.formError.set(null);

    this.api
      .create({
        displayName: this.newName().trim(),
        email: this.newEmail().trim(),
        password: this.newPassword(),
      })
      .subscribe({
        next: (response) => {
          this.busy.set(false);
          this.users.set(response.data ?? this.users());
          this.closeForm();
          this.announce(response.message || 'Admin added.');
        },
        error: (response: { error?: { message?: string }; status?: number }) => {
          this.busy.set(false);
          this.formError.set(
            response.error?.message ??
              (response.status === 0
                ? 'Could not reach the server. Is the API running?'
                : 'That admin could not be added.'),
          );
        },
      });
  }

  protected toggle(user: AdminUser): void {
    this.savingId.set(user.id);
    this.error.set(null);

    this.api.setActive(user.id, !user.isActive).subscribe({
      next: (response) => {
        this.savingId.set(null);
        this.users.set(response.data ?? this.users());
        this.announce(`${user.displayName}: ${response.message || 'updated'}`);
      },
      error: (response: { error?: { message?: string } }) => {
        this.savingId.set(null);
        this.error.set(response.error?.message ?? 'That could not be changed.');
      },
    });
  }

  private load(): void {
    this.loading.set(true);

    this.api.list().subscribe({
      next: (response) => {
        this.users.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (response: { status?: number }) => {
        this.loading.set(false);

        if (response.status === 401) {
          this.auth.signOut();
          void this.router.navigateByUrl('/admin/login');
          return;
        }

        this.error.set(
          response.status === 0
            ? 'Could not reach the server. Is the API running?'
            : 'The admin list could not be loaded.',
        );
      },
    });
  }

  private announce(message: string): void {
    this.flash.set(message);
    setTimeout(() => this.flash.set(null), 6000);
  }
}
