import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return 'Unknown size';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
