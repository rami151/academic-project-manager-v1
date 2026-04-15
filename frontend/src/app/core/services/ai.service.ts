import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Priority } from '../models/task.model';

export interface TaskDTO {
  title: string;
  description: string;
  priority: Priority;
  estimatedDays: number;
}

export interface GeminiGenerationResponse {
  id: string;
  projectId: string;
  status: 'PENDING' | 'DONE' | 'FAILED';
  prompt: string;
  rawResponse: string;
  parsedTasks: TaskDTO[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = '/api/ai';

  constructor(private http: HttpClient) {}

  generateTasks(projectId: string, description: string): Observable<{ generationId: string; status: string }> {
    return this.http.post<{ generationId: string; status: string }>(`${this.apiUrl}/generate`, {
      projectId,
      description
    });
  }

  getGeneration(generationId: string): Observable<GeminiGenerationResponse> {
    return this.http.get<GeminiGenerationResponse>(`${this.apiUrl}/generations/${generationId}`);
  }

  importTasks(generationId: string, taskIds: string[]): Observable<TaskDTO[]> {
    return this.http.post<TaskDTO[]>(`${this.apiUrl}/import/${generationId}`, { taskIds });
  }

  regenerateTask(taskId: string, feedback: string): Observable<TaskDTO> {
    return this.http.post<TaskDTO>(`${this.apiUrl}/regenerate/${taskId}`, { feedback });
  }

  getProjectGenerations(projectId: string): Observable<GeminiGenerationResponse[]> {
    return this.http.get<GeminiGenerationResponse[]>(`${this.apiUrl}/projects/${projectId}/generations`);
  }
}