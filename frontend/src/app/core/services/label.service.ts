import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Label {
  id: string;
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getProjectLabels(projectId: string): Observable<Label[]> {
    return this.http.get<Label[]>(`${this.apiUrl}/projects/${projectId}/labels`);
  }

  createLabel(projectId: string, name: string, color: string): Observable<Label> {
    return this.http.post<Label>(`${this.apiUrl}/projects/${projectId}/labels`, { name, color });
  }

  deleteLabel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/labels/${id}`);
  }
}
