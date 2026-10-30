import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import type { UserRole } from './auth.models';
import { PERMISSIONS, type Permission } from './permissions';

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: Object.values(PERMISSIONS),

  member: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ITEM_READ,
    PERMISSIONS.ITEM_CREATE,
    PERMISSIONS.ITEM_UPDATE,
    PERMISSIONS.ITEM_DELETE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DELETE,
  ],

  viewer: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.ITEM_READ, PERMISSIONS.DOCUMENT_READ],
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(AuthService);

  hasPermission(permission: Permission): boolean {
    const user = this.auth.currentUser();

    if (!user) {
      return false;
    }

    return ROLE_PERMISSIONS[user.role].includes(permission);
  }

  hasAnyPermission(permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: readonly Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  getPermissionsForCurrentUser(): readonly Permission[] {
    const user = this.auth.currentUser();

    return user ? ROLE_PERMISSIONS[user.role] : [];
  }
}
