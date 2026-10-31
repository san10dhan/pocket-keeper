import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { BelongingsService } from '../../core/belongings/belongings.service';
import type { BelongingDraft } from '../../core/belongings/belonging.model';

const sample: BelongingDraft = {
  name: 'House keys',
  description: 'Spare keys',
  category: 'Accessories',
  location: 'Entrance drawer',
  lastSeenAt: '2026-10-20',
};

describe('BelongingsService', () => {
  let service: BelongingsService;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});

    auth = TestBed.inject(AuthService);
    service = TestBed.inject(BelongingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function loginAsMember(): void {
    auth.login({
      email: 'member@pocketkeeper.demo',
      password: 'Member@123!test',
    });
  }

  it('starts with an empty inventory', () => {
    expect(service.myItems()).toEqual([]);
  });

  it('creates and persists a belonging for the current user', () => {
    loginAsMember();

    const created = service.create(sample);

    expect(created.name).toBe('House keys');
    expect(created.ownerId).toBe('user-member');
    expect(service.myItems()).toHaveLength(1);
    expect(localStorage.getItem('pocket-keeper-belongings')).not.toBeNull();
  });

  it('updates an existing belonging', () => {
    loginAsMember();

    const created = service.create(sample);

    const result = service.update(created.id, {
      ...sample,
      location: 'Bedroom drawer',
    });

    expect(result).toBe(true);
    expect(service.myItems()[0].location).toBe('Bedroom drawer');
  });

  it('deletes an existing belonging', () => {
    loginAsMember();

    const created = service.create(sample);

    expect(service.delete(created.id)).toBe(true);
    expect(service.myItems()).toHaveLength(0);
  });

  it('does not allow an unauthenticated user to create belongings', () => {
    expect(() => service.create(sample)).toThrow();
  });

  it('does not allow a viewer to create belongings', () => {
    auth.login({
      email: 'viewer@pocketkeeper.demo',
      password: 'Viewer@123!test',
    });

    expect(() => service.create(sample)).toThrow();
  });

  it('does not allow a member to update another user’s belonging', () => {
    auth.login({
      email: 'admin@pocketkeeper.demo',
      password: 'Admin@123!test',
    });

    const created = service.create(sample);

    auth.logout();

    loginAsMember();

    expect(
      service.update(created.id, {
        ...sample,
        location: 'Unauthorized change',
      }),
    ).toBe(false);
  });

  it('filters belongings by owner for non-admin users', () => {
    auth.login({
      email: 'admin@pocketkeeper.demo',
      password: 'Admin@123!test',
    });

    service.create(sample);

    auth.logout();
    loginAsMember();

    expect(service.myItems()).toHaveLength(0);
  });
});
