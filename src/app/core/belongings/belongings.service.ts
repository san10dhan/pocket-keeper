import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PermissionService } from '../auth/permission.service';
import { PERMISSIONS } from '../auth/permissions';
import type { Belonging, BelongingDraft } from './belonging.model';

const STORAGE_KEY = 'pocket-keeper-belongings';

@Injectable({ providedIn: 'root' })
export class BelongingsService {
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(PermissionService);

  private readonly itemsState = signal<Belonging[]>(this.restoreItems());

  readonly items = this.itemsState.asReadonly();

  readonly myItems = computed(() => {
    const user = this.auth.currentUser();

    if (!user) {
      return [];
    }

    if (user.role === 'admin') {
      return this.itemsState();
    }

    return this.itemsState().filter((item) => item.ownerId === user.id);
  });

  create(draft: BelongingDraft): Belonging {
    const user = this.requirePermission(PERMISSIONS.ITEM_CREATE);

    const now = new Date().toISOString();

    const item: Belonging = {
      ...draft,
      id: crypto.randomUUID(),
      ownerId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    this.commit([item, ...this.itemsState()]);

    return item;
  }

  update(id: string, draft: BelongingDraft): boolean {
    const user = this.requirePermission(PERMISSIONS.ITEM_UPDATE);
    const existing = this.itemsState().find((item) => item.id === id);

    if (!existing || !this.canManage(existing, user.id, user.role)) {
      return false;
    }

    const updated: Belonging = {
      ...existing,
      ...draft,
      updatedAt: new Date().toISOString(),
    };

    this.commit(this.itemsState().map((item) => (item.id === id ? updated : item)));

    return true;
  }

  delete(id: string): boolean {
    const user = this.requirePermission(PERMISSIONS.ITEM_DELETE);
    const existing = this.itemsState().find((item) => item.id === id);

    if (!existing || !this.canManage(existing, user.id, user.role)) {
      return false;
    }

    this.commit(this.itemsState().filter((item) => item.id !== id));

    return true;
  }

  private canManage(item: Belonging, userId: string, role: string): boolean {
    return role === 'admin' || item.ownerId === userId;
  }

  private requirePermission(
    permission:
      | typeof PERMISSIONS.ITEM_CREATE
      | typeof PERMISSIONS.ITEM_UPDATE
      | typeof PERMISSIONS.ITEM_DELETE,
  ) {
    const user = this.auth.currentUser();

    if (!user || !this.permissions.hasPermission(permission)) {
      throw new Error('You do not have permission to perform this action.');
    }

    return user;
  }

  private commit(items: Belonging[]): void {
    this.itemsState.set(items);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Keep the in-memory data usable if browser storage is unavailable.
      // A future refinement will surface persistence failures to the UI.
    }
  }

  private restoreItems(): Belonging[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item): item is Belonging => this.isBelonging(item));
    } catch {
      return [];
    }
  }

  private isBelonging(value: unknown): value is Belonging {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const item = value as Record<string, unknown>;

    return (
      typeof item['id'] === 'string' &&
      typeof item['ownerId'] === 'string' &&
      typeof item['name'] === 'string' &&
      typeof item['description'] === 'string' &&
      typeof item['category'] === 'string' &&
      typeof item['location'] === 'string' &&
      typeof item['lastSeenAt'] === 'string' &&
      typeof item['createdAt'] === 'string' &&
      typeof item['updatedAt'] === 'string' &&
      (item['imageId'] === undefined || typeof item['imageId'] === 'string')
    );
  }
}
