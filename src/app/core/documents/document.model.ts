export const DOCUMENT_CATEGORIES = [
  'Invoice',
  'Receipt',
  'Warranty',
  'Insurance',
  'Manual',
  'Other',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface PocketDocument {
  id: string;
  ownerId: string;
  name: string;
  category: DocumentCategory;
  mimeType: string;
  size: number;
  uploadedAt: string;
  belongingId?: string;
}

export interface DocumentDraft {
  name: string;
  category: DocumentCategory;
  belongingId?: string;
  file: File;
}
