import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  deadline: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  totalTasks?: number;
  completedTasks?: number;
  membersCount?: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  deadline: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  deadline?: string;
}

export interface ProjectMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  permission: 'OWNER' | 'EDITOR' | 'VIEWER';
  joinedAt: string;
}

export type Permission = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface InviteMemberRequest {
  email: string;
  permission: Permission;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = '/api/projects';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(data: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}`, data);
  }

  updateProject(id: string, data: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProjectMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/${projectId}/members`);
  }

  inviteMember(projectId: string, data: InviteMemberRequest): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(`${this.apiUrl}/${projectId}/members`, data);
  }

  removeMember(projectId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/members/${memberId}`);
  }

  updateMemberPermission(projectId: string, memberId: string, permission: Permission): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(`${this.apiUrl}/${projectId}/members/${memberId}`, { permission });
  }

}
