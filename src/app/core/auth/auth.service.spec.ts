import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when no session exists', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logs in with valid demo credentials', () => {
    const result = service.login({
      email: 'admin@pocketkeeper.demo',
      password: 'Admin123!',
    });

    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.role).toBe('admin');
  });

  it('rejects invalid credentials', () => {
    const result = service.login({
      email: 'admin@pocketkeeper.demo',
      password: 'wrong-password',
    });

    expect(result).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('normalizes email casing and surrounding whitespace', () => {
    const result = service.login({
      email: '  ADMIN@POCKETKEEPER.DEMO  ',
      password: 'Admin123!',
    });

    expect(result).toBe(true);
    expect(service.currentUser()?.email).toBe('admin@pocketkeeper.demo');
  });

  it('persists a successful session', () => {
    service.login({
      email: 'member@pocketkeeper.demo',
      password: 'Member123!',
    });

    expect(localStorage.getItem('pocket-keeper-session')).not.toBeNull();
  });

  it('clears the session when logging out', () => {
    service.login({
      email: 'member@pocketkeeper.demo',
      password: 'Member123!',
    });

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('pocket-keeper-session')).toBeNull();
  });
});
