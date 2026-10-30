import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PermissionService } from '../auth/permission.service';
import { PERMISSIONS } from '../auth/permissions';
import type { PocketDocument, DocumentCategory } from './document.model';

const STORAGE_KEY = 'pocket-keeper-document-metadata';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(PermissionService);

  private readonly documentsState = signal<PocketDocument[]>(this.restore());

  readonly documents = this.documentsState.asReadonly();

  readonly myDocuments = computed(() => {
    const user = this.auth.currentUser();

    if (!user) {
      return [];
    }

    return this.documentsState().filter(
      (document) => user.role === 'admin' || document.ownerId === user.id,
    );
  });

  create(input: {
    id: string;
    name: string;
    category: DocumentCategory;
    mimeType: string;
    size: number;
    belongingId?: string;
  }): PocketDocument {
    const user = this.requirePermission(PERMISSIONS.DOCUMENT_UPLOAD);

    const document: PocketDocument = {
      id: input.id,
      ownerId: user.id,
      name: input.name.trim(),
      category: input.category,
      mimeType: input.mimeType,
      size: input.size,
      uploadedAt: new Date().toISOString(),
      ...(input.belongingId ? { belongingId: input.belongingId } : {}),
    };

    this.commit([document, ...this.documentsState()]);

    return document;
  }

  delete(id: string): boolean {
    const user = this.requirePermission(PERMISSIONS.DOCUMENT_DELETE);

    const document = this.documentsState().find((item) => item.id === id);

    if (!document || (user.role !== 'admin' && document.ownerId !== user.id)) {
      return false;
    }

    this.commit(this.documentsState().filter((item) => item.id !== id));

    return true;
  }

  private requirePermission(
    permission: typeof PERMISSIONS.DOCUMENT_UPLOAD | typeof PERMISSIONS.DOCUMENT_DELETE,
  ) {
    const user = this.auth.currentUser();

    if (!user || !this.permissions.hasPermission(permission)) {
      throw new Error('You do not have permission to perform this action.');
    }

    return user;
  }

  private commit(documents: PocketDocument[]): void {
    this.documentsState.set(documents);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      throw new Error('Unable to persist document metadata in browser storage.');
    }
  }

  private restore(): PocketDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(this.isDocument);
    } catch {
      return [];
    }
  }

  private isDocument(value: unknown): value is PocketDocument {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const item = value as Record<string, unknown>;

    return (
      typeof item['id'] === 'string' &&
      typeof item['ownerId'] === 'string' &&
      typeof item['name'] === 'string' &&
      typeof item['category'] === 'string' &&
      typeof item['mimeType'] === 'string' &&
      typeof item['size'] === 'number' &&
      typeof item['uploadedAt'] === 'string' &&
      (item['belongingId'] === undefined || typeof item['belongingId'] === 'string')
    );
  }
}
