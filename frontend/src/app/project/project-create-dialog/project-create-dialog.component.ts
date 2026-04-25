import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class ProjectCreateDialogComponent implements OnInit {
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
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project }
  ) {}

  ngOnInit(): void {
    if (!this.data?.project) {
      return;
    }

    this.formData = {
      name: this.data.project.name,
      description: this.data.project.description,
      deadline: this.data.project.deadline ? this.data.project.deadline.split('T')[0] : ''
    };
  }

  get isEditMode(): boolean {
    return !!this.data?.project;
  }

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

    const payload = {
      name: this.formData.name,
      description: this.formData.description,
      deadline: this.formData.deadline.includes('T') ? this.formData.deadline : this.formData.deadline + 'T23:59:59'
    };

    const request$ = this.isEditMode && this.data.project
      ? this.projectService.updateProject(this.data.project.id, payload)
      : this.projectService.createProject(payload);

    request$.subscribe({
      next: (project) => {
        this.snackbarService.success(this.isEditMode ? 'Projet mis a jour avec succes !' : 'Projet cree avec succes !');
        this.dialogRef.close(project);
      },
      error: (error) => {
        this.errorMessage = error.message || (this.isEditMode ? 'Impossible de modifier le projet' : 'Impossible de creer le projet');
        this.snackbarService.error(this.isEditMode ? 'Impossible de modifier le projet' : 'Impossible de creer le projet');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}