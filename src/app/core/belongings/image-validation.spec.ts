import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_SIZE, validateImage } from './image-validation';

describe('validateImage', () => {
  it('accepts a JPEG image', () => {
    const file = new File(['image'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    expect(validateImage(file)).toBeNull();
  });

  it('accepts a PNG image', () => {
    const file = new File(['image'], 'photo.png', {
      type: 'image/png',
    });

    expect(validateImage(file)).toBeNull();
  });

  it('accepts a WebP image', () => {
    const file = new File(['image'], 'photo.webp', {
      type: 'image/webp',
    });

    expect(validateImage(file)).toBeNull();
  });

  it('rejects unsupported file types', () => {
    const file = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    expect(validateImage(file)).toBe('Choose a JPEG, PNG, or WebP image.');
  });

  it('rejects files larger than 5 MB', () => {
    const file = new File([new Uint8Array(MAX_IMAGE_SIZE + 1)], 'large.png', { type: 'image/png' });

    expect(validateImage(file)).toBe('The image must be 5 MB or smaller.');
  });

  it('accepts files exactly at the size limit', () => {
    const file = new File([new Uint8Array(MAX_IMAGE_SIZE)], 'limit.png', { type: 'image/png' });

    expect(validateImage(file)).toBeNull();
  });
});
