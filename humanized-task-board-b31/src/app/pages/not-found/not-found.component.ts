import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div class="max-w-lg mx-auto px-4 text-center space-y-6">
        <div class="space-y-2">
          <h1 class="text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            404
          </h1>
          <p class="text-2xl font-bold text-neutral-900">Page not found</p>
        </div>
        <p class="text-neutral-600 text-lg">
          The page you're looking for doesn't exist. It might have been removed, or you may have mistyped the URL.
        </p>
        <div class="pt-4 space-y-3">
          <button routerLink="/" class="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-block w-full">
            Go to Home
          </button>
          <button routerLink="/dashboard" class="px-6 py-3 border-2 border-neutral-300 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-colors inline-block w-full">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
