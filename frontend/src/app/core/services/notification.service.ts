import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of, throwError } from 'rxjs';
import { switchMap, startWith, shareReplay } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

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

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
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
    if (!this.authService.isAuthenticated()) {
      return of([]);
    }

    return this.http.get<Notification[]>(`${this.apiUrl}?unreadOnly=${unreadOnly}`).pipe(
      catchError((error: HttpErrorResponse) => {
        // Notification polling should not surface as a blocking UI error when auth is missing/expired.
        if (error.status === 401 || error.status === 403) {
          this.unreadCountSubject.next(0);
          return of([]);
        }
        return throwError(() => error);
      })
    );
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