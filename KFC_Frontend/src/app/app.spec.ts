import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { BUSINESS } from './core/business';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the business identity and a skip link', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.brand__name')?.textContent).toContain(BUSINESS.nameEn);
    expect(host.querySelector('.brand__tagline')?.textContent).toContain(BUSINESS.taglineEn);
    expect(host.querySelector('.skiplink')?.getAttribute('href')).toBe('#main');
  });

  it('points every WhatsApp action at the business WhatsApp number', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    const fab = host.querySelector('.fab') as HTMLAnchorElement | null;
    expect(fab?.href).toContain(`wa.me/${BUSINESS.whatsApp.waNumber}`);
    // The prepared message must be percent-encoded, not raw.
    expect(fab?.href).toContain('?text=');
    expect(fab?.href).not.toContain(' ');
  });
});
