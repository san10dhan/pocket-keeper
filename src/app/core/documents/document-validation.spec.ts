import { describe, expect, it } from 'vitest';
import { MAX_DOCUMENT_SIZE, validateDocument } from './document-validation';

describe('validateDocument', () => {
  it('accepts PDF files', () => {
    const file = new File(['pdf'], 'invoice.pdf', {
      type: 'application/pdf',
    });

    expect(validateDocument(file)).toBeNull();
  });

  it('accepts image files', () => {
    const file = new File(['image'], 'receipt.png', {
      type: 'image/png',
    });

    expect(validateDocument(file)).toBeNull();
  });

  it('rejects unsupported file types', () => {
    const file = new File(['content'], 'script.js', {
      type: 'text/javascript',
    });

    expect(validateDocument(file)).toContain('Choose a PDF');
  });

  it('rejects empty files', () => {
    const file = new File([], 'empty.pdf', {
      type: 'application/pdf',
    });

    expect(validateDocument(file)).toBe('The selected file is empty.');
  });

  it('rejects files larger than 10 MB', () => {
    const file = new File([new Uint8Array(MAX_DOCUMENT_SIZE + 1)], 'large.pdf', {
      type: 'application/pdf',
    });

    expect(validateDocument(file)).toContain('10 MB');
  });

  it('accepts a file exactly at the size limit', () => {
    const file = new File([new Uint8Array(MAX_DOCUMENT_SIZE)], 'limit.pdf', {
      type: 'application/pdf',
    });

    expect(validateDocument(file)).toBeNull();
  });
});
