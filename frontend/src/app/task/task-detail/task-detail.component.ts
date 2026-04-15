import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { CommentService, Comment } from '../../core/services/comment.service';
import { AttachmentService, Attachment } from '../../core/services/attachment.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/task.model';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private commentService: CommentService,
    private attachmentService: AttachmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || null;
    
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
      this.loadComments(taskId);
      this.loadAttachments(taskId);
    }
  }

  loadTask(taskId: string): void {
    this.taskService.getTaskById(taskId).subscribe({
      next: (task) => this.task = task,
      error: () => this.snackBar.open('Erreur lors du chargement de la tâche', 'Fermer', { duration: 3000 })
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
        this.snackBar.open('Fichier上传成功', 'Fermer', { duration: 2000 });
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
      'REVIEW': 'bg-warning-100 text-warning-700',
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