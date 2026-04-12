import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="register-container">
      <h2>Register</h2>
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 1rem;
    }
    input {
      display: block;
      width: 100%;
      margin: 0.5rem 0;
      padding: 0.5rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #1976d2;
      color: white;
      border: none;
      cursor: pointer;
    }
  `]
})
export class RegisterComponent {}
