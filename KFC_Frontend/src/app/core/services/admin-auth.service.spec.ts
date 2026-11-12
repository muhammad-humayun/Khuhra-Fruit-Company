import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AdminAuthService } from './admin-auth.service';

/**
 * These are all about one failure: the admin registers or signs in successfully, and is then thrown
 * straight back to the sign-in page because the session looked expired on arrival. It looks exactly
 * like "registering did not work", while the real cause is a misread date.
 */
describe('AdminAuthService session expiry', () => {
  let auth: AdminAuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    auth = TestBed.inject(AdminAuthService);
  });

  function accept(expiresAtUtc: string) {
    auth.accept({ token: 't', email: 'owner@example.com', displayName: 'Owner', expiresAtUtc });
  }

  it('signs in with a normal UTC timestamp', () => {
    accept(new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString());

    expect(auth.isSignedIn()).toBe(true);
    expect(auth.token()).toBe('t');
  });

  /**
   * The timezone trap. A zone-less timestamp is read as local time, so east of UTC it lands hours
   * early - in Pakistan, five. A short-lived token would then look expired the instant it arrived.
   */
  it('treats a timestamp with no zone marker as UTC', () => {
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
    // What .NET sends when the DateTime has no Kind: no trailing Z.
    const zoneless = inTwoHours.toISOString().replace('Z', '');

    accept(zoneless);

    expect(auth.isSignedIn()).toBe(true);
  });

  it('accepts an offset-qualified timestamp unchanged', () => {
    const future = new Date(Date.now() + 4 * 60 * 60 * 1000)
      .toISOString()
      .replace('Z', '+00:00');

    accept(future);

    expect(auth.isSignedIn()).toBe(true);
  });

  it('keeps the admin signed in when the date cannot be read at all', () => {
    // NaN compares false against everything, so without a fallback this reads as "expired".
    accept('not a date');

    expect(auth.isSignedIn()).toBe(true);
  });

  it('keeps the admin signed in when the date is missing', () => {
    accept('');

    expect(auth.isSignedIn()).toBe(true);
  });

  /** A server never issues an already-expired token, so a past date means the string was misread. */
  it('does not treat a freshly issued token as expired', () => {
    accept(new Date(Date.now() - 60 * 60 * 1000).toISOString());

    expect(auth.isSignedIn()).toBe(true);
  });

  /**
   * The other half: a session restored from a previous visit really can have run out, so that one
   * stays strict. Being forgiving there would leave a dead token in place forever.
   */
  it('discards a stored session that has genuinely expired', () => {
    localStorage.setItem(
      'kfc-admin-session',
      JSON.stringify({
        token: 't',
        email: 'owner@example.com',
        displayName: 'Owner',
        expiresAt: Date.now() - 1000,
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    expect(TestBed.inject(AdminAuthService).isSignedIn()).toBe(false);
  });

  it('restores a stored session that is still valid', () => {
    localStorage.setItem(
      'kfc-admin-session',
      JSON.stringify({
        token: 'stored',
        email: 'owner@example.com',
        displayName: 'Owner',
        expiresAt: Date.now() + 60 * 60 * 1000,
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const restored = TestBed.inject(AdminAuthService);
    expect(restored.isSignedIn()).toBe(true);
    expect(restored.displayName()).toBe('Owner');
  });

  it('forgets everything on sign out', () => {
    accept(new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString());
    auth.signOut();

    expect(auth.isSignedIn()).toBe(false);
    expect(auth.token()).toBeNull();
    expect(localStorage.getItem('kfc-admin-session')).toBeNull();
  });
});
