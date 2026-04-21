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
  private static readonly MAX_POLL_ATTEMPTS = 30; // ~60 seconds with 2s interval
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
    this.error = null;
    this.cdr.markForCheck();

    this.aiService.getGeneration(this.data.generationId).subscribe({
      next: (response) => {
        if (response.status === 'PENDING') {
          // Generation still in progress, poll every 2 seconds
          this.startPolling();
        } else if (response.status === 'DONE') {
          this.handleDoneState(response.parsedTasks ?? []);
        } else {
          this.error = this.getGenerationFailureMessage(response.failureReason, response.providerStatusCode);
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
    let attempts = 0;
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = interval(2000).pipe(
      switchMap(() => this.aiService.getGeneration(this.data.generationId)),
      takeWhile(response => response.status === 'PENDING', true)
    ).subscribe({
      next: (response) => {
        attempts++;
        if (attempts > AiReviewDialogComponent.MAX_POLL_ATTEMPTS) {
          this.error = 'La génération prend trop de temps. Vérifiez les logs backend/Gemini puis réessayez.';
          this.loading = false;
          this.pollSubscription?.unsubscribe();
        } else if (response.status === 'DONE') {
          this.handleDoneState(response.parsedTasks ?? []);
          this.pollSubscription?.unsubscribe();
        } else if (response.status === 'FAILED') {
          this.error = this.getGenerationFailureMessage(response.failureReason, response.providerStatusCode);
          this.loading = false;
          this.pollSubscription?.unsubscribe();
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
        this.pollSubscription?.unsubscribe();
        this.cdr.markForCheck();
      }
    });
  }

  private getGenerationFailureMessage(reason?: string, providerStatusCode?: number): string {
    if (providerStatusCode === 404) {
      return 'Le modele IA configure est indisponible. Mettez a jour la configuration GEMINI_MODEL.';
    }
    if (providerStatusCode === 429) {
      return 'Le quota Gemini est atteint. Reessayez plus tard.';
    }
    if (reason) {
      return `La generation a echoue: ${reason}`;
    }
    return 'La generation a echoue. Veuillez reessayer.';
  }

  private handleDoneState(parsedTasks: TaskDTO[]): void {
    this.tasks = parsedTasks.map((t, i) => ({ ...t, selected: true, index: i }));
    if (this.tasks.length === 0) {
      this.error = 'Aucune tâche valide n’a été générée. Vérifiez le format JSON renvoyé par Gemini.';
    }
    this.loading = false;
    this.cdr.markForCheck();
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
    const selectedIds = this.tasks.filter(t => t.selected).map(t => t.index);
    
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