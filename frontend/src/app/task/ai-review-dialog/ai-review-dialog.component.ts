import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AIService, TaskDTO } from '../../core/services/ai.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

interface DialogData {
  generationId: string;
  projectId: string;
}

interface TaskItem extends TaskDTO {
  selected: boolean;
  index: number;
}

@Component({
  selector: 'app-ai-review-dialog',
  templateUrl: './ai-review-dialog.component.html',
  styleUrls: ['./ai-review-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  // OnPush prevents NG0100 by only updating when explicitly told to
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiReviewDialogComponent implements OnInit, OnDestroy {
  loading = true;
  importing = false;
  tasks: TaskItem[] = [];
  error: string | null = null;
  private pollSubscription: Subscription | null = null;

  constructor(
    private aiService: AIService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AiReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.loadGeneration();
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadGeneration(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.aiService.getGeneration(this.data.generationId).subscribe({
      next: (response) => {
        if (response.status === 'PENDING') {
          // Generation still in progress, poll every 2 seconds
          this.startPolling();
        } else if (response.status === 'DONE' && response.parsedTasks) {
          this.tasks = response.parsedTasks.map((t, i) => ({ ...t, selected: true, index: i }));
          this.loading = false;
        } else {
          this.error = 'La génération a échoué. Veuillez réessayer.';
          this.loading = false;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Poll until generation completes (DONE or FAILED)
  private startPolling(): void {
    this.pollSubscription = interval(2000).pipe(
      switchMap(() => this.aiService.getGeneration(this.data.generationId)),
      takeWhile(response => response.status === 'PENDING', true)
    ).subscribe({
      next: (response) => {
        if (response.status === 'DONE' && response.parsedTasks) {
          this.tasks = response.parsedTasks.map((t, i) => ({ ...t, selected: true, index: i }));
          this.loading = false;
          this.pollSubscription?.unsubscribe();
        } else if (response.status === 'FAILED') {
          this.error = 'La génération a échoué. Veuillez réessayer.';
          this.loading = false;
          this.pollSubscription?.unsubscribe();
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleAll(): void {
    const allSelected = this.tasks.every(t => t.selected);
    this.tasks.forEach(t => t.selected = !allSelected);
    this.cdr.markForCheck();
  }

  get allSelected(): boolean {
    return this.tasks.length > 0 && this.tasks.every(t => t.selected);
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  importSelected(): void {
    const selectedIds = this.tasks.filter(t => t.selected).map(t => t.index.toString());
    
    if (selectedIds.length === 0) {
      this.error = 'Sélectionnez au moins une tâche';
      this.cdr.markForCheck();
      return;
    }

    this.importing = true;
    this.error = null;
    this.cdr.markForCheck();

    this.aiService.importTasks(this.data.generationId, selectedIds).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.error = 'Erreur lors de l\'importation';
        this.importing = false;
        this.cdr.markForCheck();
      }
    });
  }
}