import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getCurrentUser(): User | null {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;

    const userStr = localStorage.getItem('current_user');
    if (userStr && userStr !== 'undefined') {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role
      };
    } catch (e) {
      return null;
    }
  }

  syncCurrentUser(): Observable<User> {
    return new Observable<User>((observer) => {
      this.getMe().subscribe({
        next: (user) => {
          localStorage.setItem('current_user', JSON.stringify(user));
          observer.next(user);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
