import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.default),
  },
  {
    path: 'project',
    loadChildren: () => import('./project/project.routes').then(m => m.default),
  },
];
