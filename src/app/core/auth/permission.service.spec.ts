import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { PERMISSIONS } from './permissions';

describe('PermissionService', () => {
  let auth: AuthService;
  let permissions: PermissionService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});

    auth = TestBed.inject(AuthService);
    permissions = TestBed.inject(PermissionService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('denies permissions when nobody is authenticated', () => {
    expect(permissions.hasPermission(PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
  });

  it('allows admins to manage users and settings', () => {
    auth.login({
      email: 'admin@pocketkeeper.demo',
      password: 'Admin123!',
    });

    expect(permissions.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true);

    expect(permissions.hasPermission(PERMISSIONS.SETTINGS_MANAGE)).toBe(true);
  });

  it('allows members to create belongings but not manage users', () => {
    auth.login({
      email: 'member@pocketkeeper.demo',
      password: 'Member123!',
    });

    expect(permissions.hasPermission(PERMISSIONS.ITEM_CREATE)).toBe(true);

    expect(permissions.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false);
  });

  it('allows viewers to read but not modify belongings', () => {
    auth.login({
      email: 'viewer@pocketkeeper.demo',
      password: 'Viewer123!',
    });

    expect(permissions.hasPermission(PERMISSIONS.ITEM_READ)).toBe(true);

    expect(permissions.hasPermission(PERMISSIONS.ITEM_CREATE)).toBe(false);

    expect(permissions.hasPermission(PERMISSIONS.DOCUMENT_UPLOAD)).toBe(false);
  });

  it('supports checking any required permission', () => {
    auth.login({
      email: 'viewer@pocketkeeper.demo',
      password: 'Viewer123!',
    });

    expect(permissions.hasAnyPermission([PERMISSIONS.ITEM_CREATE, PERMISSIONS.DOCUMENT_READ])).toBe(
      true,
    );
  });

  it('supports checking all required permissions', () => {
    auth.login({
      email: 'viewer@pocketkeeper.demo',
      password: 'Viewer123!',
    });

    expect(permissions.hasAllPermissions([PERMISSIONS.ITEM_READ, PERMISSIONS.DOCUMENT_READ])).toBe(
      true,
    );

    expect(permissions.hasAllPermissions([PERMISSIONS.ITEM_READ, PERMISSIONS.ITEM_CREATE])).toBe(
      false,
    );
  });
});
