import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that protects admin routes.
 * Redirects to /auth if not logged in, or / if not admin.
 */
export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  await authService.waitForInit();

  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth'], {
      queryParams: { returnUrl: '/admin' },
    });
    return false;
  }

  // Check if user has admin role
  if (!authService.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

/**
 * Guard that protects routes requiring authentication (any role).
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitForInit();

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
};
