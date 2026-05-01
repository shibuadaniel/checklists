import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { parseUserRole, UserRole } from '../models/team.model';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/auth/login']);
};

/**
 * Factory that returns a guard allowing only the specified roles.
 * Redirects authenticated users with insufficient permissions to /dashboard.
 */
export const roleGuard = (...allowedRoles: UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = parseUserRole(auth.currentUser()?.role) ?? undefined;
  if (role && allowedRoles.includes(role)) return true;
  return router.createUrlTree(['/dashboard']);
};
