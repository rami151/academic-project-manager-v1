---
name: frontend-patterns
description: "Use when: Building Angular components, services, interceptors, forms, or integrating with the backend. Provides standalone component patterns, reactive forms, HTTP interceptors, error handling, and TypeScript best practices."
applyTo: "frontend/src/**"
---

# Frontend Architecture & Patterns Guide

## Overview
- **Angular 21** with standalone components (no NgModules)
- **Reactive Forms** for all user input
- **Typed HTTP services** with proper request/response models
- **Interceptors** for JWT injection and error handling
- **Material Design** UI components

## Component Pattern

### Standalone Components
All components must be standalone with explicit imports:

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatButtonModule } from '@angular/material';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }
}
```

**Why**: No shared module boilerplate; each component declares its own dependencies explicitly.

Reference: [LoginComponent](../../frontend/src/app/auth/login/login.component.ts)

### OnInit Pattern
Defer all initialization to `ngOnInit()`:

```typescript
export class ProjectListComponent implements OnInit {
  projects: ProjectResponse[] = [];
  loading = false;
  error: string | null = null;

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.listProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects';
        this.loading = false;
      }
    });
  }
}
```

## Service Pattern

### Typed HTTP Requests & Responses
Always define request/response types:

```typescript
// In src/app/core/models/
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

// In auth.service.ts
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request);
  }
}
```

Reference: [AuthService](../../frontend/src/app/core/services/auth.service.ts)

### Token Storage (⚠️ Security Note)
Currently stored in `localStorage`:

```typescript
login(request: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(...).pipe(
    tap(response => {
      localStorage.setItem('jwt_token', response.token);
      // Parse JWT: unsafe for trust decisions, safe for UI display
      const payload = JSON.parse(atob(response.token.split('.')[1]));
      this.currentUser.set(payload);
    })
  );
}
```

**⚠️ XSS Risk**: localStorage is exposed to XSS attacks. For production:
- Prefer `httpOnly` cookies (requires backend support)
- Or implement Content Security Policy (CSP)
- Avoid parsing JWT for critical decisions (trust only backend validation)

## Reactive Forms Pattern

### Form Validation
Use Angular validators + custom validators:

```typescript
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { customEmailValidator } from '../validators/custom-validators';

export class RegisterComponent implements OnInit {
  form!: FormGroup;

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        customEmailValidator()  // Custom async validator if needed
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/[A-Z]/)  // At least one uppercase
      ]),
      role: new FormControl('STUDENT', Validators.required)
    });
  }

  submit() {
    if (!this.form.valid) {
      this.markFormGroupTouched(this.form);
      return;
    }
    this.authService.register(this.form.value).subscribe(...);
  }

  // Mark all fields as touched to show errors
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }
}
```

### Error Messages in Template
```html
<mat-form-field>
  <input matInput formControlName="email" />
  <mat-error *ngIf="form.get('email')?.hasError('required')">
    Email is required
  </mat-error>
  <mat-error *ngIf="form.get('email')?.hasError('email')">
    Invalid email format
  </mat-error>
</mat-form-field>
```

Reference: [LoginComponent template](../../frontend/src/app/auth/login/login.html)

## Interceptor Pattern

### JWT Injection
[authInterceptor](../../frontend/src/app/core/interceptors/auth.interceptor.ts):

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

Provided in `app.config.ts`:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

### Error Interceptor
[errorInterceptor](../../frontend/src/app/core/interceptors/error.interceptor.ts):

```typescript
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Unauthorized: redirect to login, clear token
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        } else if (error.status === 403) {
          this.snackbar.open('Access denied', 'Close', { duration: 5000 });
        } else if (error.status === 404) {
          this.snackbar.open('Resource not found', 'Close', { duration: 5000 });
        }
        return throwError(() => error);
      })
    );
  }
}
```

## Auth Guard Pattern

### Route Protection
[auth.guard.ts](../../frontend/src/app/core/guards/auth.guard.ts):

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
```

Use in routing:
```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [authGuard]
  }
];
```

## HTTP Error Handling

### Service Error Pattern
```typescript
deleteProject(projectId: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${projectId}`).pipe(
    catchError(error => {
      console.error('Failed to delete project:', error);
      // Don't swallow errors; let interceptor catch them
      return throwError(() => error);
    })
  );
}
```

### Component Error Pattern
```typescript
deleteProject(projectId: string) {
  this.projectService.deleteProject(projectId).subscribe({
    next: () => {
      this.projects = this.projects.filter(p => p.id !== projectId);
      this.snackbar.open('Project deleted', 'Close', { duration: 3000 });
    },
    error: (err) => {
      // Interceptor already handled 401/403/404
      // Handle other errors here
      console.error('Unexpected error:', err);
      this.error = 'Could not delete project. Try again.';
    }
  });
}
```

## TypeScript Best Practices

### Typing API Responses
Always use interfaces for API contracts:

```typescript
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;  // ISO 8601 from backend
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}
```

### Avoid 'any'
```typescript
// Don't:
this.projectService.get(id).subscribe((project: any) => {
  console.log(project.name);
});

// Do:
this.projectService.get(id: string): Observable<ProjectResponse> {
  return this.http.get<ProjectResponse>(...);
}
```

### Signal Values (Angular 16+)
For reactive state management:
```typescript
export class AuthService {
  private token$ = signal<string | null>(null);
  private currentUser$ = signal<User | null>(null);
  
  isLoggedIn = computed(() => this.token$() !== null);
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(...).pipe(
      tap(response => {
        this.token$.set(response.token);
        this.currentUser$.set(response);
      })
    );
  }
}
```

## Code Style

### File Organization
```
src/app/
├── auth/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.html
│   │   ├── login.scss
│   │   └── login.spec.ts
│   └── register/
│       └── ...
├── core/
│   ├── services/
│   ├── interceptors/
│   ├── guards/
│   └── models/
└── project/
    ├── components/
    ├── services/
    └── models/
```

### Naming Conventions
- Components: PascalCase ending with `Component` (`LoginComponent`)
- Services: PascalCase ending with `Service` (`AuthService`)
- Interfaces: PascalCase (`ProjectResponse`)
- Variables: camelCase (`currentUser`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES = 3`)

## Testing
See [testing.instructions.md](./testing.instructions.md) for Vitest patterns.
