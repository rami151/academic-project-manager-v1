import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectService, Project } from '../../core/services/project.service';
import { ProjectCreateDialogComponent } from '../project-create-dialog/project-create-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss'
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        setTimeout(() => {
          this.projects = projects;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        setTimeout(() => {
          this.errorMessage = error.message || 'Failed to load projects';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectCreateDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  navigateToDetail(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  calculateProgress(project: Project): number {
    if (!project.totalTasks || project.totalTasks === 0) {
      return 0;
    }
    return Math.round(((project.completedTasks || 0) / project.totalTasks) * 100);
  }

  formatDeadline(deadline: string): string {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
