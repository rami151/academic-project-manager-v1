---
name: testing-strategies
description: "Use when: Writing unit tests, integration tests, or setting up test infrastructure. Covers JUnit5/Mockito for backend, Vitest for frontend, mocking patterns, test data builders, and test organization."
---

# Testing Guide

## Backend Testing (JUnit5 + Mockito)

### Run Tests
```bash
cd backend

# All tests
./mvnw test

# Single test class
./mvnw test -Dtest=ClassName

# Single test method
./mvnw test -Dtest=ClassName#methodName
```

### Unit Test Pattern

```java
@DisplayName("ProjectService")
class ProjectServiceTest {
  
  @Mock
  private ProjectRepository projectRepository;
  
  @Mock
  private ProjectAuthorizationService authorizationService;
  
  @InjectMocks
  private ProjectService projectService;
  
  private final UUID projectId = UUID.randomUUID();
  private final UUID userId = UUID.randomUUID();
  
  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }
  
  @Nested
  @DisplayName("getProject")
  class GetProject {
    
    @Test
    @DisplayName("should return project when authorized")
    void shouldReturnProjectWhenAuthorized() {
      // Arrange
      Project project = Project.builder()
        .id(projectId)
        .name("Test Project")
        .build();
      
      when(authorizationService.requirePermission(projectId, userId, Permission.VIEWER))
        .thenReturn(true);
      when(projectRepository.findById(projectId))
        .thenReturn(Optional.of(project));
      
      // Act
      ProjectResponse response = projectService.getProject(projectId, userId);
      
      // Assert
      assertThat(response.getId()).isEqualTo(projectId);
      assertThat(response.getName()).isEqualTo("Test Project");
      verify(projectRepository).findById(projectId);
    }
    
    @Test
    @DisplayName("should throw when project not found")
    void shouldThrowWhenProjectNotFound() {
      // Arrange
      when(authorizationService.requirePermission(projectId, userId, Permission.VIEWER))
        .thenReturn(true);
      when(projectRepository.findById(projectId))
        .thenReturn(Optional.empty());
      
      // Act & Assert
      assertThrows(ResourceNotFoundException.class,
        () -> projectService.getProject(projectId, userId));
    }
    
    @Test
    @DisplayName("should throw when not authorized")
    void shouldThrowWhenNotAuthorized() {
      // Arrange
      when(authorizationService.requirePermission(projectId, userId, Permission.VIEWER))
        .thenThrow(new UnauthorizedException("Access denied"));
      
      // Act & Assert
      assertThrows(UnauthorizedException.class,
        () -> projectService.getProject(projectId, userId));
    }
  }
}
```

### Integration Test Pattern

```java
@SpringBootTest
@ActiveProfiles("test")  // Uses application-test.properties
@TestcontainersTest
class ProjectControllerIntegrationTest {
  
  @Autowired
  private TestRestTemplate restTemplate;
  
  @Autowired
  private UserRepository userRepository;
  
  private User testUser;
  private String jwtToken;
  
  @BeforeEach
  void setUp() {
    // Create test user
    testUser = User.builder()
      .email("test@academic.com")
      .name("Test User")
      .password(new BCryptPasswordEncoder().encode("password123"))
      .role(Role.STUDENT)
      .build();
    userRepository.save(testUser);
    
    // Generate JWT
    jwtToken = jwtUtil.generateToken(testUser.getId(), testUser.getEmail());
  }
  
  @Test
  @DisplayName("GET /api/projects/{id} should return 200 when authorized")
  void getProjectShouldReturn200WhenAuthorized() {
    // Arrange
    Project project = Project.builder()
      .name("Test Project")
      .owner(testUser)
      .build();
    projectRepository.save(project);
    
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(jwtToken);
    HttpEntity<Void> request = new HttpEntity<>(headers);
    
    // Act
    ResponseEntity<ProjectResponse> response = restTemplate.exchange(
      "/api/projects/" + project.getId(),
      HttpMethod.GET,
      request,
      ProjectResponse.class
    );
    
    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getName()).isEqualTo("Test Project");
  }
  
  @Test
  @DisplayName("GET /api/projects/{id} should return 401 when not authenticated")
  void getProjectShouldReturn401WhenNotAuthenticated() {
    // Act
    ResponseEntity<ErrorResponse> response = restTemplate.exchange(
      "/api/projects/" + UUID.randomUUID(),
      HttpMethod.GET,
      HttpEntity.EMPTY,
      ErrorResponse.class
    );
    
    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }
}
```

### Test Data Builder Pattern

```java
public class ProjectBuilder {
  private UUID id = UUID.randomUUID();
  private String name = "Test Project";
  private String description = "Test Description";
  private User owner = new UserBuilder().build();
  private ProjectStatus status = ProjectStatus.ACTIVE;
  
  public ProjectBuilder withName(String name) {
    this.name = name;
    return this;
  }
  
  public ProjectBuilder withOwner(User owner) {
    this.owner = owner;
    return this;
  }
  
  public Project build() {
    return Project.builder()
      .id(id)
      .name(name)
      .description(description)
      .owner(owner)
      .status(status)
      .build();
  }
}

// Usage:
Project project = new ProjectBuilder()
  .withName("My Project")
  .withOwner(adminUser)
  .build();
```

