import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <section class="empty-state">
      <div class="icon" aria-hidden="true">{{ icon() }}</div>

      <h2>{{ title() }}</h2>

      <p>{{ description() }}</p>

      <ng-content />
    </section>
  `,
  styles: `
    .empty-state {
      padding: 40px 20px;
      border: 1px dashed #d1ddd3;
      border-radius: 14px;
      background: white;
      text-align: center;
    }

    .icon {
      margin-bottom: 12px;
      color: #64816c;
      font-size: 2rem;
    }

    h2 {
      color: #20382a;
      font-size: 1.1rem;
    }

    p {
      color: #68746b;
      line-height: 1.7;
    }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input('▣');
}
