import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { Priority, CreateTaskRequest } from '../../core/models/task.model';

interface DialogData {
  projectId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

interface FormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  estimatedDays: number | null;
}

@Component({
  selector: 'app-task-form-dialog',
  templateUrl: './task-form-dialog.component.html',
  styleUrls: ['./task-form-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TaskFormDialogComponent implements OnInit {
  formData: FormData = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedDays: null
  };
  
  formErrors: { title?: string } = {};
  loading = false;
  
  priorities: { value: Priority; label: string }[] = [
    { value: 'HIGH', label: 'Haute' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'LOW', label: 'Basse' }
  ];

  constructor(
    private taskService: TaskService,
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.formErrors = {};
    
    if (!this.formData.title || this.formData.title.length < 3) {
      this.formErrors.title = 'Titre requis (min 3 caractères)';
      return;
    }

    this.loading = true;
    const request: CreateTaskRequest = {
      projectId: this.data.projectId,
      title: this.formData.title,
      description: this.formData.description || '',
      priority: this.formData.priority,
      dueDate: this.formData.dueDate ? new Date(this.formData.dueDate).toISOString() : null,
      estimatedDays: this.formData.estimatedDays || null,
      assignedToId: null,
      status: this.data.status
    };

    this.taskService.createTask(request).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}