import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectService, Project, ProjectMember, Permission } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { InviteMemberDialogComponent } from '../invite-member-dialog/invite-member-dialog.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss'
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  members: ProjectMember[] = [];
  isLoading = true;
  errorMessage = '';
  currentUserPermission: Permission = 'VIEWER';
  displayedColumns = ['user', 'permission', 'joinedAt', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProjectDetails(projectId);
      this.loadMembers(projectId);
    }
  }

  loadProjectDetails(projectId: string): void {
    this.isLoading = true;
    this.projectService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load project';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMembers(projectId: string): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.members = members;
        this.calculateCurrentUserPermission();
        this.cdr.detectChanges();
      },
      error: () => {
        this.members = [];
        this.cdr.detectChanges();
      }
    });
  }

  calculateCurrentUserPermission(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id && this.members && this.members.length > 0) {
      const member = this.members.find(m => m.user && m.user.id === currentUser.id);
      this.currentUserPermission = member?.permission || 'VIEWER';
    } else {
      this.currentUserPermission = 'VIEWER';
    }
  }

  openInviteDialog(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) return;

    const dialogRef = this.dialog.open(InviteMemberDialogComponent, {
      width: '500px',
      data: { projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers(projectId);
      }
    });
  }

  removeMember(member: ProjectMember): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) return;

    const memberName = member.user?.name || 'Member';
    if (confirm(`Voulez-vous vraiment retirer ${memberName} du projet?`)) {
      this.projectService.removeMember(projectId, member.id).subscribe({
        next: () => {
          this.snackbarService.success(`${memberName} a été retiré du projet`);
          this.loadMembers(projectId);
        },
        error: (error) => {
          this.snackbarService.error(error.message || 'Impossible de retirer le membre');
        }
      });
    }
  }

  updateMemberPermission(member: ProjectMember, newPermission: Permission): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) return;

    this.projectService.updateMemberPermission(projectId, member.id, newPermission).subscribe({
      next: () => {
        this.snackbarService.success('Permission mise à jour');
        this.loadMembers(projectId);
      },
      error: (error) => {
        this.snackbarService.error(error.message || 'Impossible de modifier la permission');
      }
    });
  }

  canInviteMembers(): boolean {
    return this.currentUserPermission === 'OWNER';
  }

  canEditProject(): boolean {
    return this.currentUserPermission === 'OWNER' || this.currentUserPermission === 'EDITOR';
  }

  canModifyMember(member: ProjectMember): boolean {
    return this.canInviteMembers() && member.permission !== 'OWNER';
  }

  getPermissionBadgeClass(permission: Permission): string {
    return `permission-${permission.toLowerCase()}`;
  }

  getPermissionLabel(permission: Permission): string {
    const labels: Record<Permission, string> = {
      'OWNER': 'Propriétaire',
      'EDITOR': 'Éditeur',
      'VIEWER': 'Lecteur'
    };
    return labels[permission];
  }

  getUserInitials(name: string | undefined | null): string {
    if (!name) {
      return '?';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  formatDeadline(deadline: string): string {
    const date = new Date(deadline);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  calculateProgress(): number {
    if (!this.project?.totalTasks || this.project.totalTasks === 0) {
      return 0;
    }
    return Math.round(((this.project.completedTasks || 0) / this.project.totalTasks) * 100);
  }
}
