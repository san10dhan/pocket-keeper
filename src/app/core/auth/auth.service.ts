import { Injectable, computed, signal } from '@angular/core';
import type { DemoAccount, LoginCredentials, User } from './auth.models';

const SESSION_KEY = 'pocket-keeper-session';

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'user-admin',
    name: 'Test Admin',
    email: 'admin@pocketkeeper.demo',
    password: 'Admin@123!test',
    role: 'admin',
  },
  {
    id: 'user-member',
    name: 'Test Member',
    email: 'member@pocketkeeper.demo',
    password: 'Member@123!test',
    role: 'member',
  },
  {
    id: 'user-viewer',
    name: 'Test Viewer',
    email: 'viewer@pocketkeeper.demo',
    password: 'Viewer@123!test',
    role: 'viewer',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserState = signal<User | null>(this.restoreSession());

  readonly currentUser = this.currentUserState.asReadonly();

  readonly isAuthenticated = computed(() => this.currentUserState() !== null);

  login(credentials: LoginCredentials): boolean {
    const email = credentials.email.trim().toLowerCase();

    const account = DEMO_ACCOUNTS.find(
      (candidate) => candidate.email === email && candidate.password === credentials.password,
    );

    if (!account) {
      return false;
    }

    const user: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {
      // Allow login for this tab if browser storage is unavailable.
    }

    this.currentUserState.set(user);

    return true;
  }

  logout(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Continue clearing in-memory authentication state.
    }

    this.currentUserState.set(null);
  }

  private restoreSession(): User | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);

      if (!stored) {
        return null;
      }

      const candidate: unknown = JSON.parse(stored);

      if (!this.isValidUser(candidate)) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return candidate;
    } catch {
      return null;
    }
  }

  private isValidUser(value: unknown): value is User {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate['id'] === 'string' &&
      typeof candidate['name'] === 'string' &&
      typeof candidate['email'] === 'string' &&
      ['admin', 'member', 'viewer'].includes(candidate['role'] as string)
    );
  }
}
