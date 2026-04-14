---
name: common-workflows
description: "Use when: Adding new features, creating entities, setting up migrations, building screens. Provides step-by-step checklists for common tasks like 'add a new entity', 'create a migration', or 'build a CRUD feature'."
---

# Common Workflows

## Add a New Entity (Backend)

**Goal**: Create a new JPA entity with DB schema, service, controller, and migrations.

### Step 1: Define SQL Schema
Create `backend/src/main/resources/db/migration/V{N}__{description}.sql`

```sql
-- Example: V3__create_notifications_table.sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Auto-update timestamp
CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

**Enum types** (if new): Add to V1 or create in migration:
```sql
-- Only if first time using this enum
CREATE TYPE notification_type_enum AS ENUM ('INFO', 'WARNING', 'ERROR');
```

### Step 2: Create Entity
Create `backend/src/main/java/com/academic/backend/shared/entity/Notification.java`

```java
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", columnDefinition = "notification_type_enum", nullable = false)
    private NotificationType type;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

**Key**:
- Use `@JdbcTypeCode(SqlTypes.NAMED_ENUM)` on enum fields
- Use `@CreationTimestamp` / `@UpdateTimestamp`
- Use `@ManyToOne(fetch = FetchType.LAZY)` for relationships

### Step 3: Create DTO
Create `backend/src/main/java/com/academic/backend/dto/NotificationResponse.java`

```java
@Data
@NoArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.message = notification.getMessage();
        this.type = notification.getType();
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
    }
}
```

### Step 4: Create Repository
Create `backend/src/main/java/com/academic/backend/repository/NotificationRepository.java`

```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserId(UUID userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsRead(@Param("id") UUID id);
}
```

### Step 5: Create Service
Create `backend/src/main/java/com/academic/backend/service/NotificationService.java`

```java
@Service
@Transactional
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ProjectAuthorizationService authorizationService;
    
    public List<NotificationResponse> getNotifications(UUID userId) {
        // Authorization: only users can see their own notifications
        return notificationRepository.findByUserId(userId)
            .stream()
            .map(NotificationResponse::new)
            .toList();
    }
    
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        // Check user owns this notification
        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Cannot modify other users' notifications");
        }
        
        notificationRepository.markAsRead(notificationId);
    }
}
```

### Step 6: Create Controller
Create endpoints in `backend/src/main/java/com/academic/backend/controller/NotificationController.java`

```java
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }
}
```

### Step 7: Test
```bash
# Run tests to compile and check
cd backend && ./mvnw clean spring-boot:run

# Start DB if not running
docker compose up -d

# Tests should pass; migration auto-runs
```

---

## Build a New Frontend Screen

**Goal**: Create a component, service, forms, and integrate with backend API.

### Step 1: Create Service
Create `frontend/src/app/project/services/project.service.ts`

```typescript
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = '/api/projects';
  
  constructor(private http: HttpClient) {}
  
  listProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.apiUrl);
  }
  
  getProject(id: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${id}`);
  }
  
  createProject(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, request);
  }
  
  updateProject(id: string, request: Partial<CreateProjectRequest>): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${id}`, request);
  }
}
```

### Step 2: Create Component
Create `frontend/src/app/project/components/project-list/project-list.component.ts`

```typescript
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  projects: ProjectResponse[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadProjects();
  }
  
  loadProjects() {
    this.loading = true;
    this.error = null;
    
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
  
  createProject() {
    this.router.navigate(['/projects/new']);
  }
  
  viewProject(project: ProjectResponse) {
    this.router.navigate(['/projects', project.id]);
  }
}
```

### Step 3: Create Template
Create `frontend/src/app/project/components/project-list/project-list.component.html`

```html
<mat-card>
  <mat-card-header>
    <mat-card-title>Projects</mat-card-title>
    <button mat-raised-button color="primary" (click)="createProject()">
      New Project
    </button>
  </mat-card-header>
  
  <mat-card-content>
    <div *ngIf="loading" class="loading">Loading...</div>
    
    <div *ngIf="error" class="error">{{ error }}</div>
    
    <table mat-table [dataSource]="projects" *ngIf="!loading && projects.length > 0">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let project">{{ project.name }}</td>
      </ng-container>
      
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let project">
          <button mat-icon-button (click)="viewProject(project)">
            <mat-icon>open_in_new</mat-icon>
          </button>
        </td>
      </ng-container>
      
      <tr mat-header-row *matHeaderRowDef="['name', 'actions']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['name', 'actions']"></tr>
    </table>
  </mat-card-content>
</mat-card>
```

### Step 4: Add Route
Update `frontend/src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'projects/:id',
    component: ProjectDetailComponent,
    canActivate: [authGuard]
  }
];
```

### Step 5: Test
```bash
cd frontend && npm start
# Navigate to http://localhost:4200/projects
```

---

## Debug an Issue

### Backend
```bash
# Run with debug info
cd backend && ./mvnw clean spring-boot:run -DskipTests -X

# Check logs for errors
cat backend/target/classes/application.yml | grep -A 5 logging

# Test endpoint manually
curl -X GET http://localhost:8080/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend
```bash
cd frontend && npm start
# Open browser DevTools (F12)
# Check Console for errors
# Check Network for API calls, responses
# Check Storage > localStorage for jwt_token
```

---

## Common Commands Reference

```bash
# Full application startup
docker compose up -d                          # Start DB + pgAdmin
cd backend && ./mvnw clean spring-boot:run   # Start backend (separate terminal)
cd frontend && npm start                      # Start frontend (separate terminal)

# Running tests
cd backend && ./mvnw test
cd frontend && npm test

# Stop all
docker compose down  # Stop DB
Ctrl+C on each terminal
```
