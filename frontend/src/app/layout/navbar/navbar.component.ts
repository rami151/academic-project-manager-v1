import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { NotificationMenuComponent } from '../../shared/components/notification-menu/notification-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NotificationMenuComponent
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  showUserMenu: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  getUserInitial(): string {
    return this.currentUser?.name?.charAt(0).toUpperCase() || '?';
  }
}
