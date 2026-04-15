import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Attachment {
  id: string;
  taskId: string;
  uploadedById: string;
  uploadedByName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getTaskAttachments(taskId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/tasks/${taskId}/attachments`);
  }

  uploadAttachment(taskId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.apiUrl}/tasks/${taskId}/attachments`, formData);
  }

  deleteAttachment(attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}`);
  }

  downloadAttachment(attachment: Attachment): void {
    window.open(`${this.apiUrl}/attachments/${attachment.id}/download?fileUrl=${encodeURIComponent(attachment.fileUrl)}`, '_blank');
  }
}