import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

/**
 * Keeps the setup screen behind sign-in.
 *
 * A route guard is a convenience, not a security boundary: anyone can edit the JavaScript running
 * in their own browser, so a guard alone protects nothing. The real protection is `[Authorize]` on
 * the API controller - without a valid token the server returns nothing to show. This guard just
 * saves the admin from a blank screen full of failed requests.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AdminAuthService);

  if (auth.isSignedIn()) {
    return true;
  }

  // Remember where they were heading, so signing in lands them there rather than back at the start.
  return inject(Router).createUrlTree(['/admin/login'], {
    queryParams: { next: state.url },
  });
};
