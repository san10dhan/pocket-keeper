import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { PERMISSIONS } from './core/auth/permissions';
import { HasPermissionDirective } from './shared/directives/has-permission.directive';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, HasPermissionDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly PERMISSIONS = PERMISSIONS;
  protected readonly appName = 'Pocket-Keeper';
  protected readonly menuOpen = signal(false);

  protected readonly navigation = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '⌂',
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      label: 'Belongings',
      path: '/belongings',
      icon: '▣',
      permission: PERMISSIONS.ITEM_READ,
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: '▤',
      permission: PERMISSIONS.DOCUMENT_READ,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: '⚙',
      permission: PERMISSIONS.SETTINGS_MANAGE,
    },
  ];

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.closeMenu();
    void this.router.navigate(['/login']);
  }
}
