const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export function validateDocument(file: File): string | null {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return 'Choose a PDF, JPEG, PNG, or WebP file.';
  }

  if (file.size === 0) {
    return 'The selected file is empty.';
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return 'The document must be 10 MB or smaller.';
  }

  return null;
}
