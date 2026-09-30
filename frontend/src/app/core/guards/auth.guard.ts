import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiredRoles = route.data?.['roles'] as string[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
      const user = authService.currentUser();
      if (!user || !requiredRoles.includes(user.role)) {
        router.navigate(['/unauthorized']);
        return false;
      }
    }
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: router.routerState.snapshot.url } });
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
