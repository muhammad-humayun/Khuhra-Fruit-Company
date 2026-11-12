import { TestBed } from '@angular/core/testing';
import { Pack } from '../data/pricing.data';
import { Product } from '../models/catalogue.model';
import { CartService } from './cart.service';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    kind: 'fruit',
    categorySlug: 'summer-fruit',
    slug: 'mango',
    nameEn: 'Mangoes',
    nameSd: 'انبو',
    descriptionEn: '',
    descriptionSd: '',
    artKey: 'mango',
    seasonMonths: [5, 6, 7, 8],
    isConfirmedByBusiness: false,
    isOriginVerified: false,
    defaultUnit: 'KG',
    sortOrder: 1,
    ...overrides,
  };
}

const ONE_KG: Pack = { label: '1 kg', labelSd: '1 ڪلو', price: 180, order: 1 };
const FIVE_KG: Pack = { label: '5 kg', labelSd: '5 ڪلو', price: 900, order: 2 };

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
    cart.clear();
  });

  it('starts empty', () => {
    expect(cart.isEmpty()).toBe(true);
    expect(cart.count()).toBe(0);
    expect(cart.subtotal()).toBe(0);
  });

  it('adds an item and totals it', () => {
    cart.add(product(), ONE_KG);

    expect(cart.count()).toBe(1);
    expect(cart.subtotal()).toBe(180);
    expect(cart.qtyOf('mango', '1 kg')).toBe(1);
  });

  it('stacks quantity on the same product and pack rather than duplicating the line', () => {
    cart.add(product(), ONE_KG);
    cart.add(product(), ONE_KG, 2);

    expect(cart.lines().length).toBe(1);
    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBe(540);
  });

  it('keeps two pack sizes of one product as separate lines', () => {
    cart.add(product(), ONE_KG, 3);
    cart.add(product(), FIVE_KG, 1);

    expect(cart.lines().length).toBe(2);
    expect(cart.count()).toBe(4);
    // 3 x 180 + 1 x 900
    expect(cart.subtotal()).toBe(1440);
  });

  it('removes the line when the quantity is stepped down to zero', () => {
    cart.add(product(), ONE_KG);
    cart.decrement('mango__1 kg');

    expect(cart.isEmpty()).toBe(true);
    expect(cart.qtyOf('mango', '1 kg')).toBe(0);
  });

  it('writes an order message listing every line and the total', () => {
    cart.add(product(), ONE_KG, 2);
    cart.add(product({ slug: 'guava', nameEn: 'Guavas', nameSd: 'ڳدرو' }), FIVE_KG);

    const message = cart.orderMessage();

    expect(message).toContain('Mangoes');
    expect(message).toContain('1 kg x 2');
    expect(message).toContain('Guavas');
    expect(message).toContain('PKR 1,260');
  });

  it('survives a reload by restoring from storage', () => {
    cart.add(product(), ONE_KG, 2);

    // Persistence runs in an effect, which flushes with change detection rather than inline.
    TestBed.tick();

    // A fresh injector reads what the previous instance persisted.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(CartService);

    expect(restored.count()).toBe(2);
    expect(restored.subtotal()).toBe(360);
  });

  it('ignores malformed stored data instead of throwing', () => {
    localStorage.setItem('kfc-cart', '{"not":"an array"}');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(CartService);

    expect(restored.isEmpty()).toBe(true);
  });
});
