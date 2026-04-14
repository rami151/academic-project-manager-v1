import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService, Permission } from '../../core/services/project.service';
import { SnackbarService } from '../../core/services/snackbar.service';

interface PermissionOption {
  value: Permission;
  label: string;
  description: string;
}

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.scss'
})
export class InviteMemberDialogComponent {
  inviteForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  permissions: PermissionOption[] = [
    { value: 'EDITOR', label: 'Éditeur', description: 'Peut créer et modifier les tâches' },
    { value: 'VIEWER', label: 'Lecteur', description: 'Peut seulement consulter' }
  ];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private snackbarService: SnackbarService,
    private dialogRef: MatDialogRef<InviteMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string }
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      permission: ['EDITOR', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.inviteForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.projectService.inviteMember(this.data.projectId, this.inviteForm.value).subscribe({
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
