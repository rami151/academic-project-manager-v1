import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      <div class="projects-grid">
        <div class="project-card">
          <h3>My Projects</h3>
          <p>View and manage your projects</p>
        </div>
        <div class="project-card">
          <h3>Recent Activity</h3>
          <p>Track your recent actions</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1rem;
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .project-card {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }
    .project-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class DashboardComponent {}
