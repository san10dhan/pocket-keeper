import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <p class="eyebrow">404 ERROR</p>
      <h1>We couldn't find that page.</h1>
      <p>The address may be incorrect, or the page may have moved.</p>
      <a routerLink="/dashboard">Return to dashboard</a>
    </section>
  `,
  styles: `
    .not-found {
      max-width: 650px;
      margin: 60px auto;
    }
    .eyebrow {
      color: #315c45;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    h1 {
      color: #20382a;
      font-size: clamp(2rem, 5vw, 3rem);
    }
    p {
      color: #68746b;
      line-height: 1.8;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 18px;
      border-radius: 9px;
      background: #315c45;
      color: white;
      font-weight: 700;
      text-decoration: none;
    }
    a:hover {
      background: #254a36;
    }
  `,
})
export class NotFound {}
