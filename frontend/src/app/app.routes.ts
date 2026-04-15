import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule),
  },
  {
    path: 'projects',
    loadChildren: () => import('./project/project-routing.module').then(m => m.ProjectRoutingModule),
    canActivate: [authGuard]
  },
  {
    path: 'tasks',
    loadChildren: () => import('./task/task-routing.module').then(m => m.TaskRoutingModule),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' },
];
