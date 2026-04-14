import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule),
  },
  {
    path: 'projects',
    loadChildren: () => import('./project/project-routing.module').then(m => m.ProjectRoutingModule),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'auth/login' },
];
