import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService, Project } from '../../core/services/project.service';
import { SnackbarService } from '../../core/services/snackbar.service';

interface FormData {
  name: string;
  description: string;
  deadline: string;
}

@Component({
  selector: 'app-project-create-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-create-dialog.component.html',
  styleUrl: './project-create-dialog.component.scss'
})
export class ProjectCreateDialogComponent {
  formData: FormData = {
    name: '',
    description: '',
    deadline: ''
  };
  
  formErrors: { name?: string; description?: string; deadline?: string } = {};
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private snackbarService: SnackbarService,
    private dialogRef: MatDialogRef<ProjectCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project }
  ) {}

  onSubmit(): void {
    this.formErrors = {};
    
    if (!this.formData.name || this.formData.name.length < 3) {
      this.formErrors.name = 'Nom requis (min 3 caractères)';
      return;
    }
    
    if (!this.formData.description || this.formData.description.length < 10) {
      this.formErrors.description = 'Description requise (min 10 caractères)';
      return;
    }
    
    if (!this.formData.deadline) {
      this.formErrors.deadline = 'Date limite requise';
      return;
    }
    
    const selectedDate = new Date(this.formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      this.formErrors.deadline = 'La date doit être future';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectService.createProject({
      name: this.formData.name,
      description: this.formData.description,
      deadline: this.formData.deadline
    }).subscribe({
      next: (newProject) => {
        this.snackbarService.success('Projet créé avec succès !');
        this.dialogRef.close(newProject);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Impossible de créer le projet';
        this.snackbarService.error('Impossible de créer le projet');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}