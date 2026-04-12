import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kanban',
  standalone: true,
  template: `
    <div class="kanban">
      <h2>Project Board</h2>
      <div class="columns">
        <div class="column">
          <h3>To Do</h3>
          <div class="tasks"></div>
        </div>
        <div class="column">
          <h3>In Progress</h3>
          <div class="tasks"></div>
        </div>
        <div class="column">
          <h3>Done</h3>
          <div class="tasks"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban {
      padding: 1rem;
    }
    .columns {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .column {
      flex: 1;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 1rem;
      min-height: 400px;
    }
    .column h3 {
      margin: 0 0 1rem 0;
    }
    .tasks {
      min-height: 200px;
    }
  `]
})
export class KanbanComponent {
  @Input() projectId?: string;
}
