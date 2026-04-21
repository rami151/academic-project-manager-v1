import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { LandingNavbarComponent } from './layout/landing-navbar/landing-navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, LandingNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  showNavbar = false;
  showLandingNavbar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.syncCurrentUser().subscribe({
        error: () => {
          // Keep existing interceptor-driven 401 handling behavior.
        }
      });
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        const isAuthRoute = url.startsWith('/auth');
        const isLandingPage = url === '/' || url === '';
        const isAuthenticated = this.authService.isAuthenticated();
        
        this.showLandingNavbar = isLandingPage && !isAuthenticated;
        this.showNavbar = !isAuthRoute && isAuthenticated;
      }
    });
  }
}
