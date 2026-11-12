import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Category, ProductKind } from '../../../core/models/catalogue.model';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { AdminProduct, AdminProductsService } from '../../../core/services/admin-products.service';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { AdminProductForm } from '../admin-product-form/admin-product-form';

type KindFilter = 'all' | ProductKind;

/**
 * Items and prices: the screen for adding produce and changing what it costs.
 *
 * Everything saved here goes to the database through the API, and the shop reads that same database.
 * So a price typed in here is the price a customer sees - there is no publishing step, no second copy
 * of the catalogue, and nothing to remember to sync.
 *
 * The sidebar, top bar and sign-out live in AdminShell, so this is only the page itself.
 */
@Component({
  selector: 'app-admin-items',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminProductForm],
  template: `
    <div class="adminpage">
      <header class="apage__head">
        <div>
          <h1 class="apage__title">Items &amp; Prices</h1>
          <p class="apage__sub">Everything customers can buy, and what it costs.</p>
        </div>

        <button class="btn btn--primary btn--sm" type="button" (click)="addNew()">
          + Add an item
        </button>
      </header>

      @if (flash()) {
        <p class="adminflash" role="status">{{ flash() }}</p>
      }

      @if (loadError()) {
        <p class="adminflash adminflash--bad" role="alert">{{ loadError() }}</p>
      }

      <div class="admintools">
        <input
          class="admintools__search"
          type="search"
          placeholder="Search an item by name"
          [value]="search()"
          (input)="search.set(asValue($event))"
        />

        <div class="seg" role="group" aria-label="Filter by type">
          @for (option of kindFilters; track option.value) {
            <button
              type="button"
              class="seg__btn"
              [class.is-active]="kindFilter() === option.value"
              [attr.aria-pressed]="kindFilter() === option.value"
              (click)="kindFilter.set(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>

        <label class="check check--inline">
          <input type="checkbox" [checked]="hiddenOnly()" (change)="hiddenOnly.set(asChecked($event))" />
          <span>Hidden items only</span>
        </label>
      </div>

      <p class="adminpage__count">
        {{ visible().length }} of {{ products().length }} items
        @if (unpriced() > 0) {
          &middot; {{ unpriced() }} with no price yet
        }
      </p>

      @if (loading()) {
        <p class="adminpage__empty">Loading your items…</p>
      } @else if (visible().length === 0) {
        <p class="adminpage__empty">Nothing matched. Try clearing the search or the filters.</p>
      } @else {
        <ul class="itemlist">
          @for (product of visible(); track product.id) {
            <li class="itemrow" [class.is-hidden]="!product.isActive">
              <div class="itemrow__media">
                @if (product.imageUrl) {
                  <img class="itemrow__img" [src]="product.imageUrl" alt="" loading="lazy" />
                } @else {
                  <span class="itemrow__letter" aria-hidden="true">{{ product.nameEn.charAt(0) }}</span>
                }
              </div>

              <div class="itemrow__names">
                <strong class="itemrow__name">{{ product.nameEn }}</strong>
                <span class="itemrow__sd" dir="rtl" lang="sd">{{ product.nameSd }}</span>
                <span class="itemrow__meta">
                  {{ product.kind === 'fruit' ? 'Fruit' : 'Vegetable' }} &middot;
                  {{ categoryName(product.categorySlug) }} &middot; {{ packLabel(product.packType) }}
                </span>
              </div>

              <div class="itemrow__price">
                <label class="priceedit">
                  <span class="priceedit__label">PKR</span>
                  <input
                    class="priceedit__input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    placeholder="—"
                    [value]="priceDraft(product)"
                    (input)="setPriceDraft(product.id, asValue($event))"
                  />
                </label>

                @if (isPriceChanged(product)) {
                  <button
                    class="btn btn--primary btn--xs"
                    type="button"
                    [disabled]="savingId() === product.id"
                    (click)="savePrice(product)"
                  >
                    {{ savingId() === product.id ? 'Saving…' : 'Save price' }}
                  </button>
                  <button class="btn btn--ghost btn--xs" type="button" (click)="resetPrice(product.id)">
                    Undo
                  </button>
                } @else if (product.basePrice === null) {
                  <span class="itemrow__norate">Rate on request</span>
                }
              </div>

              <div class="itemrow__actions">
                <button class="btn btn--ghost btn--xs" type="button" (click)="edit(product)">
                  Edit
                </button>
                <button
                  class="btn btn--ghost btn--xs"
                  type="button"
                  [disabled]="savingId() === product.id"
                  (click)="toggleActive(product)"
                >
                  {{ product.isActive ? 'Hide' : 'Show' }}
                </button>
              </div>
            </li>
          }
        </ul>
      }
    </div>

    @if (formOpen()) {
      <div class="adminmodal">
        <div class="adminmodal__backdrop" (click)="closeForm()"></div>
        <div class="adminmodal__panel" role="dialog" aria-modal="true" aria-label="Item details">
          <app-admin-product-form
            [product]="editing()"
            [categories]="categories()"
            (saved)="onSaved($event)"
            (cancelled)="closeForm()"
          />
        </div>
      </div>
    }
  `,
})
export class AdminItems {
  protected readonly auth = inject(AdminAuthService);
  private readonly api = inject(AdminProductsService);
  private readonly catalogue = inject(CatalogueService);
  private readonly router = inject(Router);

