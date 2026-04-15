import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getTaskComments(taskId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/tasks/${taskId}/comments`);
  }

  createComment(taskId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/tasks/${taskId}/comments`, { content });
  }

  updateComment(commentId: string, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, { content });
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }
}