import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { PermissionService } from './permission.service';
import type { Permission } from './permissions';

export const permissionGuard: CanActivateFn = (route) => {
  const permissions = inject(PermissionService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as Permission | undefined;

  if (!requiredPermission) {
    return true;
  }

  if (permissions.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree(['/dashboard'], {
    queryParams: { accessDenied: 'true' },
  });
};
