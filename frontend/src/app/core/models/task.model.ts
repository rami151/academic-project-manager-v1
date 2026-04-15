export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  estimatedDays: number | null;
  aiGenerated: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  assignedToName: string | null;
  assignedToEmail: string | null;
  labelNames: string[];
}

export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  estimatedDays: number | null;
  assignedToId: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  estimatedDays?: number | null;
  status?: TaskStatus;
  assignedToId?: string | null;
}

export interface MoveTaskRequest {
  status: TaskStatus;
  position: number;
}