  protected readonly kindFilters: { value: KindFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'fruit', label: 'Fruits' },
    { value: 'vegetable', label: 'Vegetables' },
  ];

  protected readonly products = signal<readonly AdminProduct[]>([]);
  protected readonly categories = signal<readonly Category[]>([]);

  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly flash = signal<string | null>(null);
  protected readonly savingId = signal<number | null>(null);

  protected readonly search = signal('');
  protected readonly kindFilter = signal<KindFilter>('all');
  protected readonly hiddenOnly = signal(false);

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminProduct | undefined>(undefined);

  /**
   * Prices being typed, keyed by item id.
   *
   * Held apart from `products` so a half-typed number is never mistaken for a saved one: the Save
   * button appears only while a draft differs from what the server holds.
   */
  private readonly priceDrafts = signal<Record<number, string>>({});

  protected readonly unpriced = computed(
    () => this.products().filter((product) => product.basePrice === null).length,
  );

  protected readonly visible = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const kind = this.kindFilter();
    const hiddenOnly = this.hiddenOnly();

    return this.products().filter((product) => {
      if (kind !== 'all' && product.kind !== kind) {
        return false;
      }
      if (hiddenOnly && product.isActive) {
        return false;
      }
      if (needle) {
        const haystack = `${product.nameEn} ${product.localName ?? ''} ${product.slug}`.toLowerCase();
        if (!haystack.includes(needle) && !product.nameSd.includes(this.search().trim())) {
          return false;
        }
      }
      return true;
    });
  });

  constructor() {
    this.load();

    this.api.categories().subscribe({
      next: (response) => this.categories.set(response.data ?? []),
      error: () => this.loadError.set('Could not load the category list.'),
    });
  }

  protected asValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected asChecked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected categoryName(slug: string): string {
    return this.categories().find((category) => category.slug === slug)?.nameEn ?? slug;
  }

  protected packLabel(packType: string): string {
    switch (packType) {
      case 'small':
        return 'sold in grams';
      case 'dozen':
        return 'sold by the dozen';
      case 'piece':
        return 'sold by the piece';
      case 'none':
        return 'one price';
      default:
        return 'sold by the kg';
    }
  }

  protected priceDraft(product: AdminProduct): string {
    const draft = this.priceDrafts()[product.id];
    return draft ?? (product.basePrice === null ? '' : String(product.basePrice));
  }

  protected setPriceDraft(id: number, value: string): void {
    this.priceDrafts.update((drafts) => ({ ...drafts, [id]: value }));
  }

  protected isPriceChanged(product: AdminProduct): boolean {
    const draft = this.priceDrafts()[product.id];
    if (draft === undefined) {
      return false;
    }

    const saved = product.basePrice === null ? '' : String(product.basePrice);
    return draft.trim() !== saved;
  }

  protected resetPrice(id: number): void {
    this.priceDrafts.update((drafts) => {
      const next = { ...drafts };
      delete next[id];
      return next;
    });
  }

  protected savePrice(product: AdminProduct): void {
    const draft = (this.priceDrafts()[product.id] ?? '').trim();
    const price = draft === '' ? null : Number(draft);

    if (price !== null && (!Number.isFinite(price) || price <= 0)) {
      this.loadError.set('Enter a price greater than zero, or clear the box for "rate on request".');
      return;
    }

    this.savingId.set(product.id);
    this.loadError.set(null);

    this.api.updatePrice(product.id, price).subscribe({
      next: (response) => {
        this.savingId.set(null);
        this.resetPrice(product.id);
        this.applyUpdate(response.data);
        this.announce(`${product.nameEn}: ${response.message || 'price updated'}`);
      },
      error: (response: { error?: { message?: string } }) => {
        this.savingId.set(null);
        this.loadError.set(response.error?.message ?? 'The price could not be saved.');
      },
    });
  }

  protected toggleActive(product: AdminProduct): void {
    this.savingId.set(product.id);
    this.loadError.set(null);

    this.api.setActive(product.id, !product.isActive).subscribe({
      next: (response) => {
        this.savingId.set(null);
        this.applyUpdate(response.data);
        this.announce(`${product.nameEn}: ${response.message || 'updated'}`);
      },
      error: (response: { error?: { message?: string } }) => {
        this.savingId.set(null);
        this.loadError.set(response.error?.message ?? 'That could not be changed.');
      },
    });
  }

  protected addNew(): void {
    this.editing.set(undefined);
    this.formOpen.set(true);
  }

  protected edit(product: AdminProduct): void {
    this.editing.set(product);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(undefined);
  }

  protected onSaved(message: string): void {
    this.closeForm();
    this.announce(message);
    this.load();
    // Refresh the public catalogue too, so the change is already there if the shop is open in
    // another tab of this browser - or when "View shop" is clicked next.
    this.catalogue.reload();
  }

  private load(): void {
    this.loading.set(true);

    this.api.list().subscribe({
      next: (response) => {
        this.products.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (response: { status?: number }) => {
        this.loading.set(false);

        // 401 means the token has lapsed or been rejected, so start a fresh sign-in.
        if (response.status === 401) {
          this.auth.signOut();
          void this.router.navigateByUrl('/admin/login');
          return;
        }

        this.loadError.set(
          response.status === 0
            ? 'Could not reach the server. Is the API running?'
            : 'Your items could not be loaded.',
        );
      },
    });
  }

  /** Replaces one row in place, so the list does not jump after a small edit. */
  private applyUpdate(updated: AdminProduct | null): void {
    if (!updated) {
      return;
    }

    this.products.update((products) =>
      products.map((product) => (product.id === updated.id ? updated : product)),
    );

    this.catalogue.reload();
  }

  private announce(message: string): void {
    this.flash.set(message);
    setTimeout(() => this.flash.set(null), 4000);
  }
}