### Mock Authorization Pattern

```java
@DisplayName("Authorization checks")
class ProjectAuthorizationTest {
  
  @Test
  void shouldAllowViewerAccess() {
    // Mock: current user has VIEWER permission
    when(authorizationService.requirePermission(projectId, userId, Permission.VIEWER))
      .thenReturn(true);
    
    // Should not throw
    assertDoesNotThrow(() -> projectService.getProject(projectId, userId));
  }
  
  @Test
  void shouldDenyEditorAccessToAdmin() {
    // Mock: user lacks ADMIN permission
    doThrow(new UnauthorizedException("Not admin"))
      .when(authorizationService)
      .requirePermission(projectId, userId, Permission.ADMIN);
    
    // Should throw
    assertThrows(UnauthorizedException.class,
      () -> projectService.updateProject(projectId, userId, updateRequest));
  }
}
```

## Frontend Testing (Vitest)

### Run Tests
```bash
cd frontend

# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Single test file
npm test -- login.component.spec.ts
```

### Component Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: vi.fn(),
            isLoggedIn: vi.fn(() => false)
          }
        }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });
  
  describe('form validation', () => {
    it('should mark form invalid when email is empty', () => {
      component.form.get('email')?.setValue('');
      component.form.get('password')?.setValue('password123');
      
      expect(component.form.valid).toBe(false);
    });
    
    it('should mark form valid when all fields are correct', () => {
      component.form.get('email')?.setValue('test@academic.com');
      component.form.get('password')?.setValue('password123');
      
      expect(component.form.valid).toBe(true);
    });
  });
  
  describe('form submission', () => {
    it('should call authService.login when form is submitted', () => {
      // Arrange
      component.form.get('email')?.setValue('test@academic.com');
      component.form.get('password')?.setValue('password123');
      vi.spyOn(authService, 'login').mockReturnValue(of({ token: 'jwt' }));
      
      // Act
      component.submit();
      
      // Assert
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@academic.com',
        password: 'password123'
      });
    });
    
    it('should not call authService.login when form is invalid', () => {
      // Arrange
      component.form.get('email')?.setValue(''); // Invalid
      vi.spyOn(authService, 'login');
      
      // Act
      component.submit();
      
      // Assert
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
```

### Service Test Pattern

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpClient: HttpClient;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient()]
    });
    service = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
  });
  
  describe('login', () => {
    it('should post credentials and return AuthResponse', () => {
      // Arrange
      const mockResponse: AuthResponse = {
        token: 'jwt-token',
        id: 'user-id',
        email: 'test@academic.com',
        name: 'Test User',
        role: 'STUDENT'
      };
      vi.spyOn(httpClient, 'post').mockReturnValue(of(mockResponse));
      
      // Act
      service.login({ email: 'test@academic.com', password: 'pass' })
        .subscribe(response => {
          // Assert
          expect(response).toEqual(mockResponse);
          expect(localStorage.getItem('jwt_token')).toBe('jwt-token');
        });
    });
  });
});
```

### Testing Interceptors

```typescript
describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor]))
      ]
    });
    
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  
  it('should add JWT token to Authorization header', () => {
    // Arrange
    localStorage.setItem('jwt_token', 'test-token');
    
    // Act
    httpClient.get('/api/projects').subscribe();
    
    // Assert
    const req = httpTestingController.expectOne('/api/projects');
    expect(req.request.headers.get('Authorization'))
      .toBe('Bearer test-token');
    
    req.flush({});
  });
});
```

## Test File Organization

```
backend/src/test/java/com/academic/backend/
├── controller/
│   ├── AuthControllerTest.java
│   └── ProjectControllerTest.java
├── service/
│   ├── AuthServiceTest.java
│   ├── ProjectServiceTest.java
│   └── ProjectAuthorizationServiceTest.java
├── repository/
│   └── ProjectRepositoryTest.java
└── security/
    ├── JwtUtilTest.java
    └── SecurityConfigTest.java

frontend/src/app/
├── auth/
│   ├── login/
│   │   └── login.component.spec.ts
│   └── register/
│       └── register.component.spec.ts
├── core/
│   ├── services/
│   │   └── auth.service.spec.ts
│   └── interceptors/
│       ├── auth.interceptor.spec.ts
│       └── error.interceptor.spec.ts
└── project/
    ├── services/
    │   └── project.service.spec.ts
    └── components/
        ├── project-list.component.spec.ts
        └── project-detail.component.spec.ts
```

## Coverage Goals
- **Backend**: Aim for 80%+ coverage on services, controllers, edge cases
- **Frontend**: 80%+ on components, services, interceptors

Critical paths to test:
- Authorization/permission checks
- Error handling and edge cases
- Form validation
- API error responses (401, 403, 404)
