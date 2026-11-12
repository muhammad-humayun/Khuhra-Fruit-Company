import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { APP_CONFIG } from '../config/app-config';
import { AdminAuthService } from '../services/admin-auth.service';
import { authInterceptor } from './auth.interceptor';

const TOKEN = 'a.fake.token';

/**
 * The interceptor decides who is handed the admin's credential, so these tests are about what must
 * NOT happen as much as what must.
 */
describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AdminAuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AdminAuthService);

    auth.accept({
      token: TOKEN,
      email: 'owner@example.com',
      displayName: 'Owner',
      expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  });

  function headerOn(url: string): string | null {
    http.get(url).subscribe({ next: () => {}, error: () => {} });
    const request = controller.expectOne(url);
    const header = request.request.headers.get('Authorization');
    request.flush({});
    return header;
  }

  it('attaches the token to our own admin calls', () => {
    expect(headerOn(`${APP_CONFIG.apiBaseUrl}/api/admin/products`)).toBe(`Bearer ${TOKEN}`);
  });

  it('attaches it to a same-origin admin call too', () => {
    expect(headerOn('/api/admin/products/7/price')).toBe(`Bearer ${TOKEN}`);
  });

  /**
   * The whole point of the URL check. A token on an image request would hand the admin's credential
   * to a server that has no business holding it, and nothing on screen would look wrong.
   */
  it('never sends the token to a third-party host', () => {
    expect(headerOn('https://upload.wikimedia.org/wikipedia/commons/guava.jpg')).toBeNull();
  });

  it('does not send the token on public catalogue calls', () => {
    expect(headerOn(`${APP_CONFIG.apiBaseUrl}/api/products`)).toBeNull();
    expect(headerOn(`${APP_CONFIG.apiBaseUrl}/api/categories`)).toBeNull();
  });

  /** A lookalike host must not be mistaken for ours just because the path matches. */
  it('is not fooled by another host using the same path', () => {
    expect(headerOn('https://evil.example.com/api/admin/products')).toBeNull();
  });

  it('sends nothing once signed out', () => {
    auth.signOut();
    expect(headerOn(`${APP_CONFIG.apiBaseUrl}/api/admin/products`)).toBeNull();
  });

  /**
   * The expired session has to come from storage, not from `accept`. A token the server has just
   * issued is never treated as expired - see admin-auth.service.spec.ts for why.
   */
  it('sends nothing when a restored session has expired', () => {
    localStorage.setItem(
      'kfc-admin-session',
      JSON.stringify({
        token: TOKEN,
        email: 'owner@example.com',
        displayName: 'Owner',
        expiresAt: Date.now() - 1000,
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);

    expect(TestBed.inject(AdminAuthService).isSignedIn()).toBe(false);
    expect(headerOn(`${APP_CONFIG.apiBaseUrl}/api/admin/products`)).toBeNull();
  });
});
