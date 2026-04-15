import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-menu.component.html',
  styleUrls: ['./notification-menu.component.scss']
})
export class NotificationMenuComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  showMenu = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.loadNotifications();
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(false).subscribe({
      next: (notifications) => this.notifications = notifications.slice(0, 10)
    });
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.notificationService.refreshCount();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.notificationService.refreshCount();
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    if (notification.refTaskId) {
      this.router.navigate(['/tasks', notification.refTaskId]);
    } else if (notification.refProjectId) {
      this.router.navigate(['/projects', notification.refProjectId, 'kanban']);
    }
    
    this.showMenu = false;
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }
}