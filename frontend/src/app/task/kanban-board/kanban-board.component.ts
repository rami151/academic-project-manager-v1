import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { AIService, GeminiGenerationResponse } from '../../core/services/ai.service';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import { AiGenerationDialogComponent } from '../ai-generation-dialog/ai-generation-dialog.component';
import { AiReviewDialogComponent } from '../ai-review-dialog/ai-review-dialog.component';
import { TaskCardComponent } from '../task-card/task-card.component';

interface Column {
  name: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  tasks: Task[];
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  standalone: true,
  imports: [CommonModule, DragDropModule, MatDialogModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, TaskCardComponent]
})
export class KanbanBoardComponent implements OnInit {
  projectId: string = '';
  columns: Column[] = [
    { name: 'À faire', status: 'TODO', tasks: [] },
    { name: 'En cours', status: 'IN_PROGRESS', tasks: [] },
    { name: 'Terminé', status: 'DONE', tasks: [] }
  ];
  loading = false;
  generations: GeminiGenerationResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private aiService: AIService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    if (this.projectId) {
      this.loadTasks();
      this.loadGenerations();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.taskService.getProjectTasks(this.projectId).subscribe({
      next: (tasksMap) => {
        // Use setTimeout to avoid NG0100 and ensure UI updates
        setTimeout(() => {
          this.columns[0].tasks = tasksMap['TODO'] || [];
          this.columns[1].tasks = tasksMap['IN_PROGRESS'] || [];
          this.columns[2].tasks = tasksMap['DONE'] || [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Optimistic update: move item immediately so CDK renders the change
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      const newStatus = this.columns.find(c => c.tasks === event.container.data)?.status || 'TODO';

      // Persist to backend; revert on failure
      this.taskService.moveTask(task.id, newStatus, event.currentIndex).subscribe({
        error: () => {
          this.loadTasks();
        }
      });
    }
  }

  openTaskForm(status: 'TODO' | 'IN_PROGRESS' | 'DONE'): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: { projectId: this.projectId, status }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  openAiGeneration(): void {
    const dialogRef = this.dialog.open(AiGenerationDialogComponent, {
      width: '600px',
      data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.generationId) {
        this.openAiReview(result.generationId);
      }
    });
  }

  openAiReview(generationId: string): void {
    this.dialog.open(AiReviewDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { generationId, projectId: this.projectId }
    }).afterClosed().subscribe(() => {
      this.loadTasks();
      this.loadGenerations();
    });
  }

  loadGenerations(): void {
    this.aiService.getProjectGenerations(this.projectId).subscribe({
      next: (generations) => {
        this.generations = generations.slice(0, 5);
        this.cdr.detectChanges();
      }
    });
  }
}