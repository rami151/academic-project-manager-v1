import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50"></div>
      <div class="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Content -->
          <div class="space-y-8">
            <div class="space-y-4">
              <div class="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                The Future of Project Management
              </div>
              <h1 class="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                Manage Projects with <span class="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">AI</span>
              </h1>
              <p class="text-xl text-neutral-600 leading-relaxed">
                Academic PM is your intelligent collaborative workspace. Generate tasks, prioritize automatically, and deliver projects faster.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <button routerLink="/auth/login" class="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                Launch Dashboard
              </button>
            </div>

            <div class="flex items-center gap-6 text-sm text-neutral-600">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                AI-Powered
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Real-time Collaboration
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Academic-Ready
              </div>
            </div>
          </div>

          <!-- Right Visual -->
          <div class="hidden lg:block">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl blur-2xl opacity-20"></div>
              <div class="relative bg-white rounded-2xl shadow-elevation p-8 border border-neutral-200">
                <div class="space-y-4">
                  <!-- Mock Board Header -->
                  <div class="flex items-center justify-between">
                    <h3 class="font-bold text-neutral-900">Academic Research Project</h3>
                    <span class="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-semibold">AI Generated</span>
                  </div>
                  
                  <!-- Mock Kanban Columns -->
                  <div class="grid grid-cols-3 gap-4">
                    <div class="space-y-3">
                      <div class="text-xs font-semibold text-neutral-600 uppercase">To Do</div>
                      <div class="space-y-2">
                        <div class="bg-neutral-100 rounded-lg p-3 border-l-4 border-secondary-500">
                          <p class="text-sm font-medium text-neutral-900">Literature review</p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded">High</span>
                            <span class="text-xs text-neutral-500">3 days</span>
                          </div>
                        </div>
                        <div class="bg-neutral-100 rounded-lg p-3 border-l-4 border-warning-500">
                          <p class="text-sm font-medium text-neutral-900">Setup methodology</p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded">Medium</span>
                            <span class="text-xs text-neutral-500">5 days</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <div class="text-xs font-semibold text-neutral-600 uppercase">In Progress</div>
                      <div class="space-y-2">
                        <div class="bg-white rounded-lg p-3 border-l-4 border-primary-500 shadow-sm">
                          <p class="text-sm font-medium text-neutral-900">Data collection</p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">High</span>
                            <span class="text-xs text-neutral-500">2 days</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <div class="text-xs font-semibold text-neutral-600 uppercase">Done</div>
                      <div class="space-y-2">
                        <div class="bg-success-50 rounded-lg p-3 border-l-4 border-success-500">
                          <p class="text-sm font-medium text-neutral-900">Project kickoff</p>
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded">Done</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 lg:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-neutral-900">
            Powerful Features for Academic Teams
          </h2>
          <p class="text-xl text-neutral-600 max-w-2xl mx-auto">
            Everything you need to manage academic projects like a pro
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group p-8 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mb-2">AI Task Generation</h3>
            <p class="text-neutral-600">
              Describe your project once. Our AI generates a complete task breakdown with priorities and time estimates.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="group p-8 rounded-xl border border-neutral-200 hover:border-secondary-300 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mb-2">Intelligent Kanban</h3>
            <p class="text-neutral-600">
              Drag and drop tasks between columns. Real-time sync keeps your team on the same page, always.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="group p-8 rounded-xl border border-neutral-200 hover:border-accent-300 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mb-2">Collaborative Workspace</h3>
            <p class="text-neutral-600">
              Comment on tasks, share files, and track activity. Built for teams that want to move fast together.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="group p-8 rounded-xl border border-neutral-200 hover:border-success-300 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mb-2">Progress Analytics</h3>
            <p class="text-neutral-600">
              Track progress with burndown charts, team velocity, and AI-generated insights for better planning.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="group p-8 rounded-xl border border-neutral-200 hover:border-warning-300 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mb-2">Smart Permissions</h3>
            <p class="text-neutral-600">
              Control access with owner, editor, and viewer roles. Perfect for academic teams and research projects.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="group p-8 rounded-xl border border-neutral-200 hover:border-danger-300 hover:shadow-lg transition-all">
            <div class="w-12 h-12 bg-gradient-to-br from-danger-500 to-danger-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-neutral-900 mb-2">Enterprise Security</h3>
            <p class="text-neutral-600">
              BCrypt hashing, JWT authentication, and secure data handling. Your projects are always protected.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 lg:py-32 bg-gradient-to-br from-primary-600 to-secondary-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 class="text-4xl lg:text-5xl font-bold text-white">
          Ready to Transform Your Workflow?
        </h2>
        <p class="text-xl text-primary-100">
          Join teams that are shipping faster with AI-powered project management
        </p>
        <button routerLink="/auth/login" class="px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:shadow-lg transition-all transform hover:scale-105 inline-block">
          Get Started
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-neutral-900 text-neutral-400 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="text-white font-bold mb-4">Academic PM</h3>
            <p class="text-sm">The intelligent project management platform for academic teams.</p>
          </div>
          <div>
            <h4 class="text-white font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-bold mb-4">Company</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">About</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-neutral-800 pt-8 flex justify-between items-center text-sm">
          <p>&copy; 2024 Academic PM. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="hover:text-white transition-colors">Twitter</a>
            <a href="#" class="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" class="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(20px, -50px) scale(1.1); }
      50% { transform: translate(-20px, 20px) scale(0.9); }
      75% { transform: translate(50px, 50px) scale(1.05); }
    }

    :host ::ng-deep .animate-blob {
      animation: blob 7s infinite;
    }

    :host ::ng-deep .animation-delay-2000 {
      animation-delay: 2s;
    }

    :host ::ng-deep .animation-delay-4000 {
      animation-delay: 4s;
    }
  `]
})
export class HomeComponent {}