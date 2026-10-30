import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentsService } from '../../core/documents/documents.service';
import { DocumentStorageService } from '../../core/documents/document-storage.service';
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  type PocketDocument,
} from '../../core/documents/document.model';
import { validateDocument } from '../../core/documents/document-validation';
import { BelongingsService } from '../../core/belongings/belongings.service';
import { PermissionService } from '../../core/auth/permission.service';
import { PERMISSIONS } from '../../core/auth/permissions';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { DatePipe } from '@angular/common';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../shared/components/error-message/error-message';

@Component({
  selector: 'app-documents',
  imports: [
    DatePipe,
    FormsModule,
    HasPermissionDirective,
    FileSizePipe,
    LoadingIndicator,
    EmptyState,
    ErrorMessage,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">YOUR DOCUMENTS</p>
          <h1>Documents & Invoices</h1>
          <p class="description">Keep invoices, receipts, and warranties together.</p>
        </div>

        <label *appHasPermission="PERMISSIONS.DOCUMENT_UPLOAD" class="upload-button">
          + Upload document
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            (change)="upload($event)"
          />
        </label>
      </header>
      <section class="upload-options" aria-label="Upload options">
        <label>
          Document category
          <select [ngModel]="uploadCategory()" (ngModelChange)="uploadCategory.set($event)">
            @for (value of categories; track value) {
              <option [value]="value">{{ value }}</option>
            }
          </select>
        </label>

        <label>
          Associated belonging
          <select
            [ngModel]="selectedBelongingId()"
            (ngModelChange)="selectedBelongingId.set($event)"
          >
            <option value="">None</option>
            @for (item of belongings.myItems(); track item.id) {
              <option [value]="item.id">{{ item.name }}</option>
            }
          </select>
        </label>
      </section>

      @if (error()) {
        <app-error-message [message]="error()" />
      }

      <section class="filters" aria-label="Document filters">
        <label>
          Search
          <input
            type="search"
            placeholder="Search document names..."
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
          />
        </label>

        <label>
          Category
          <select [ngModel]="category()" (ngModelChange)="category.set($event)">
            <option value="All">All categories</option>
            @for (value of categories; track value) {
              <option [value]="value">{{ value }}</option>
            }
          </select>
        </label>
      </section>

      <p class="count">{{ filteredDocuments().length }} documents</p>
      @if (loading()) {
        <app-loading-indicator label="Loading documents..." />
      } @else {
        @if (filteredDocuments().length) {
          <section class="document-list" aria-label="Document list">
            @for (document of filteredDocuments(); track document.id) {
              <article class="document-card">
                <div class="file-icon" aria-hidden="true">
                  {{ document.mimeType === 'application/pdf' ? 'PDF' : 'IMG' }}
                </div>

                <div class="details">
                  <span class="category">{{ document.category }}</span>
                  <h2>{{ document.name }}</h2>

                  <p>
                    {{ document.size | fileSize }}
                    · Uploaded {{ document.uploadedAt | date: 'mediumDate' }}
                  </p>

                  @if (document.belongingId; as belongingId) {
                    <small>
                      Belonging:
                      {{ belongingName(belongingId) }}
                    </small>
                  }
                </div>

                <div class="actions">
                  <button type="button" (click)="openFile(document)">
                    {{ document.mimeType === 'application/pdf' ? 'Preview' : 'View' }}
                  </button>

                  <button type="button" (click)="download(document)">Download</button>

                  <button
                    *appHasPermission="PERMISSIONS.DOCUMENT_DELETE"
                    type="button"
                    class="delete"
                    (click)="remove(document)"
                  >
                    Delete
                  </button>
                </div>
              </article>
            }
          </section>
        } @else {
          <app-empty-state
            title="No documents found"
            description="Upload an invoice, receipt, or warranty to get started."
            icon="▤"
          />
        }
      }
    </section>
  `,
  styles: `
    .page {
      max-width: 1100px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 20px;
    }
    .eyebrow {
      color: #315c45;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    h1 {
      margin: 12px 0;
      color: #20382a;
      font-size: 2.2rem;
    }
    .description {
      color: #68746b;
      line-height: 1.7;
    }
    .upload-button {
      display: inline-block;
      padding: 12px 16px;
      border-radius: 8px;
      background: #315c45;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    .upload-button input {
      display: none;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 26px;
      padding: 18px;
      border: 1px solid #e0e8e1;
      border-radius: 12px;
      background: white;
    }
    .filters label {
      display: grid;
      flex: 1;
      min-width: 180px;
      gap: 8px;
      color: #304437;
      font-weight: 700;
      font-size: 0.85rem;
    }
    input,
    select {
      width: 100%;
      min-width: 0;
      padding: 11px;
      border: 1px solid #dce5dd;
      border-radius: 8px;
      background: white;
    }
    .count {
      margin: 22px 0 14px;
      color: #68746b;
      font-size: 0.85rem;
    }
    .document-list {
      display: grid;
      gap: 12px;
    }
    .document-card {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 18px;
      border: 1px solid #e0e8e1;
      border-radius: 12px;
      background: white;
    }
    .file-icon {
      display: grid;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      place-items: center;
      border-radius: 10px;
      background: #eaf2ec;
      color: #315c45;
      font-size: 0.8rem;
      font-weight: 800;
    }
    .details {
      flex: 1;
      min-width: 150px;
    }
    .category {
      color: #64816c;
      font-size: 0.75rem;
      font-weight: 700;
    }
    h2 {
      margin: 6px 0;
      color: #20382a;
      font-size: 1rem;
      overflow-wrap: anywhere;
    }
    .details p,
    .details small {
      color: #68746b;
      font-size: 0.85rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    button {
      padding: 8px 11px;
      border: 0;
      border-radius: 7px;
      background: #315c45;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    button.delete {
      border: 1px solid #f0d4d2;
      background: white;
      color: #b42318;
    }
    .empty-state {
      margin-top: 24px;
      padding: 40px 20px;
      border: 1px dashed #d1ddd3;
      border-radius: 14px;
      background: white;
      text-align: center;
    }
    .empty-state p {
      color: #68746b;
    }
    .error {
      padding: 12px;
      border-radius: 8px;
      background: #fff0ef;
      color: #b42318;
    }
    .upload-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 20px;
    }

    .upload-options label {
      display: grid;
      flex: 1;
      min-width: 180px;
      gap: 8px;
      color: #304437;
      font-size: 0.85rem;
      font-weight: 700;
    }
  `,
})
export class Documents {
  private readonly service = inject(DocumentsService);
  private readonly storage = inject(DocumentStorageService);
  private readonly belongings = inject(BelongingsService);
  private readonly permissions = inject(PermissionService);
  protected readonly uploadCategory = signal<DocumentCategory>('Other');
  protected readonly selectedBelongingId = signal('');
  protected readonly loading = signal(false);

  protected readonly PERMISSIONS = PERMISSIONS;
  protected readonly categories = DOCUMENT_CATEGORIES;

  protected readonly search = signal('');
  protected readonly category = signal<string>('All');
  protected readonly error = signal('');

  protected readonly filteredDocuments = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedCategory = this.category();

    return this.service.myDocuments().filter((document) => {
      const matchesName = document.name.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'All' || document.category === selectedCategory;

      return matchesName && matchesCategory;
    });
  });

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.error.set('');

    if (!file) {
      return;
    }

    const validationError = validateDocument(file);

    if (validationError) {
      this.error.set(validationError);
      input.value = '';
      return;
    }

    let id: string | undefined;

    try {
      id = await this.storage.save(file);

      this.service.create({
        id,
        name: file.name,
        category: this.uploadCategory(),
        mimeType: file.type,
        size: file.size,
        ...(this.selectedBelongingId() ? { belongingId: this.selectedBelongingId() } : {}),
      });

      input.value = '';
    } catch (error) {
      if (id) {
        await this.storage.delete(id).catch(() => undefined);
      }

      this.error.set(error instanceof Error ? error.message : 'Upload failed.');
    }
  }

  protected async openFile(document: PocketDocument): Promise<void> {
    await this.showFile(document, false);
  }

  protected async download(document: PocketDocument): Promise<void> {
    await this.showFile(document, true);
  }

  protected async remove(document: PocketDocument): Promise<void> {
    if (!window.confirm(`Delete "${document.name}"?`)) {
      return;
    }

    this.error.set('');

    try {
      const deleted = this.service.delete(document.id);

      if (!deleted) {
        throw new Error('The document could not be deleted.');
      }

      await this.storage.delete(document.id);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to delete document.');
    }
  }

  protected formatSize(size: number): string {
    return size < 1024 * 1024
      ? `${Math.ceil(size / 1024)} KB`
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected belongingName(id: string): string {
    return (
      this.belongings.myItems().find((item) => item.id === id)?.name ?? 'Belonging unavailable'
    );
  }

  private async showFile(document: PocketDocument, download: boolean): Promise<void> {
    this.error.set('');

    try {
      const blob = await this.storage.get(document.id);

      if (!blob) {
        throw new Error('The stored file could not be found.');
      }

      const url = URL.createObjectURL(blob);

      if (download) {
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = document.name;
        anchor.click();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const opened = window.open(url, '_blank', 'noopener');

        if (!opened) {
          URL.revokeObjectURL(url);
          throw new Error('The preview was blocked by your browser.');
        }

        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to open the file.');
    }
  }
}
