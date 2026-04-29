import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { CHECKLIST_ACCESS_ROLES } from './core/models/team.model';

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
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            m => m.DashboardComponent,
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/my-tasks/my-tasks.component').then(
            m => m.MyTasksComponent,
          ),
      },
      {
        // Team page: visible to team leads, admins, and executives
        path: 'team',
        canActivate: [roleGuard('administrator', 'executive', 'team_lead')],
        loadComponent: () =>
          import('./features/team/team.component').then(m => m.TeamComponent),
      },
      {
        path: 'checklists',
        canActivate: [roleGuard(...CHECKLIST_ACCESS_ROLES)],
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/checklists/checklists-index/checklists-index.component'
              ).then(m => m.ChecklistsIndexComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/checklists/new-checklist/new-checklist.component'
              ).then(m => m.NewChecklistComponent),
          },
        ],
      },
      {
        // Settings: admin and executive only
        path: 'settings',
        canActivate: [roleGuard('administrator', 'executive')],
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            m => m.SettingsComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
