import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TaskService } from '../../core/services/task.service';
import { CommentService, Comment } from '../../core/services/comment.service';
import { AttachmentService, Attachment } from '../../core/services/attachment.service';
import { AuthService } from '../../core/services/auth.service';
import { AIService } from '../../core/services/ai.service';
import { LabelService, Label } from '../../core/services/label.service';
import { ProjectService, ProjectMember } from '../../core/services/project.service';
import { Task, Priority } from '../../core/models/task.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  loadingTask = true;
  taskLoadError: string | null = null;
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  activeTab: 'details' | 'comments' | 'attachments' = 'details';
  
  newComment = '';
  editingCommentId: string | null = null;
  editingCommentContent = '';
  
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  
  currentUserId: string | null = null;

  // AI & Labels features
  showAiFeedback = false;
  aiFeedback = '';
  isRegenerating = false;
  projectLabels: Label[] = [];
  showLabelManager = false;
  projectMembers: ProjectMember[] = [];
  selectedAssigneeId = '';
  assigningTask = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private commentService: CommentService,
    private attachmentService: AttachmentService,
    private authService: AuthService,
    private aiService: AIService,
    private labelService: LabelService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || null;

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const taskId = params.get('id');
        if (!taskId) {
          this.task = null;
          this.loadingTask = false;
          this.taskLoadError = 'Identifiant de tâche invalide.';
          return;
        }

        this.loadTask(taskId);
        this.loadComments(taskId);
        this.loadAttachments(taskId);
      });
  }

  loadTask(taskId: string): void {
    this.loadingTask = true;
    this.taskLoadError = null;
    this.task = null;

    this.taskService.getTaskById(taskId)
      .pipe(
        finalize(() => {
          this.loadingTask = false;
        })
      )
      .subscribe({
        next: (task) => {
          this.task = task;
          this.selectedAssigneeId = '';
          this.loadProjectLabels(task.projectId);
          this.loadProjectMembers(task.projectId, task.assignedToEmail);
        },
        error: () => {
          this.taskLoadError = 'Impossible de charger cette tâche.';
          this.snackBar.open('Erreur lors du chargement de la tâche', 'Fermer', { duration: 3000 });
        }
      });
  }

  loadProjectLabels(projectId: string): void {
    this.labelService.getProjectLabels(projectId).subscribe({
      next: (labels) => this.projectLabels = labels
    });
  }

  loadProjectMembers(projectId: string, assignedToEmail: string | null): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members) => {
        this.projectMembers = members;
        const selectedMember = members.find(member => member.user.email === assignedToEmail);
        this.selectedAssigneeId = selectedMember?.user.id || '';
      },
      error: () => {
        this.projectMembers = [];
        this.selectedAssigneeId = '';
      }
    });
  }

  loadComments(taskId: string): void {
    this.commentService.getTaskComments(taskId).subscribe({
      next: (comments) => this.comments = comments
    });
  }

  loadAttachments(taskId: string): void {
    this.attachmentService.getTaskAttachments(taskId).subscribe({
      next: (attachments) => this.attachments = attachments
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.task) return;
    
    this.commentService.createComment(this.task.id, this.newComment).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
        this.snackBar.open('Commentaire ajouté', 'Fermer', { duration: 2000 });
      },
      error: () => this.snackBar.open('Erreur lors de l\'ajout du commentaire', 'Fermer', { duration: 3000 })
    });
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId = comment.id;
    this.editingCommentContent = comment.content;
  }

  saveEditComment(): void {
    if (!this.editingCommentId || !this.editingCommentContent.trim()) return;
    
    this.commentService.updateComment(this.editingCommentId, this.editingCommentContent).subscribe({
      next: (updated) => {
        const index = this.comments.findIndex(c => c.id === updated.id);
        if (index !== -1) this.comments[index] = updated;
        this.cancelEditComment();
        this.snackBar.open('Commentaire mis à jour', 'Fermer', { duration: 2000 });
      },
      error: () => this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 })
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentContent = '';
  }

  deleteComment(commentId: string): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        this.snackBar.open('Commentaire supprimé', 'Fermer', { duration: 2000 });
      },
      error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
    });
  }

  isCommentOwner(comment: Comment): boolean {
    return comment.authorId === this.currentUserId;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.task) return;
    
    if (this.selectedFile.size > 10 * 1024 * 1024) {
      this.snackBar.open('Fichier dépasse 10 MB', 'Fermer', { duration: 3000 });
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;

    this.attachmentService.uploadAttachment(this.task.id, this.selectedFile).subscribe({
      next: (attachment) => {
        this.attachments.push(attachment);
        this.selectedFile = null;
        this.uploading = false;
        this.uploadProgress = 0;
        this.snackBar.open('Fichier téléchargé avec succès', 'Fermer', { duration: 2000 });
      },
      error: () => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 3000 });
      }
    });
  }

  downloadFile(attachment: Attachment): void {
    this.attachmentService.downloadAttachment(attachment);
  }

  deleteAttachment(attachment: Attachment): void {
    if (!confirm('Supprimer ce fichier ?')) return;
    
    this.attachmentService.deleteAttachment(attachment.id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter(a => a.id !== attachment.id);
        this.snackBar.open('Fichier supprimé', 'Fermer', { duration: 2000 });
      },
      error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
    });
  }

  regenerateTask(): void {
    if (!this.task || !this.aiFeedback.trim()) return;
    this.isRegenerating = true;
    this.aiService.regenerateTask(this.task.id, this.aiFeedback).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
        this.isRegenerating = false;
        this.showAiFeedback = false;
        this.aiFeedback = '';
        this.snackBar.open('Tâche régénérée par l\'IA', 'Fermer', { duration: 2000 });
      },
      error: () => {
        this.isRegenerating = false;
        this.snackBar.open('Erreur lors de la régénération AI', 'Fermer', { duration: 3000 });
      }
    });
  }

  hasLabel(labelId: string): boolean {
    return !!this.task?.labels.find(l => l.id === labelId);
  }

  toggleLabel(label: Label): void {
    if (!this.task) return;
    
    const currentLabelIds = this.task.labels.map(l => l.id);
    let newLabelIds: string[];
    
    if (this.hasLabel(label.id)) {
      newLabelIds = currentLabelIds.filter(id => id !== label.id);
    } else {
      newLabelIds = [...currentLabelIds, label.id];
    }

    this.taskService.updateTask(this.task.id, { labelIds: newLabelIds }).subscribe({
      next: (updated) => {
        this.task = updated;
      },
      error: () => this.snackBar.open('Erreur lors de la mise à jour des labels', 'Fermer', { duration: 3000 })
    });
  }

  onAssigneeChange(assigneeId: string): void {
    if (!this.task || this.assigningTask) return;

    const normalizedAssigneeId = assigneeId || null;
    const currentAssigneeId = this.selectedAssigneeId || null;
    if (currentAssigneeId === normalizedAssigneeId) {
      return;
    }

    this.assigningTask = true;
    const request$ = normalizedAssigneeId
      ? this.taskService.assignTask(this.task.id, normalizedAssigneeId)
      : this.taskService.updateTask(this.task.id, { assignedToId: null });

    request$.subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
        this.selectedAssigneeId = normalizedAssigneeId || '';
        this.assigningTask = false;
        this.snackBar.open('Assignation mise a jour', 'Fermer', { duration: 2000 });
      },
      error: () => {
        this.assigningTask = false;
        this.snackBar.open('Erreur lors de l assignation', 'Fermer', { duration: 3000 });
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR');
  }

  goBack(): void {
    if (this.task) {
      this.router.navigate(['/projects', this.task.projectId, 'kanban']);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'TODO': 'bg-neutral-100 text-neutral-700',
      'IN_PROGRESS': 'bg-primary-100 text-primary-700',
      'DONE': 'bg-success-100 text-success-700'
    };
    return classes[status] || 'bg-neutral-100 text-neutral-700';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'HIGH': 'bg-danger-100 text-danger-700',
      'MEDIUM': 'bg-warning-100 text-warning-700',
      'LOW': 'bg-success-100 text-success-700'
    };
    return classes[priority] || 'bg-neutral-100 text-neutral-700';
  }
}