import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { KanbanComponent } from './components/kanban/kanban';

export default [
  { path: '', component: DashboardComponent },
  { path: ':id/kanban', component: KanbanComponent },
] satisfies Routes;
