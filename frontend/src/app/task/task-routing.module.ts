import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { OverdueTasksComponent } from './overdue-tasks/overdue-tasks.component';

const routes: Routes = [
  { path: 'overdue', component: OverdueTasksComponent },
  { path: 'projects/:projectId/kanban', component: KanbanBoardComponent },
  { path: ':id', component: TaskDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule {}