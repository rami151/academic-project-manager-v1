import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task, Priority } from '../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TaskCardComponent {
  @Input() task!: Task;

  constructor(private router: Router) {}

  get priorityClass(): string {
    const classes: Record<Priority, string> = {
      'HIGH': 'bg-danger-100 text-danger-700',
      'MEDIUM': 'bg-warning-100 text-warning-700',
      'LOW': 'bg-success-100 text-success-700'
    };
    return classes[this.task.priority];
  }

  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === 'DONE') return false;
    return new Date(this.task.dueDate) < new Date();
  }

  get priorityLabel(): string {
    const labels: Record<Priority, string> = {
      'HIGH': 'Haute',
      'MEDIUM': 'Moyenne',
      'LOW': 'Basse'
    };
    return labels[this.task.priority];
  }

  navigateToDetail(): void {
    this.router.navigate(['/tasks', this.task.id]);
  }
}