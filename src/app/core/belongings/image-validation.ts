const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Choose a JPEG, PNG, or WebP image.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'The image must be 5 MB or smaller.';
  }

  return null;
}
