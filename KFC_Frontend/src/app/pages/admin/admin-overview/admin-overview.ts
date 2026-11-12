import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS } from '../../../core/business';
import { Category } from '../../../core/models/catalogue.model';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { AdminProduct, AdminProductsService } from '../../../core/services/admin-products.service';
import { AdminUser, AdminUsersService } from '../../../core/services/admin-users.service';

/**
 * The admin landing page: what state the shop is in, at a glance.
 *
 * Everything here is counted from the same data the other screens edit, so there is no separate
 * figure to keep in step. Each number is a link to the screen that can do something about it -
 * a count of items with no price is only useful if it is one tap from fixing them.
 */
@Component({
  selector: 'app-admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="apage__head">
      <div>
        <h1 class="apage__title">Dashboard</h1>
        <p class="apage__sub">How your shop looks to customers right now.</p>
      </div>

      <a class="btn btn--primary btn--sm" routerLink="/admin/items">Manage items</a>
    </header>

    <!-- Welcome strip + readiness, mirroring the two-up hero row. -->
    <div class="agrid agrid--hero">
      <section class="acard acard--hero">
        <p class="ahero__hi">Welcome back, {{ firstName() }}</p>
        <h2 class="ahero__title">{{ business.nameEn }}</h2>
        <p class="ahero__lead">
          Add produce, set today's rates, and decide what customers can see. Anything you change here
          is live on the shop straight away.
        </p>

        <div class="ahero__foot">
          <!-- marketEn already names the city, so the city is not repeated here. -->
          <span class="ahero__site">{{ business.marketEn }}</span>
          <span class="ahero__stamp">Updated {{ lastUpdated() }}</span>
        </div>
      </section>

      <section class="acard acard--ready">
        <h3 class="acard__title">Shop readiness</h3>

        <div class="aready">
          <div class="aready__ticks">
            @for (tick of readinessTicks(); track $index) {
              <span class="aready__tick" [class.is-done]="tick">
                @if (tick) {
                  &check;
                }
              </span>
            }
          </div>

          <div class="aready__score">
            <span class="aready__num">{{ readyCount() }}</span>
            <span class="aready__of">of {{ total() }} items ready to sell</span>
          </div>
        </div>

        <p class="acard__foot">An item is ready once it has a price and a photo.</p>
      </section>
    </div>

    <!-- Stat tiles. -->
    <div class="agrid agrid--stats">
      <a class="acard astat" routerLink="/admin/items">
        <span class="astat__label">Showing on the shop</span>
        <span class="astat__num">{{ activeCount() }}</span>
        <span class="astat__hint">of {{ total() }} items</span>
      </a>

      <a class="acard astat" routerLink="/admin/items">
        <span class="astat__label">Hidden</span>
        <span class="astat__num">{{ hiddenCount() }}</span>
        <span class="astat__hint">not visible to customers</span>
      </a>

      <a class="acard astat" [class.astat--warn]="unpricedCount() > 0" routerLink="/admin/items">
        <span class="astat__label">No price yet</span>
        <span class="astat__num">{{ unpricedCount() }}</span>
        <span class="astat__hint">shown as "rate on request"</span>
      </a>

      <a class="acard astat" routerLink="/admin/users">
        <span class="astat__label">Admin users</span>
        <span class="astat__num">{{ adminCount() }}</span>
        <span class="astat__hint">can sign in here</span>
      </a>
    </div>

    <!-- The table card. -->
    <section class="acard acard--table">
      <header class="acard__head">
        <h3 class="acard__title">Your categories</h3>
        <a class="btn btn--ghost btn--xs" routerLink="/admin/items">Edit items</a>
      </header>

      @if (loading()) {
        <p class="apage__empty">Loading…</p>
      } @else {
        <div class="atable__wrap">
          <table class="atable">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th class="atable__num">Showing</th>
                <th class="atable__num">Hidden</th>
                <th class="atable__num">No price</th>
              </tr>
            </thead>
            <tbody>
              @for (row of categoryRows(); track row.slug) {
                <tr>
                  <td class="atable__name">{{ row.nameEn }}</td>
                  <td>
                    <span class="chiplet" [class.chiplet--veg]="row.kind === 'vegetable'">
                      {{ row.kind === 'fruit' ? 'Fruit' : 'Vegetable' }}
                    </span>
                  </td>
                  <td class="atable__num">{{ row.active }}</td>
                  <td class="atable__num">{{ row.hidden || '—' }}</td>
                  <td class="atable__num" [class.is-warn]="row.unpriced > 0">
                    {{ row.unpriced || '—' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <!-- Two metric cards. -->
    <div class="agrid agrid--metrics">
      <section class="acard">
        <h3 class="acard__title">Priced</h3>
        <div class="ameter">
          <div class="ameter__bar">
            <span class="ameter__fill" [style.width.%]="pricedPercent()"></span>
          </div>
          <span class="ameter__pct">{{ pricedPercent() }}%</span>
        </div>
        <p class="acard__foot">
          {{ pricedCount() }} of {{ total() }} items have a rate set. The rest show "rate on request"
          with a WhatsApp button.
        </p>
      </section>

      <section class="acard">
        <h3 class="acard__title">With a photo</h3>
        <div class="ameter">
          <div class="ameter__bar">
            <span class="ameter__fill ameter__fill--alt" [style.width.%]="photoPercent()"></span>
          </div>
          <span class="ameter__pct">{{ photoPercent() }}%</span>
        </div>
        <p class="acard__foot">
          {{ photoCount() }} of {{ total() }} items have a photograph. The rest show a lettered tile.
        </p>
      </section>
    </div>

    @if (error()) {
      <p class="adminflash adminflash--bad" role="alert">{{ error() }}</p>
    }
  `,
})
export class AdminOverview {
  private readonly auth = inject(AdminAuthService);
  private readonly products = inject(AdminProductsService);
  private readonly users = inject(AdminUsersService);

  protected readonly business = BUSINESS;

  private readonly items = signal<readonly AdminProduct[]>([]);
  private readonly categories = signal<readonly Category[]>([]);
  private readonly admins = signal<readonly AdminUser[]>([]);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly firstName = computed(
    () => (this.auth.displayName() || 'there').split(' ')[0],
  );

  protected readonly total = computed(() => this.items().length);
  protected readonly activeCount = computed(() => this.items().filter((i) => i.isActive).length);
  protected readonly hiddenCount = computed(() => this.items().filter((i) => !i.isActive).length);

  protected readonly pricedCount = computed(
    () => this.items().filter((i) => i.basePrice !== null).length,
  );

  protected readonly unpricedCount = computed(() => this.total() - this.pricedCount());

  protected readonly photoCount = computed(
    () => this.items().filter((i) => !!i.imageUrl).length,
  );

  protected readonly adminCount = computed(() => this.admins().filter((a) => a.isActive).length);

  /** Ready to sell means a customer can see a price and a picture. */
  private readonly ready = computed(
    () => this.items().filter((i) => i.isActive && i.basePrice !== null && !!i.imageUrl).length,
  );

  protected readonly readyCount = computed(() => this.ready());

  /**
   * Eight boxes standing in for the whole catalogue, filled in proportion. A tick per item would
   * be forty-odd boxes and unreadable; this reads at a glance and still tells the truth.
   *
   * Rounding down, and reserving the last box for genuinely finished, matters more than it looks:
   * 41 of 43 rounds to a full row, so the one thing the card exists to show - that there is work
   * left - would be the thing it hid.
   */
  protected readonly readinessTicks = computed(() => {
    const total = this.total();
    const ready = this.ready();

    const filled =
      total === 0 ? 0 : ready === total ? 8 : Math.min(7, Math.floor((ready / total) * 8));

    return Array.from({ length: 8 }, (_, index) => index < filled);
  });

  protected readonly pricedPercent = computed(() => percent(this.pricedCount(), this.total()));
  protected readonly photoPercent = computed(() => percent(this.photoCount(), this.total()));

  protected readonly lastUpdated = computed(() => {
    const stamps = this.items()
      .map((i) => new Date(i.updatedAt.endsWith('Z') ? i.updatedAt : `${i.updatedAt}Z`).getTime())
      .filter((t) => Number.isFinite(t));

    if (stamps.length === 0) {
      return 'never';
    }

    return new Date(Math.max(...stamps)).toLocaleDateString();
  });

  /** One row per category, counted from the items rather than stored separately. */
  protected readonly categoryRows = computed(() => {
    const items = this.items();

    return this.categories()
      .map((category) => {
        const mine = items.filter((i) => i.categorySlug === category.slug);

        return {
          slug: category.slug,
          nameEn: category.nameEn,
          kind: category.kind,
          active: mine.filter((i) => i.isActive).length,
          hidden: mine.filter((i) => !i.isActive).length,
          unpriced: mine.filter((i) => i.basePrice === null).length,
        };
      })
      .sort((a, b) => a.kind.localeCompare(b.kind) || b.active - a.active);
  });

  constructor() {
    this.products.list().subscribe({
      next: (response) => {
        this.items.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Your items could not be loaded.');
      },
    });

    this.products.categories().subscribe({
      next: (response) => this.categories.set(response.data ?? []),
      error: () => this.error.set('The category list could not be loaded.'),
    });

    this.users.list().subscribe({
      next: (response) => this.admins.set(response.data ?? []),
      // Not worth an error banner: the rest of the page is still useful without this one count.
      error: () => this.admins.set([]),
    });
  }
}

function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}
