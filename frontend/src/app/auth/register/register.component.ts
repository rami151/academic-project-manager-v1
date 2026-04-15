import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  roles = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['STUDENT', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value as RegisterRequest).subscribe({
      next: () => {
        this.successMessage = 'Successfully registered! Redirecting to login...';
        this.snackbarService.success('Account created successfully!');
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create account';
        this.snackbarService.error('Failed to create account');
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getNameError(): string {
    const control = this.registerForm.get('name');
    if (control?.hasError('required')) {
      return 'Name is required';
    }
    if (control?.hasError('minlength')) {
      return 'Name must be at least 3 characters';
    }
    return '';
  }

  getEmailError(): string {
    const control = this.registerForm.get('email');
    if (control?.hasError('required')) {
      return 'Email is required';
    }
    if (control?.hasError('email')) {
      return 'Invalid email address';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.registerForm.get('password');
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
