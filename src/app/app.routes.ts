import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'patients',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/patients/patients-list/patients-list.component').then(m => m.PatientsListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/patients/patients-detail/patients-detail.component').then(m => m.PatientsDetailComponent)
          }
        ]
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'pets',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/pets/pets-list/pets-list.component').then(m => m.PetsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/pets/pets-form/pets-form.component').then(m => m.PetsFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/pets/pets-detail/pets-detail.component').then(m => m.PetsDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/pets/pets-form/pets-form.component').then(m => m.PetsFormComponent)
          }
        ]
      },
      {
        path: 'care-sessions',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/care-sessions/care-sessions-list/care-sessions-list.component').then(m => m.CareSessionsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/care-sessions/care-sessions-form/care-sessions-form.component').then(m => m.CareSessionsFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/care-sessions/care-sessions-detail/care-sessions-detail.component').then(m => m.CareSessionsDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/care-sessions/care-sessions-form/care-sessions-form.component').then(m => m.CareSessionsFormComponent)
          }
        ]
      },
      {
        path: 'session-reports',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/session-reports/session-reports-list/session-reports-list.component').then(m => m.SessionReportsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/session-reports/session-reports-form/session-reports-form.component').then(m => m.SessionReportsFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/session-reports/session-reports-detail/session-reports-detail.component').then(m => m.SessionReportsDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/session-reports/session-reports-form/session-reports-form.component').then(m => m.SessionReportsFormComponent)
          }
        ]
      },
      {
        path: 'locations',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/locations/locations-list/locations-list.component').then(m => m.LocationsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/locations/locations-form/locations-form.component').then(m => m.LocationsFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/locations/locations-detail/locations-detail.component').then(m => m.LocationsDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/locations/locations-form/locations-form.component').then(m => m.LocationsFormComponent)
          }
        ]
      },
      {
        path: 'photos',
        loadComponent: () => import('./features/photos/photos-gallery/photos-gallery.component').then(m => m.PhotosGalleryComponent)
      },
      {
        path: 'map',
        loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/pets'
  }
];
