import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Category, PackType, ProductKind } from '../../../core/models/catalogue.model';
import {
  AdminProduct,
  AdminProductsService,
  ProductSaveRequest,
} from '../../../core/services/admin-products.service';

/** The pack ladder each choice produces on the shop card, shown as a hint under the dropdown. */
const PACK_HINTS: Record<PackType, string> = {
  kg: 'Shopper picks 1 kg, 5 kg or a 40 kg maund. The price you type is the 1 kg price.',
  small: 'Shopper picks 250 g, 500 g or 1 kg. The price you type is the 1 kg price.',
  dozen: 'Shopper picks 1 or 2 dozen. The price you type is for one dozen.',
  piece: 'Shopper picks 1 or 3 pieces. The price you type is for one piece.',
  none: 'One price, no pack choice. Use this for anything sold however it arrives.',
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Add or edit one item.
 *
 * Passing `product` puts it in edit mode; passing nothing adds a new item. The parent decides which,
 * so this component has no idea where its data came from and can be reused anywhere.
 */
@Component({
  selector: 'app-admin-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="apform" (submit)="submit($event)">
      <header class="apform__head">
        <h2 class="apform__title">{{ product() ? 'Edit item' : 'Add an item' }}</h2>
        <button class="apform__close" type="button" aria-label="Close" (click)="cancelled.emit()">
          &times;
        </button>
      </header>

      <div class="apform__body">
        <fieldset class="apform__group">
          <legend class="apform__legend">What is it?</legend>

          <div class="apform__row">
            <div class="field">
              <span class="field__label">Type</span>
              <div class="seg" role="group" aria-label="Type">
                <button
                  type="button"
                  class="seg__btn"
                  [class.is-active]="kind() === 'fruit'"
                  [attr.aria-pressed]="kind() === 'fruit'"
                  (click)="setKind('fruit')"
                >
                  Fruit
                </button>
                <button
                  type="button"
                  class="seg__btn"
                  [class.is-active]="kind() === 'vegetable'"
                  [attr.aria-pressed]="kind() === 'vegetable'"
                  (click)="setKind('vegetable')"
                >
                  Vegetable
                </button>
              </div>
            </div>

            <label class="field">
              <span class="field__label">Category</span>
              <select
                class="field__input"
                required
                [value]="categorySlug()"
                (change)="categorySlug.set(asValue($event))"
              >
                <option value="" disabled>Choose a category</option>
                @for (category of categoriesForKind(); track category.slug) {
                  <option [value]="category.slug">{{ category.nameEn }}</option>
                }
              </select>
              <span class="field__hint">Which group it appears under on the shop page.</span>
            </label>
          </div>

          <div class="apform__row">
            <label class="field">
              <span class="field__label">Name (English)</span>
              <input
                class="field__input"
                type="text"
                required
                maxlength="120"
                [value]="nameEn()"
                (input)="nameEn.set(asValue($event))"
              />
            </label>

            <label class="field">
              <span class="field__label">Name (Sindhi)</span>
              <input
                class="field__input field__input--sd"
                type="text"
                dir="rtl"
                lang="sd"
                required
                maxlength="120"
                [value]="nameSd()"
                (input)="nameSd.set(asValue($event))"
              />
            </label>
          </div>

          <label class="field">
            <span class="field__label">Local name <span class="field__opt">optional</span></span>
            <input
              class="field__input"
              type="text"
              maxlength="120"
              placeholder="e.g. Amrood, Tamatar"
              [value]="localName()"
              (input)="localName.set(asValue($event))"
            />
            <span class="field__hint">How it is asked for in the mandi. Used by the search box.</span>
          </label>
        </fieldset>

        <fieldset class="apform__group">
          <legend class="apform__legend">Price</legend>

          <div class="apform__row">
            <label class="field">
              <span class="field__label">How is it sold?</span>
              <select
                class="field__input"
                [value]="packType()"
                (change)="setPackType(asValue($event))"
              >
                <option value="kg">By weight (kg)</option>
                <option value="small">Small quantities (grams)</option>
                <option value="dozen">By the dozen</option>
                <option value="piece">By the piece</option>
                <option value="none">One price only</option>
              </select>
            </label>

            <label class="field">
              <span class="field__label">
                Price in PKR <span class="field__opt">leave empty for "rate on request"</span>
              </span>
              <input
                class="field__input"
                type="number"
                min="0"
                step="0.01"
                inputmode="decimal"
                placeholder="e.g. 150"
                [value]="basePrice()"
                (input)="basePrice.set(asValue($event))"
              />
            </label>
          </div>

          <p class="apform__note">{{ packHint() }}</p>
        </fieldset>

        <fieldset class="apform__group">
          <legend class="apform__legend">Photo and season</legend>

          <label class="field">
            <span class="field__label">Photo address <span class="field__opt">optional</span></span>
            <input
              class="field__input"
              type="url"
              maxlength="600"
              placeholder="https://…"
              [value]="imageUrl()"
              (input)="imageUrl.set(asValue($event))"
            />
            <span class="field__hint">
              A full web address for the photograph. Leave it empty and the card shows a lettered
              tile instead.
            </span>
          </label>

          @if (imageUrl()) {
            <img class="apform__preview" [src]="imageUrl()" alt="" />
          }

          <div class="field">
            <span class="field__label">
              In season <span class="field__opt">leave all off for year round</span>
            </span>
            <div class="months">
              @for (month of months; track $index) {
                <button
                  type="button"
                  class="months__btn"
                  [class.is-active]="selectedMonths().includes($index + 1)"
                  [attr.aria-pressed]="selectedMonths().includes($index + 1)"
                  (click)="toggleMonth($index + 1)"
                >
                  {{ month }}
                </button>
              }
            </div>
          </div>
        </fieldset>

        <fieldset class="apform__group">
          <legend class="apform__legend">
            Description <span class="field__opt">optional</span>
          </legend>

          <div class="apform__row">
            <label class="field">
              <span class="field__label">English</span>
              <textarea
                class="field__input field__input--area"
                rows="3"
                maxlength="600"
                [value]="descriptionEn()"
                (input)="descriptionEn.set(asValue($event))"
              ></textarea>
            </label>

            <label class="field">
              <span class="field__label">Sindhi</span>
              <textarea
                class="field__input field__input--area field__input--sd"
                rows="3"
                dir="rtl"
                lang="sd"
                maxlength="600"
                [value]="descriptionSd()"
                (input)="descriptionSd.set(asValue($event))"
              ></textarea>
            </label>
          </div>
        </fieldset>

        <fieldset class="apform__group">
          <legend class="apform__legend">On the shop page</legend>

          <div class="apform__row">
            <label class="field">
              <span class="field__label">Position</span>
              <input
                class="field__input"
                type="number"
                min="0"
                max="9999"
                [value]="sortOrder()"
                (input)="sortOrder.set(asValue($event))"
              />
              <span class="field__hint">
                Smaller numbers come first. Use 1 for whatever you want shoppers to see at the top.
              </span>
            </label>

            <label class="check">
              <input
                type="checkbox"
                [checked]="isActive()"
                (change)="isActive.set(asChecked($event))"
              />
              <span>Show this item in the shop</span>
            </label>
          </div>
        </fieldset>

        @if (error()) {
          <p class="apform__error" role="alert">{{ error() }}</p>
        }
      </div>

      <footer class="apform__foot">
        <button class="btn btn--ghost" type="button" (click)="cancelled.emit()">Cancel</button>
        <button class="btn btn--primary" type="submit" [disabled]="busy()">
          @if (busy()) {
            Saving…
          } @else {
            {{ product() ? 'Save changes' : 'Add item' }}
          }
        </button>
      </footer>
    </form>
  `,
})
export class AdminProductForm {
  /** The item being edited, or undefined when adding a new one. */
  readonly product = input<AdminProduct | undefined>(undefined);

  /** Offered in the category dropdown; supplied by the parent so it is fetched only once. */
  readonly categories = input.required<readonly Category[]>();

  /** Fires once the item has been saved, carrying the API's confirmation message. */
  readonly saved = output<string>();
  readonly cancelled = output<void>();

  private readonly api = inject(AdminProductsService);

  protected readonly months = MONTHS;

  protected readonly kind = signal<ProductKind>('fruit');
  protected readonly categorySlug = signal('');
  protected readonly nameEn = signal('');
  protected readonly nameSd = signal('');
  protected readonly localName = signal('');
  protected readonly packType = signal<PackType>('kg');
  protected readonly basePrice = signal('');
  protected readonly imageUrl = signal('');
  protected readonly descriptionEn = signal('');
  protected readonly descriptionSd = signal('');
  protected readonly sortOrder = signal('50');
  protected readonly isActive = signal(true);
  protected readonly selectedMonths = signal<readonly number[]>([]);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly categoriesForKind = computed(() =>
    this.categories()
      .filter((category) => category.kind === this.kind())
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  protected readonly packHint = computed(() => PACK_HINTS[this.packType()]);

  constructor() {
    // Fills the form from the item being edited. An effect rather than constructor code, because
    // `product` is an input and inputs are not readable until the component has been bound.
    effect(() => {
      const product = this.product();
      if (!product) {
        return;
      }

      this.kind.set(product.kind);
      this.categorySlug.set(product.categorySlug);
      this.nameEn.set(product.nameEn);
      this.nameSd.set(product.nameSd);
      this.localName.set(product.localName ?? '');
      this.packType.set(product.packType);
      this.basePrice.set(product.basePrice === null ? '' : String(product.basePrice));
      this.imageUrl.set(product.imageUrl ?? '');
      this.descriptionEn.set(product.descriptionEn ?? '');
      this.descriptionSd.set(product.descriptionSd ?? '');
      this.sortOrder.set(String(product.sortOrder));
      this.isActive.set(product.isActive);
      this.selectedMonths.set(parseMonths(product.seasonMonths));
    });
  }

  protected asValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  protected asChecked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected setPackType(value: string): void {
    this.packType.set(value as PackType);
  }

  /** Switching type clears the category, because a fruit cannot sit in a vegetable group. */
  protected setKind(kind: ProductKind): void {
    if (this.kind() === kind) {
      return;
    }

    this.kind.set(kind);
    this.categorySlug.set('');
  }

  protected toggleMonth(month: number): void {
    const current = this.selectedMonths();

    this.selectedMonths.set(
      current.includes(month)
        ? current.filter((m) => m !== month)
        : [...current, month].sort((a, b) => a - b),
    );
  }

  protected submit(event: Event): void {
    event.preventDefault();

    if (this.busy()) {
      return;
    }

    if (!this.categorySlug()) {
      this.error.set('Choose a category for this item.');
      return;
    }

    const price = this.basePrice().trim();
    const parsedPrice = price === '' ? null : Number(price);

    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice <= 0)) {
      this.error.set('Enter a price greater than zero, or leave it empty for "rate on request".');
      return;
    }

    const request: ProductSaveRequest = {
      kind: this.kind(),
      categorySlug: this.categorySlug(),
      nameEn: this.nameEn().trim(),
      nameSd: this.nameSd().trim(),
      localName: blankToNull(this.localName()),
      descriptionEn: blankToNull(this.descriptionEn()),
      descriptionSd: blankToNull(this.descriptionSd()),
      imageUrl: blankToNull(this.imageUrl()),
      seasonMonths: this.selectedMonths().join(','),
      basePrice: parsedPrice,
      packType: this.packType(),
      isActive: this.isActive(),
      sortOrder: Number(this.sortOrder()) || 50,
    };

    this.busy.set(true);
    this.error.set(null);

    const existing = this.product();
    const call = existing ? this.api.update(existing.id, request) : this.api.create(request);

    call.subscribe({
      next: (response) => {
        this.busy.set(false);
        this.saved.emit(response.message || 'Saved.');
      },
      error: (response: { error?: { message?: string }; status?: number }) => {
        this.busy.set(false);
        this.error.set(
          response.error?.message ??
            (response.status === 0
              ? 'Could not reach the server. Is the API running?'
              : 'That could not be saved. Please check the fields and try again.'),
        );
      },
    });
  }
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function parseMonths(raw: string | null): number[] {
  return (raw ?? '')
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);
}
