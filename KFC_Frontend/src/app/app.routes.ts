import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

/**
 * Fruits and vegetables are separate routes, as the brief requires. They share one page component
 * because the furniture is identical; `kind` is handed over as route data and reaches the component
 * through `withComponentInputBinding()`.
 *
 * Every page is lazily loaded, so the first paint ships only the shell and the home page.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'fruits',
    data: { kind: 'fruit' },
    loadComponent: () => import('./pages/catalogue/catalogue').then((m) => m.Catalogue),
  },
  {
    path: 'vegetables',
    data: { kind: 'vegetable' },
    loadComponent: () => import('./pages/catalogue/catalogue').then((m) => m.Catalogue),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  // The owner's screens. Not linked from the public site - you reach them by typing the address.
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/admin-login/admin-login').then((m) => m.AdminLogin),
  },
  {
    // The shell holds the sidebar and top bar; the children are the pages inside it. The guard sits
    // on the parent, so it covers every child without being repeated on each one.
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/admin-overview/admin-overview').then((m) => m.AdminOverview),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./pages/admin/admin-items/admin-items').then((m) => m.AdminItems),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/admin-users/admin-users').then((m) => m.AdminUsers),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
