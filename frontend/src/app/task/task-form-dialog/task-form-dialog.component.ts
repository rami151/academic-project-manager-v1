import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task.service';
import { LabelService, Label } from '../../core/services/label.service';
import { Priority, CreateTaskRequest, TaskStatus } from '../../core/models/task.model';

interface DialogData {
  projectId: string;
  status: TaskStatus;
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
  
  availableLabels: Label[] = [];
  selectedLabelIds: string[] = [];
  
  priorities: { value: Priority; label: string }[] = [
    { value: 'HIGH', label: 'Haute' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'LOW', label: 'Basse' }
  ];

  constructor(
    private taskService: TaskService,
    private labelService: LabelService,
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.loadLabels();
  }

  loadLabels(): void {
    this.labelService.getProjectLabels(this.data.projectId).subscribe({
      next: (labels) => this.availableLabels = labels
    });
  }

  toggleLabel(labelId: string): void {
    if (this.selectedLabelIds.includes(labelId)) {
      this.selectedLabelIds = this.selectedLabelIds.filter(id => id !== labelId);
    } else {
      this.selectedLabelIds.push(labelId);
    }
  }

  isLabelSelected(labelId: string): boolean {
    return this.selectedLabelIds.includes(labelId);
  }

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
      status: this.data.status,
      labelIds: this.selectedLabelIds
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