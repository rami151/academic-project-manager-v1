import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-white border-b border-neutral-200 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">P</span>
            </div>
            <span class="font-bold text-xl text-neutral-900 hidden sm:inline">Academic PM</span>
          </a>

          <!-- CTA Buttons -->
          <div class="flex items-center gap-4">
            <button routerLink="/auth/login" class="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors">
              Sign In
            </button>
            <button routerLink="/auth/register" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class LandingNavbarComponent {}