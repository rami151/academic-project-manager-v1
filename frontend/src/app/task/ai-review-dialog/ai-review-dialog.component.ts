import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AIService, TaskDTO } from '../../core/services/ai.service';

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
  imports: [CommonModule, FormsModule]
})
export class AiReviewDialogComponent implements OnInit {
  loading = true;
  importing = false;
  tasks: TaskItem[] = [];
  error: string | null = null;

  constructor(
    private aiService: AIService,
    public dialogRef: MatDialogRef<AiReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.loadGeneration();
  }

  loadGeneration(): void {
    this.loading = true;
    this.aiService.getGeneration(this.data.generationId).subscribe({
      next: (response) => {
        this.tasks = response.parsedTasks.map((t, i) => ({ ...t, selected: true, index: i }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }

  toggleAll(): void {
    const allSelected = this.tasks.every(t => t.selected);
    this.tasks.forEach(t => t.selected = !allSelected);
  }

  get allSelected(): boolean {
    return this.tasks.length > 0 && this.tasks.every(t => t.selected);
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  importSelected(): void {
    const selectedIds = this.tasks.filter(t => t.selected).map(t => t.index.toString());
    
    if (selectedIds.length === 0) {
      this.error = 'Sélectionnez au moins une tâche';
      return;
    }

    this.importing = true;
    this.error = null;

    this.aiService.importTasks(this.data.generationId, selectedIds).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.error = 'Erreur lors de l\'importation';
        this.importing = false;
      }
    });
  }
}