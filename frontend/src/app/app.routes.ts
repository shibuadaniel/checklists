import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Public auth routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./auth/forgot-password/forgot-password.component').then(
            m => m.ForgotPasswordComponent,
          ),
      },
    ],
  },

  // Authenticated routes — all share the AppLayout shell (nav + hamburger)
  {
    path: '',
    loadComponent: () =>
      import('./layouts/app-layout/app-layout.component').then(
        m => m.AppLayoutComponent,
      ),
    // canActivate: [authGuard], // re-enable once Supabase users are set up
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            m => m.DashboardComponent,
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./features/team/team.component').then(m => m.TeamComponent),
      },
      {
        path: 'checklists/new',
        loadComponent: () =>
          import('./features/checklists/new-checklist/new-checklist.component').then(
            m => m.NewChecklistComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            m => m.SettingsComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
