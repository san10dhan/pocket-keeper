import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    @if (message()) {
      <div class="error-message" role="alert">
        <span aria-hidden="true">⚠</span>
        <span>{{ message() }}</span>
      </div>
    }
  `,
  styles: `
    .error-message {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border: 1px solid #f0d4d2;
      border-radius: 8px;
      background: #fff0ef;
      color: #b42318;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
  `,
})
export class ErrorMessage {
  readonly message = input('');
}
