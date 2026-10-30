import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';
import { PERMISSIONS } from './core/auth/permissions';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign In | Pocket-Keeper',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard | Pocket-Keeper',
        data: { permission: PERMISSIONS.DASHBOARD_VIEW },
        canActivate: [permissionGuard],
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'belongings',
        title: 'Belongings | Pocket-Keeper',
        data: { permission: PERMISSIONS.ITEM_READ },
        canActivate: [permissionGuard],
        loadComponent: () => import('./features/belongings/belongings').then((m) => m.Belongings),
      },
      {
        path: 'documents',
        title: 'Documents | Pocket-Keeper',
        data: { permission: PERMISSIONS.DOCUMENT_READ },
        canActivate: [permissionGuard],
        loadComponent: () => import('./features/documents/documents').then((m) => m.Documents),
      },
      {
        path: 'settings',
        title: 'Settings | Pocket-Keeper',
        data: { permission: PERMISSIONS.SETTINGS_MANAGE },
        canActivate: [permissionGuard],
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  {
    path: '404',
    title: 'Page Not Found | Pocket-Keeper',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
