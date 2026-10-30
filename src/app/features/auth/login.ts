import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="login-page">
      <section class="login-card">
        <a class="brand" href="/dashboard">
          <span class="brand-icon">PK</span>
          <span>Pocket-Keeper</span>
        </a>

        <p class="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your workspace</h1>

        <p class="description">Access your belongings and important documents.</p>

        @if (errorMessage()) {
          <div class="error-message" role="alert">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label for="email">Email address</label>

          <input
            id="email"
            type="email"
            formControlName="email"
            autocomplete="username"
            placeholder="you@example.com"
          />

          @if (form.controls.email.touched && form.controls.email.invalid) {
            <small class="field-error"> Enter a valid email address. </small>
          }

          <label for="password">Password</label>

          <input
            id="password"
            type="password"
            formControlName="password"
            autocomplete="current-password"
            placeholder="Enter your password"
          />

          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="field-error"> Password is required. </small>
          }

          <button type="submit">Sign in</button>
        </form>

        <section class="demo-accounts">
          <h2>Demo accounts</h2>

          @for (account of demoAccounts; track account.email) {
            <button
              class="demo-account"
              type="button"
              (click)="fillAccount(account.email, account.password)"
            >
              <span>{{ account.role }}</span>
              <span>Use account →</span>
            </button>
          }
        </section>

        <p class="disclaimer">
          Demonstration authentication only. Do not enter real passwords or sensitive information.
        </p>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-page {
      display: grid;
      min-height: 100vh;
      place-items: center;
      padding: 24px;
      background: #f4f7f4;
    }

    .login-card {
      width: min(100%, 440px);
      padding: 36px;
      border: 1px solid #e0e8e1;
      border-radius: 18px;
      background: white;
      box-shadow: 0 12px 40px rgb(32 56 42 / 5%);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
      color: #20382a;
      font-size: 1.1rem;
      font-weight: 800;
      text-decoration: none;
    }

    .brand-icon {
      display: grid;
      width: 42px;
      height: 42px;
      place-items: center;
      border-radius: 12px;
      background: #315c45;
      color: white;
    }

    .eyebrow {
      color: #315c45;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    h1 {
      color: #20382a;
      font-size: 1.9rem;
      letter-spacing: -1px;
    }

    .description,
    .disclaimer {
      color: #68746b;
      line-height: 1.7;
    }

    form {
      display: grid;
      gap: 10px;
      margin-top: 28px;
    }

    label {
      margin-top: 8px;
      color: #304437;
      font-weight: 700;
    }

    input {
      width: 100%;
      min-height: 44px;
      padding: 11px 12px;
      border: 1px solid #dce5dd;
      border-radius: 8px;
      background: #fff;
      color: #20382a;
    }

    input:focus {
      border-color: #548267;
      outline: 2px solid #d5e9d9;
    }

    form > button {
      min-height: 46px;
      margin-top: 12px;
      border: 0;
      border-radius: 9px;
      background: #315c45;
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    form > button:hover {
      background: #254a36;
    }

    .field-error {
      color: #b42318;
    }

    .error-message {
      padding: 12px;
      border-radius: 8px;
      background: #fff0ef;
      color: #b42318;
      line-height: 1.5;
    }

    .demo-accounts {
      margin-top: 30px;
    }

    .demo-accounts h2 {
      font-size: 0.9rem;
      color: #304437;
    }

    .demo-account {
      display: flex;
      width: 100%;
      justify-content: space-between;
      padding: 12px 0;
      border: 0;
      border-bottom: 1px solid #edf1ed;
      background: transparent;
      color: #315c45;
      text-align: left;
      cursor: pointer;
    }

    .demo-account span:last-child {
      font-size: 0.8rem;
    }

    .disclaimer {
      margin-top: 22px;
      font-size: 0.75rem;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px;
      }
    }
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly errorMessage = signal('');

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@pocketkeeper.demo',
      password: 'Admin123!',
    },
    {
      role: 'Member',
      email: 'member@pocketkeeper.demo',
      password: 'Member123!',
    },
    {
      role: 'Viewer',
      email: 'viewer@pocketkeeper.demo',
      password: 'Viewer123!',
    },
  ];

  protected fillAccount(email: string, password: string): void {
    this.form.setValue({ email, password });
    this.errorMessage.set('');
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage.set('');

    if (this.form.invalid) {
      return;
    }

    if (!this.auth.login(this.form.getRawValue())) {
      this.errorMessage.set('The email or password is incorrect. Please try again.');
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Only navigate to local application paths.
    const destination =
      returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard';

    void this.router.navigateByUrl(destination);
  }
}
