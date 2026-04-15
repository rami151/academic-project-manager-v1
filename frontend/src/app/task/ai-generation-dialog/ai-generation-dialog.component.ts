import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AIService } from '../../core/services/ai.service';

interface DialogData {
  projectId: string;
}

@Component({
  selector: 'app-ai-generation-dialog',
  templateUrl: './ai-generation-dialog.component.html',
  styleUrls: ['./ai-generation-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AiGenerationDialogComponent implements OnInit {
  description = '';
  formErrors: { description?: string } = {};
  loading = false;
  error: string | null = null;

  constructor(
    private aiService: AIService,
    public dialogRef: MatDialogRef<AiGenerationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {}

  generate(): void {
    this.formErrors = {};
    
    if (!this.description || this.description.length < 20) {
      this.formErrors.description = 'Description trop courte (minimum 20 caractères)';
      return;
    }

    this.loading = true;
    this.error = null;

    this.aiService.generateTasks(this.data.projectId, this.description).subscribe({
      next: (response) => {
        this.dialogRef.close({ generationId: response.generationId });
      },
      error: (err) => {
        this.error = 'Erreur lors de la génération. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}