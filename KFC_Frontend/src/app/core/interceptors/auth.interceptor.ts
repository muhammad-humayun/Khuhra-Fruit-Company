import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { AdminAuthService } from '../services/admin-auth.service';

/**
 * Attaches the admin token to admin API calls.
 *
 * An interceptor sits between the application and the network: every request the `HttpClient`
 * sends passes through here first. Putting the token on here rather than in each service means no
 * admin call can forget it, and the services stay free of authentication plumbing.
 *
 * ## Why the URL is checked
 *
 * The token is only ever added to this project's own `/api/admin/` calls. Without that check the
 * token would be bolted onto *every* outgoing request - including the photo URLs on
 * upload.wikimedia.org - which would hand a credential to servers that have no business holding it.
 * This is the kind of leak that is invisible until someone reads the network tab.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isOwnAdminCall(request.url)) {
    return next(request);
  }

  const token = inject(AdminAuthService).token();
  if (!token) {
    // Let it go unauthenticated: the server answers 401 and the screen sends the admin to sign in.
    return next(request);
  }

  // Requests are immutable, so this produces a copy carrying the header.
  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

function isOwnAdminCall(url: string): boolean {
  return (
    url.startsWith(`${APP_CONFIG.apiBaseUrl}/api/admin/`) ||
    // Covers a same-origin deployment, where the API serves the Angular build itself.
    url.startsWith('/api/admin/')
  );
}
