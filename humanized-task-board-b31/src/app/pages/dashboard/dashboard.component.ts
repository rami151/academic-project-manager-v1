import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDays: number;
  assignee?: string;
  aiGenerated: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <!-- Header -->
      <div class="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-neutral-900">Projects</h1>
              <p class="text-neutral-600 mt-1">Manage your collaborative projects with AI-powered task generation</p>
            </div>
            <button class="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              + New Project
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (selectedProject()) {
          <!-- Kanban View -->
          <div class="space-y-6">
            <!-- Project Header -->
            <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-neutral-900">{{ selectedProject()?.name }}</h2>
                  <p class="text-neutral-600 mt-1">{{ selectedProject()?.description }}</p>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-primary-600">{{ selectedProject()?.progress }}%</div>
                  <p class="text-sm text-neutral-600">Complete</p>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                  [style.width.%]="selectedProject()?.progress"
                ></div>
              </div>
            </div>

            <!-- Generate AI Tasks -->
            <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <svg class="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    AI Task Generator
                  </h3>
                  <p class="text-neutral-600 text-sm mt-1">Describe your project and let AI generate a complete task breakdown with priorities and time estimates</p>
                </div>
              </div>

              <div class="mt-4 space-y-3">
                <textarea 
                  class="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Describe your project... (e.g., 'Build a mobile app for task management with authentication, database, and UI')"
                  rows="3"
                ></textarea>
                <button class="px-6 py-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                  Generate Tasks with AI
                </button>
              </div>
            </div>

            <!-- Kanban Columns -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- To Do Column -->
              <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-neutral-900 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-neutral-400"></span>
                    À faire ({{ todoTasks().length }})
                  </h3>
                </div>

                <div class="space-y-3">
                  @for (task of todoTasks(); track task.id) {
                    <div class="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all cursor-move group">
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold text-neutral-900 text-sm group-hover:text-primary-600 transition-colors">{{ task.title }}</h4>
                        @if (task.aiGenerated) {
                          <span class="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded whitespace-nowrap ml-2">AI</span>
                        }
                      </div>
                      <p class="text-xs text-neutral-600 mb-3 line-clamp-2">{{ task.description }}</p>

                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span [class]="'text-xs px-2 py-1 rounded font-medium ' + getPriorityClass(task.priority)">
                            {{ task.priority }}
                          </span>
                          <span class="text-xs text-neutral-500">{{ task.estimatedDays }}d</span>
                        </div>
                        @if (task.assignee) {
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-white flex items-center justify-center text-xs font-bold">
                            {{ task.assignee.charAt(0) }}
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <button class="w-full py-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors">
                    + Add Task
                  </button>
                </div>
              </div>

              <!-- In Progress Column -->
              <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-neutral-900 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                    En cours ({{ inProgressTasks().length }})
                  </h3>
                </div>

                <div class="space-y-3">
                  @for (task of inProgressTasks(); track task.id) {
                    <div class="bg-primary-50 rounded-lg p-4 border-2 border-primary-200 hover:border-primary-400 hover:shadow-sm transition-all cursor-move group">
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold text-neutral-900 text-sm group-hover:text-primary-700 transition-colors">{{ task.title }}</h4>
                        @if (task.aiGenerated) {
                          <span class="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded whitespace-nowrap ml-2">AI</span>
                        }
                      </div>
                      <p class="text-xs text-neutral-600 mb-3 line-clamp-2">{{ task.description }}</p>

                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span [class]="'text-xs px-2 py-1 rounded font-medium ' + getPriorityClass(task.priority)">
                            {{ task.priority }}
                          </span>
                          <span class="text-xs text-neutral-500">{{ task.estimatedDays }}d</span>
                        </div>
                        @if (task.assignee) {
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-white flex items-center justify-center text-xs font-bold">
                            {{ task.assignee.charAt(0) }}
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <button class="w-full py-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors">
                    + Add Task
                  </button>
                </div>
              </div>

              <!-- Done Column -->
              <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-neutral-900 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-success-500"></span>
                    Terminé ({{ doneTasks().length }})
                  </h3>
                </div>

                <div class="space-y-3">
                  @for (task of doneTasks(); track task.id) {
                    <div class="bg-success-50 rounded-lg p-4 border border-success-200 hover:shadow-sm transition-all cursor-move group">
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold text-neutral-900 text-sm line-through text-neutral-600 group-hover:text-success-700 transition-colors">{{ task.title }}</h4>
                        @if (task.aiGenerated) {
                          <span class="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded whitespace-nowrap ml-2">AI</span>
                        }
                      </div>

                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span [class]="'text-xs px-2 py-1 rounded font-medium ' + getPriorityClass(task.priority)">
                            {{ task.priority }}
                          </span>
                          <span class="text-xs text-neutral-500">{{ task.estimatedDays }}d</span>
                        </div>
                        @if (task.assignee) {
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-success-400 to-success-500 text-white flex items-center justify-center text-xs font-bold">
                            {{ task.assignee.charAt(0) }}
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <button class="w-full py-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors">
                    + Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <!-- Projects Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of projects(); track project.id) {
              <div 
                class="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
                (click)="selectProject(project)"
              >
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{{ project.name }}</h3>
                    <p class="text-sm text-neutral-600 mt-1">{{ project.description }}</p>
                  </div>
                  <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>

                <div class="space-y-3">
                  <div>
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-xs font-semibold text-neutral-600">Progress</span>
                      <span class="text-sm font-bold text-primary-600">{{ project.progress }}%</span>
                    </div>
                    <div class="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                        [style.width.%]="project.progress"
                      ></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-xs text-neutral-600">
                    <span>5 tasks</span>
                    <span>3 members</span>
                  </div>
                </div>
              </div>
            }

            <!-- New Project Card -->
            <div class="bg-white rounded-xl shadow-sm border-2 border-dashed border-neutral-300 p-6 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer flex items-center justify-center min-h-64 group">
              <div class="text-center">
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">Create New Project</h3>
                <p class="text-sm text-neutral-600 mt-1">Start a new collaborative project</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent {
  projects = signal<Project[]>([
    {
      id: '1',
      name: 'Q1 Product Launch',
      description: 'Launch our new feature set for Q1 2024',
      progress: 65,
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      description: 'Modernize the mobile app UI/UX',
      progress: 40,
    },
    {
      id: '3',
      name: 'Backend Optimization',
      description: 'Improve API performance and database queries',
      progress: 80,
    },
  ]);

  selectedProject = signal<Project | null>(null);

  tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Design mockups',
      description: 'Create high-fidelity mockups for all screens',
      priority: 'HIGH',
      estimatedDays: 3,
      assignee: 'Alice',
      aiGenerated: true,
    },
    {
      id: '2',
      title: 'Setup database',
      description: 'Configure PostgreSQL and create initial schema',
      priority: 'HIGH',
      estimatedDays: 2,
      assignee: 'Bob',
      aiGenerated: true,
    },
    {
      id: '3',
      title: 'Frontend scaffold',
      description: 'Setup Angular project with routing and components',
      priority: 'HIGH',
      estimatedDays: 2,
      assignee: 'Charlie',
      aiGenerated: false,
    },
    {
      id: '4',
      title: 'API integration',
      description: 'Integrate frontend with backend APIs',
      priority: 'MEDIUM',
      estimatedDays: 4,
      assignee: 'David',
      aiGenerated: true,
    },
    {
      id: '5',
      title: 'Testing',
      description: 'Write unit and integration tests',
      priority: 'MEDIUM',
      estimatedDays: 5,
      assignee: 'Eve',
      aiGenerated: true,
    },
    {
      id: '6',
      title: 'Documentation',
      description: 'Write API documentation and user guide',
      priority: 'LOW',
      estimatedDays: 2,
      assignee: 'Frank',
      aiGenerated: false,
    },
    {
      id: '7',
      title: 'Project kickoff',
      description: 'Team alignment and planning meeting',
      priority: 'HIGH',
      estimatedDays: 1,
      assignee: 'Grace',
      aiGenerated: false,
    },
  ]);

  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);

  constructor() {
    // Mock task distribution
    this.todoTasks.set([
      this.tasks()[0],
      this.tasks()[1],
      this.tasks()[2],
    ]);
    this.inProgressTasks.set([
      this.tasks()[3],
      this.tasks()[4],
    ]);
    this.doneTasks.set([
      this.tasks()[6],
    ]);
  }

  selectProject(project: Project) {
    this.selectedProject.set(project);
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'HIGH': 'bg-danger-100 text-danger-700',
      'MEDIUM': 'bg-warning-100 text-warning-700',
      'LOW': 'bg-success-100 text-success-700',
    };
    return classes[priority] || classes['MEDIUM'];
  }
}
