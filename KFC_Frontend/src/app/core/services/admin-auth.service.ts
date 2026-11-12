import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

/** The envelope every API controller returns (BOL_ApiResponse&lt;T&gt;). */
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

/** What /api/auth/login and /api/auth/register send back. */
interface AuthResult {
  token: string;
  email: string;
  displayName: string;
  expiresAtUtc: string;
}

/** What /api/auth/status reports, so the screen knows which form to show. */
export interface AuthStatus {
  /** False when the server has no signing key, so sign-in cannot work at all. */
  configured: boolean;
  /** True once an admin account exists, so the screen offers Login rather than Register. */
  hasAdmin: boolean;
}

/** The signed-in admin, as held in this browser. */
export interface AdminSession {
  token: string;
  email: string;
  displayName: string;
  /** Milliseconds since the epoch. */
  expiresAt: number;
}

const STORAGE_KEY = 'kfc-admin-session';

/**
 * Admin sign-in.
 *
 * ## What a token is, and why this is safe
 *
 * The password is sent once, to `/api/auth/login`. The server checks it against a hash - it never
 * stores the password itself - and replies with a *token*: a short string signed with a secret that
 * only the server knows. Every later request carries that token instead of the password.
 *
 * Nothing secret is kept in the browser beyond the token, and the token expires on its own. It also
 * cannot be edited: changing even one character breaks the signature and the server rejects it. So
 * a shopper cannot promote themselves to admin by fiddling with what is in localStorage.
 *
 * ## Why the expiry is checked here as well as on the server
 *
 * The server is the real guard - it validates every token on every request. The check here is only
 * so the screen can log the admin out politely instead of letting them fill in a long form and
 * discover at the end that their session had lapsed.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  private readonly session = signal<AdminSession | null>(readStoredSession());

  /** Null when nobody is signed in. */
  readonly admin = computed(() => this.session());

  readonly isSignedIn = computed(() => {
    const session = this.session();
    return session !== null && session.expiresAt > Date.now();
  });

  readonly displayName = computed(() => this.session()?.displayName ?? '');

  /** Read by the interceptor on every outgoing admin request. */
  token(): string | null {
    const session = this.session();
    return session && session.expiresAt > Date.now() ? session.token : null;
  }

  /** Tells the sign-in screen whether to offer Register or Login. */
  status() {
    return this.http.get<ApiResponse<AuthStatus>>(`${APP_CONFIG.apiBaseUrl}/api/auth/status`);
  }

  login(email: string, password: string) {
    return this.http.post<ApiResponse<AuthResult>>(`${APP_CONFIG.apiBaseUrl}/api/auth/login`, {
      email,
      password,
    });
  }

  /**
   * Creates the admin account.
   *
   * Nothing in the UI calls this today - the sign-in screen has no registration form, because the
   * account is made once and then only signed into. It is kept so the screen can be brought back
   * without rebuilding the plumbing, and because it is the same call used to re-create the account
   * if it is ever lost.
   *
   * The server allows this only while no admin exists. That check lives there, not here - hiding
   * the form in the browser would be no protection, since anyone can edit what runs in their own
   * browser and call the endpoint directly.
   */
  register(email: string, password: string, displayName: string) {
    return this.http.post<ApiResponse<AuthResult>>(`${APP_CONFIG.apiBaseUrl}/api/auth/register`, {
      email,
      password,
      displayName,
    });
  }

  /** Stores the result of a successful login or registration. */
  accept(result: AuthResult): void {
    const session: AdminSession = {
      token: result.token,
      email: result.email,
      displayName: result.displayName,
      expiresAt: parseFreshExpiry(result.expiresAtUtc),
    };

    this.session.set(session);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage can be blocked. Sign-in still works for this tab; it just will not survive a reload.
    }
  }

  signOut(): void {
    this.session.set(null);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing useful to do; the in-memory session is already cleared.
    }
  }
}

/**
 * Works out when a token the server has just issued runs out.
 *
 * This is deliberately forgiving, because the cost of getting it wrong is severe and silent: if the
 * date comes out as "already past", `isSignedIn` is false, the route guard turns the admin straight
 * back to the sign-in page, and it looks as though registering or signing in simply did not work.
 *
 * Two ways that can happen to a perfectly good token:
 *
 *  - The date arrives with no zone marker. JavaScript then reads it as LOCAL time, so in Pakistan
 *    (UTC+5) it lands five hours earlier than the server meant. A short-lived token would look
 *    expired the moment it was issued.
 *  - The date is missing or in some shape `Date` cannot read, giving NaN - and every comparison
 *    against NaN is false, so the session looks expired rather than looking broken.
 *
 * A server never hands out a token that has already expired, so a past date here means the string
 * was misread, not that the session is over. In that case we keep the admin signed in for a short
 * window. Nothing is lost by being wrong: the token itself still carries the real expiry, and the
 * server rejects it the moment it lapses - which the dashboard handles by signing out on a 401.
 */
function parseFreshExpiry(raw: string | null | undefined): number {
  const FALLBACK_MS = 60 * 60 * 1000;

  if (raw) {
    // Treat a zone-less timestamp as UTC, which is what the API means by "ExpiresAtUtc".
    const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw);
    const parsed = new Date(hasZone ? raw : `${raw}Z`).getTime();

    if (Number.isFinite(parsed) && parsed > Date.now()) {
      return parsed;
    }
  }

  return Date.now() + FALLBACK_MS;
}

/**
 * Reads a previous session back, discarding anything expired or malformed.
 *
 * Strict on purpose, unlike `parseFreshExpiry`: a stored session really can have run out while the
 * browser was closed, so a past date here is taken at face value.
 */
function readStoredSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AdminSession>;

    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      token: parsed.token,
      email: parsed.email ?? '',
      displayName: parsed.displayName ?? '',
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}
