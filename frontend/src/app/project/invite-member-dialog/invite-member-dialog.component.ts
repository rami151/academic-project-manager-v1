import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectService, Permission } from '../../core/services/project.service';
import { SnackbarService } from '../../core/services/snackbar.service';

interface PermissionOption {
  value: Permission;
  label: string;
  description: string;
}

interface FormData {
  email: string;
  permission: Permission;
}

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss'
})
export class InviteMemberDialogComponent {
  formData: FormData = {
    email: '',
    permission: 'EDITOR'
  };
  
  formErrors: { email?: string; permission?: string } = {};
  isSubmitting = false;
  errorMessage = '';
  
  permissions: PermissionOption[] = [
    { value: 'EDITOR', label: 'Éditeur', description: 'Peut créer et modifier les tâches' },
    { value: 'VIEWER', label: 'Lecteur', description: 'Peut seulement consulter' }
  ];

  constructor(
    private projectService: ProjectService,
    private snackbarService: SnackbarService,
    private dialogRef: MatDialogRef<InviteMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string }
  ) {}

  onSubmit(): void {
    this.formErrors = {};
    
    if (!this.formData.email) {
      this.formErrors.email = 'Email requis';
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.formErrors.email = 'Email invalide';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectService.inviteMember(this.data.projectId, {
      email: this.formData.email,
      permission: this.formData.permission
    }).subscribe({
      next: (member) => {
        this.snackbarService.success(`${member.user.name} a été invité au projet`);
        this.dialogRef.close(member);
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = 'Cet utilisateur est déjà membre du projet';
          this.snackbarService.warning('Cet utilisateur est déjà membre du projet');
        } else if (error.status === 404) {
          this.errorMessage = 'Aucun utilisateur trouvé avec cet email';
          this.snackbarService.error('Aucun utilisateur trouvé avec cet email');
        } else {
          this.errorMessage = error.message || 'Une erreur est survenue';
          this.snackbarService.error('Une erreur est survenue');
        }
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}