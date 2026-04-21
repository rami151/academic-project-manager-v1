import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-overdue-tasks',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './overdue-tasks.component.html'
})
export class OverdueTasksComponent implements OnInit {
  loading = false;
  tasks: Task[] = [];
  error: string | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loading = true;
    this.taskService.getOverdueTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les tâches en retard.';
        this.loading = false;
      }
    });
  }
}
