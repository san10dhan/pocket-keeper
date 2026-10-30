import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly delegate = inject(ErrorHandler, { skipSelf: true });

  handleError(error: unknown): void {
    // Preserve Angular's default error reporting.
    this.delegate.handleError(error);
  }
}
