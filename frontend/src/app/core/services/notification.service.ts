import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, startWith, shareReplay } from 'rxjs/operators';

export interface Notification {
  id: string;
  recipientId: string;
  recipientName: string;
  type: string;
  message: string;
  refProjectId: string | null;
  refTaskId: string | null;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';
  private refreshInterval = 30000; // 30 seconds

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling(): void {
    interval(this.refreshInterval).pipe(
      startWith(0),
      switchMap(() => this.getNotifications(true)),
      shareReplay(1)
    ).subscribe(notifications => {
      this.unreadCountSubject.next(notifications.length);
    });
  }

  getNotifications(unreadOnly: boolean = false): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}?unreadOnly=${unreadOnly}`);
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/mark-all-read`, {});
  }

  refreshCount(): void {
    this.getNotifications(true).subscribe(notifications => {
      this.unreadCountSubject.next(notifications.length);
    });
  }
}