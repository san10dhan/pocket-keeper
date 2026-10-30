import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { DocumentsService } from '../../core/documents/documents.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});

    auth = TestBed.inject(AuthService);
    service = TestBed.inject(DocumentsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function loginAsMember(): void {
    auth.login({
      email: 'member@pocketkeeper.demo',
      password: 'Member123!',
    });
  }

  it('starts with an empty document library', () => {
    expect(service.myDocuments()).toEqual([]);
  });

  it('creates and persists a document for the current user', () => {
    loginAsMember();

    const document = service.create({
      id: 'file-1',
      name: 'Invoice.pdf',
      category: 'Invoice',
      mimeType: 'application/pdf',
      size: 1024,
    });

    expect(document.name).toBe('Invoice.pdf');
    expect(document.ownerId).toBe('user-member');
    expect(service.myDocuments()).toHaveLength(1);

    expect(localStorage.getItem('pocket-keeper-document-metadata')).not.toBeNull();
  });

  it('allows a member to delete their own document', () => {
    loginAsMember();

    service.create({
      id: 'file-2',
      name: 'Receipt.png',
      category: 'Receipt',
      mimeType: 'image/png',
      size: 2048,
    });

    expect(service.delete('file-2')).toBe(true);
    expect(service.myDocuments()).toHaveLength(0);
  });

  it('does not allow an unauthenticated user to upload', () => {
    expect(() =>
      service.create({
        id: 'file-3',
        name: 'Invoice.pdf',
        category: 'Invoice',
        mimeType: 'application/pdf',
        size: 1024,
      }),
    ).toThrow();
  });

  it('does not allow a Viewer to upload documents', () => {
    auth.login({
      email: 'viewer@pocketkeeper.demo',
      password: 'Viewer123!',
    });

    expect(() =>
      service.create({
        id: 'file-4',
        name: 'Invoice.pdf',
        category: 'Invoice',
        mimeType: 'application/pdf',
        size: 1024,
      }),
    ).toThrow();
  });

  it('does not allow a Member to delete another user’s document', () => {
    auth.login({
      email: 'admin@pocketkeeper.demo',
      password: 'Admin123!',
    });

    service.create({
      id: 'admin-file',
      name: 'Admin Invoice.pdf',
      category: 'Invoice',
      mimeType: 'application/pdf',
      size: 1024,
    });

    auth.logout();
    loginAsMember();

    expect(service.delete('admin-file')).toBe(false);
  });

  it('does not expose another user’s documents to a Member', () => {
    auth.login({
      email: 'admin@pocketkeeper.demo',
      password: 'Admin123!',
    });

    service.create({
      id: 'admin-file',
      name: 'Private Invoice.pdf',
      category: 'Invoice',
      mimeType: 'application/pdf',
      size: 1024,
    });

    auth.logout();
    loginAsMember();

    expect(service.myDocuments()).toHaveLength(0);
  });
});
