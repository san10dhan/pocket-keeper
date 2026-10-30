import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <section class="page">
      <p class="eyebrow">PREFERENCES</p>
      <h1>Settings</h1>
      <p class="description">Manage your Pocket-Keeper workspace and preferences.</p>

      <div class="placeholder">
        <span aria-hidden="true">⚙</span>
        <h2>Workspace settings</h2>
        <p>
          We'll introduce account preferences, user roles, permissions, and administration as the
          application grows.
        </p>
      </div>
    </section>
  `,
  styles: `
    .page {
      max-width: 900px;
      margin: 0 auto;
    }
    .eyebrow {
      color: #315c45;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    h1 {
      margin: 12px 0;
      color: #20382a;
      font-size: 2.5rem;
    }
    .description {
      color: #68746b;
      line-height: 1.8;
    }
    .placeholder {
      margin-top: 34px;
      padding: 32px;
      border: 1px solid #e0e8e1;
      border-radius: 16px;
      background: white;
    }
    .placeholder > span {
      color: #315c45;
      font-size: 1.8rem;
    }
    h2 {
      color: #304437;
      font-size: 1.2rem;
    }
    .placeholder p {
      max-width: 550px;
      color: #68746b;
      line-height: 1.8;
    }
  `,
})
export class Settings {}
