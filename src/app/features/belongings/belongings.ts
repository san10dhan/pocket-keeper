import { Component, computed, effect, inject, signal, OnDestroy } from '@angular/core';

import { BelongingsService } from '../../core/belongings/belongings.service';
import { BELONGING_CATEGORIES, type Belonging } from '../../core/belongings/belonging.model';

import { PermissionService } from '../../core/auth/permission.service';
import { PERMISSIONS } from '../../core/auth/permissions';

import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

import { BelongingForm, type BelongingFormResult } from './belonging-form';

import { ImageStorageService } from '../../core/belongings/image-storage.service';
import { filterBelongings } from './belongings-filter';

@Component({
  selector: 'app-belongings',
  standalone: true,
  imports: [BelongingForm, HasPermissionDirective, EmptyState],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <p class="eyebrow">YOUR INVENTORY</p>
          <h1>Belongings</h1>
          <p class="description">Keep track of what you own and where you last kept it.</p>
        </div>

        <button *appHasPermission="PERMISSIONS.ITEM_CREATE" type="button" (click)="startCreate()">
          + Add belonging
        </button>
      </header>

      @if (formVisible()) {
        <app-belonging-form
          [item]="selectedItem()"
          (saved)="save($event)"
          (cancelled)="cancelForm()"
        />
      }

      <section class="filters" aria-label="Belongings filters">
        <label>
          <span>Search belongings</span>
          <input
            type="search"
            placeholder="Search by name, location, or description"
            [value]="searchQuery()"
            (input)="updateSearch($event)"
          />
        </label>

        <label>
          <span>Category</span>
          <select [value]="selectedCategory()" (change)="updateCategory($event)">
            <option value="All">All categories</option>

            @for (value of categories; track value) {
              <option [value]="value">{{ value }}</option>
            }
          </select>
        </label>

        <label>
          <span>Sort by</span>
          <select [value]="sortOrder()" (change)="updateSortOrder($event)">
            <option value="newest">Recently updated</option>
            <option value="oldest">Oldest updated</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
      </section>

      <p class="results-count" aria-live="polite">
        {{ resultCount() }} {{ resultCount() === 1 ? 'belonging' : 'belongings' }} found
      </p>

      @if (filteredItems().length > 0) {
        <section class="item-grid" aria-label="Belongings">
          @for (item of filteredItems(); track item.id) {
            <article class="item-card">
              @if (imageUrls()[item.id]; as imageUrl) {
                <img class="item-photo" [src]="imageUrl" [alt]="'Photo of ' + item.name" />
              } @else {
                <div class="item-symbol" aria-hidden="true">▣</div>
              }

              <div class="item-details">
                <span class="category">{{ item.category }}</span>

                <h2>{{ item.name }}</h2>

                @if (item.description) {
                  <p>{{ item.description }}</p>
                }

                <div class="location">
                  <span aria-hidden="true">⌖</span>
                  {{ item.location }}
                </div>

                <small>Last seen: {{ item.lastSeenAt }}</small>
              </div>

              <div class="item-actions">
                <button
                  *appHasPermission="PERMISSIONS.ITEM_UPDATE"
                  type="button"
                  (click)="startEdit(item)"
                  [attr.aria-label]="'Edit ' + item.name"
                >
                  Edit
                </button>

                <button
                  *appHasPermission="PERMISSIONS.ITEM_DELETE"
                  type="button"
                  class="delete"
                  (click)="remove(item)"
                  [attr.aria-label]="'Delete ' + item.name"
                >
                  Delete
                </button>
              </div>
            </article>
          }
        </section>
      } @else {
        @if (searchQuery().trim() || selectedCategory() !== 'All') {
          <app-empty-state
            title="No matching belongings"
            description="Try another search term or choose a different category."
            icon="⌕"
          />
        } @else {
          <app-empty-state
            title="No belongings yet"
            description="Add your first belonging to start tracking your inventory."
            icon="▣"
          >
            <button
              *appHasPermission="PERMISSIONS.ITEM_CREATE"
              type="button"
              (click)="startCreate()"
            >
              Add your first belonging
            </button>
          </app-empty-state>
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
      align-items: flex-start;
      justify-content: space-between;
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
      font-size: 2.4rem;
    }

    .description {
      color: #68746b;
      line-height: 1.8;
    }

    button {
      padding: 10px 14px;
      border: 0;
      border-radius: 8px;
      background: #315c45;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    button:focus-visible,
    input:focus-visible,
    select:focus-visible {
      outline: 3px solid #8db69a;
      outline-offset: 2px;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 28px;
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
      font-size: 0.85rem;
      font-weight: 700;
    }

    input,
    select {
      width: 100%;
      min-width: 0;
      padding: 11px;
      border: 1px solid #dce5dd;
      border-radius: 8px;
      background: white;
      color: #20382a;
    }

    .results-count {
      margin: 22px 0 14px;
      color: #68746b;
      font-size: 0.85rem;
    }

    .item-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
      gap: 16px;
    }

    .item-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      min-width: 0;
      padding: 20px;
      border: 1px solid #e0e8e1;
      border-radius: 14px;
      background: white;
    }

    .item-symbol {
      display: grid;
      width: 42px;
      height: 42px;
      flex-shrink: 0;
      place-items: center;
      border-radius: 10px;
      background: #eaf2ec;
      color: #315c45;
      font-size: 1.3rem;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .category {
      color: #64816c;
      font-size: 0.75rem;
      font-weight: 700;
    }

    h2 {
      margin: 8px 0;
      overflow-wrap: anywhere;
      color: #20382a;
      font-size: 1.1rem;
    }

    .item-details p {
      color: #68746b;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .location {
      margin: 12px 0;
      color: #304437;
      overflow-wrap: anywhere;
    }

    .item-details small {
      color: #89958c;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-actions button {
      padding: 7px 10px;
      font-size: 0.8rem;
    }

    .item-actions .delete {
      border: 1px solid #f0d4d2;
      background: white;
      color: #b42318;
    }

    .item-photo {
      width: 76px;
      height: 76px;
      flex-shrink: 0;
      border: 1px solid #e0e8e1;
      border-radius: 10px;
      object-fit: cover;
    }

    app-belonging-form {
      display: block;
      margin-top: 24px;
    }

    @media (max-width: 520px) {
      .item-card {
        flex-wrap: wrap;
      }

      .item-actions {
        width: 100%;
        flex-direction: row;
      }
    }
  `,
})
export class Belongings implements OnDestroy {
  private readonly service = inject(BelongingsService);
  private readonly permissions = inject(PermissionService);
  private readonly imageStorage = inject(ImageStorageService);

  protected readonly PERMISSIONS = PERMISSIONS;
  protected readonly categories = BELONGING_CATEGORIES;

  protected readonly searchQuery = signal('');
  protected readonly selectedCategory = signal<string>('All');
  protected readonly sortOrder = signal<'newest' | 'oldest' | 'name'>('newest');

  protected readonly formVisible = signal(false);
  protected readonly selectedItem = signal<Belonging | null>(null);
  protected readonly imageUrls = signal<Record<string, string>>({});

  protected readonly filteredItems = computed(() =>
    filterBelongings(this.service.myItems(), {
      query: this.searchQuery(),
      category: this.selectedCategory(),
      sortOrder: this.sortOrder(),
    }),
  );

  protected readonly resultCount = computed(() => this.filteredItems().length);

  private readonly previewUrls = new Map<string, string>();
  private previewGeneration = 0;

  constructor() {
    effect(() => {
      const items = this.service.myItems();
      void this.loadImagePreviews(items);
    });
  }

  protected updateSearch(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLInputElement) {
      this.searchQuery.set(input.value);
    }
  }

  protected updateCategory(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLSelectElement) {
      this.selectedCategory.set(input.value);
    }
  }

  protected updateSortOrder(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLSelectElement && ['newest', 'oldest', 'name'].includes(input.value)) {
      this.sortOrder.set(input.value as 'newest' | 'oldest' | 'name');
    }
  }

  protected startCreate(): void {
    this.selectedItem.set(null);
    this.formVisible.set(true);
  }

  protected startEdit(item: Belonging): void {
    this.selectedItem.set(item);
    this.formVisible.set(true);
  }

  protected cancelForm(): void {
    this.formVisible.set(false);
    this.selectedItem.set(null);
  }

  protected async save(result: BelongingFormResult): Promise<void> {
    let newImageId: string | undefined;
    let oldImageId: string | undefined;

    try {
      const selected = this.selectedItem();
      oldImageId = selected?.imageId;

      if (result.image) {
        newImageId = await this.imageStorage.save(result.image);
      }

      const imageId = result.removeImage ? undefined : (newImageId ?? oldImageId);

      const draft = {
        ...result.draft,
        imageId,
      };

      if (selected) {
        const updated = this.service.update(selected.id, draft);

        if (!updated) {
          throw new Error('The belonging could not be updated.');
        }
      } else {
        this.service.create(draft);
      }

      if (oldImageId && oldImageId !== imageId) {
        await this.imageStorage.delete(oldImageId);
      }

      this.cancelForm();
    } catch (error) {
      if (newImageId) {
        await this.imageStorage.delete(newImageId).catch(() => undefined);
      }

      window.alert(error instanceof Error ? error.message : 'Unable to save belonging.');
    }
  }

  protected async remove(item: Belonging): Promise<void> {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const deleted = this.service.delete(item.id);

      if (!deleted) {
        throw new Error('The belonging could not be deleted.');
      }

      if (item.imageId) {
        await this.imageStorage.delete(item.imageId);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete belonging.');
    }
  }

  private async loadImagePreviews(items: readonly Belonging[]): Promise<void> {
    const generation = ++this.previewGeneration;

    const results = await Promise.all(
      items
        .filter((item) => item.imageId)
        .map(async (item) => {
          try {
            const blob = await this.imageStorage.get(item.imageId!);

            if (blob) {
              return [item.id, URL.createObjectURL(blob)] as const;
            }
          } catch {
            // A missing image must not prevent the inventory from rendering.
          }

          return null;
        }),
    );

    if (generation !== this.previewGeneration) {
      for (const result of results) {
        if (result) {
          URL.revokeObjectURL(result[1]);
        }
      }

      return;
    }

    for (const url of this.previewUrls.values()) {
      URL.revokeObjectURL(url);
    }

    this.previewUrls.clear();

    const next: Record<string, string> = {};

    for (const result of results) {
      if (result) {
        next[result[0]] = result[1];
        this.previewUrls.set(result[0], result[1]);
      }
    }

    this.imageUrls.set(next);
  }

  ngOnDestroy(): void {
    // Invalidate any outstanding preview-loading operation.
    this.previewGeneration++;

    for (const url of this.previewUrls.values()) {
      URL.revokeObjectURL(url);
    }

    this.previewUrls.clear();
  }
}
