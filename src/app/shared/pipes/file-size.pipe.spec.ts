import { describe, expect, it } from 'vitest';
import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('formats bytes', () => {
    expect(pipe.transform(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(pipe.transform(2048)).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(pipe.transform(1048576)).toBe('1.0 MB');
  });

  it('handles invalid values', () => {
    expect(pipe.transform(-1)).toBe('Unknown size');
    expect(pipe.transform(Number.NaN)).toBe('Unknown size');
  });
});
