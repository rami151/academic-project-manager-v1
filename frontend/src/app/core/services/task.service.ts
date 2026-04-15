import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = '/api/tasks';

  constructor(private http: HttpClient) {}

  getProjectTasks(projectId: string): Observable<Record<TaskStatus, Task[]>> {
    return this.http.get<Record<TaskStatus, Task[]>>(`${this.apiUrl}/projects/${projectId}`);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(data: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}`, data);
  }

  updateTask(id: string, data: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, data);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  moveTask(id: string, status: TaskStatus, position: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, { status, position });
  }

  assignTask(id: string, assigneeId: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/assign`, { assigneeId });
  }

  addLabel(id: string, labelId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/labels`, { labelId });
  }

  getOverdueTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/overdue`);
  }
}