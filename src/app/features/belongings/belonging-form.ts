import { Component, effect, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
} from '@angular/forms';
import { BELONGING_CATEGORIES } from '../../core/belongings/belonging.model';
import type { Belonging, BelongingDraft } from '../../core/belongings/belonging.model';
import { validateImage } from '../../core/belongings/image-validation';

function notFutureDate(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const selected = new Date(`${control.value}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Number.isNaN(selected.getTime()) || selected > today ? { futureDate: true } : null;
}

export interface BelongingFormResult {
  draft: BelongingDraft;
  image: File | null;
  removeImage: boolean;
}

@Component({
  selector: 'app-belonging-form',
  imports: [ReactiveFormsModule],
  template: `
    <section class="form-card">
      <h2>{{ item() ? 'Edit belonging' : 'Add a belonging' }}</h2>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="name">Item name *</label>
        <input id="name" formControlName="name" placeholder="e.g. House keys" />

        @if (form.controls.name.touched && form.controls.name.invalid) {
          <small class="error">Enter a name between 2 and 80 characters.</small>
        }

        <label for="category">Category *</label>
        <select id="category" formControlName="category">
          @for (category of categories; track category) {
            <option [value]="category">{{ category }}</option>
          }
        </select>

        <label for="location">Last known location *</label>
        <input id="location" formControlName="location" placeholder="e.g. Entrance drawer" />

        @if (form.controls.location.touched && form.controls.location.invalid) {
          <small class="error">Enter a location.</small>
        }

        <label for="lastSeenAt">Last seen date *</label>
        <input id="lastSeenAt" type="date" formControlName="lastSeenAt" />

        @if (form.controls.lastSeenAt.touched && form.controls.lastSeenAt.hasError('futureDate')) {
          <small class="error">The date cannot be in the future.</small>
        }

        <label for="description">Description</label>
        <textarea
          id="description"
          rows="3"
          formControlName="description"
          placeholder="Optional details"
        ></textarea>
        <label for="image">Item photo</label>

        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          (change)="selectImage($event)"
        />

        @if (imageError()) {
          <small class="error" role="alert">{{ imageError() }}</small>
        }

        @if (imagePreview(); as preview) {
          <div class="image-preview">
            <img [src]="preview" alt="Preview of the selected belonging photo" />
            <button type="button" class="secondary" (click)="removeImage()">Remove photo</button>
          </div>
        }

        @if (item()?.imageId && !imagePreview() && !removeExistingImage) {
          <p class="existing-photo">An existing photo is attached.</p>
        }

        <div class="actions">
          <button type="button" class="secondary" (click)="cancelled.emit()">Cancel</button>
          <button type="submit">
            {{ item() ? 'Save changes' : 'Add belonging' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: `
    .form-card {
      padding: 24px;
      border: 1px solid #e0e8e1;
      border-radius: 14px;
      background: white;
    }
    h2 {
      margin-top: 0;
      color: #20382a;
    }
    form {
      display: grid;
      gap: 10px;
    }
    label {
      margin-top: 8px;
      color: #304437;
      font-weight: 700;
    }
    input,
    select,
    textarea {
      width: 100%;
      min-width: 0;
      padding: 11px;
      border: 1px solid #dce5dd;
      border-radius: 8px;
      background: white;
    }
    .error {
      color: #b42318;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }
    button {
      padding: 11px 16px;
      border: 0;
      border-radius: 8px;
      background: #315c45;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }
    button.secondary {
      border: 1px solid #dce5dd;
      background: white;
      color: #304437;
    }
    .image-preview {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
    }

    .image-preview img {
      width: 140px;
      height: 120px;
      border: 1px solid #dce5dd;
      border-radius: 10px;
      object-fit: cover;
    }

    .existing-photo {
      color: #64816c;
      font-size: 0.85rem;
    }
  `,
})
export class BelongingForm {
  readonly item = input<Belonging | null>(null);
  readonly saved = output<BelongingFormResult>();
  readonly cancelled = output<void>();

  protected readonly imageError = signal('');
  protected readonly imagePreview = signal<string | null>(null);

  private selectedImage: File | null = null;
  protected removeExistingImage = false;
  private currentPreviewUrl: string | null = null;

  protected readonly categories = BELONGING_CATEGORIES;

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    }),
    category: new FormControl<(typeof BELONGING_CATEGORIES)[number]>('Other', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    location: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    lastSeenAt: new FormControl(this.today(), {
      nonNullable: true,
      validators: [Validators.required, notFutureDate],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  constructor() {
    effect(() => {
      const item = this.item();

      if (item) {
        this.form.patchValue({
          name: item.name,
          category: item.category,
          location: item.location,
          lastSeenAt: item.lastSeenAt,
          description: item.description,
        });
      } else {
        this.form.reset({
          name: '',
          category: 'Other',
          location: '',
          lastSeenAt: this.today(),
          description: '',
        });
      }
    });
    this.clearPreview();
    this.selectedImage = null;
    this.removeExistingImage = false;
    this.imageError.set('');
  }

  private today(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  protected selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.imageError.set('');

    // No file selected
    if (!file) {
      return;
    }

    // Validate file type and size
    const error = validateImage(file);

    if (error) {
      this.imageError.set(error);
      input.value = '';
      return;
    }

    // Clean up the previous preview
    this.clearPreview();

    this.selectedImage = file;
    this.removeExistingImage = false;

    // Generate a preview URL
    this.currentPreviewUrl = URL.createObjectURL(file);
    this.imagePreview.set(this.currentPreviewUrl);
  }

  protected removeImage(): void {
    this.clearPreview();
    this.selectedImage = null;
    this.removeExistingImage = true;
    this.imageError.set('');
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.imageError()) {
      return;
    }

    this.saved.emit({
      draft: this.form.getRawValue(),
      image: this.selectedImage,
      removeImage: this.removeExistingImage,
    });
  }

  private clearPreview(): void {
    if (this.currentPreviewUrl) {
      URL.revokeObjectURL(this.currentPreviewUrl);
      this.currentPreviewUrl = null;
    }

    this.imagePreview.set(null);
  }
}
