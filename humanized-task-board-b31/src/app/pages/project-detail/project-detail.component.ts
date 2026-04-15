import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center space-y-6">
          <div class="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-neutral-900">Project Details</h1>
          <p class="text-neutral-600 max-w-md mx-auto">
            This page will show detailed information about a specific project including tasks, team members, and analytics.
          </p>
          <button routerLink="/dashboard" class="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-block">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProjectDetailComponent {}
