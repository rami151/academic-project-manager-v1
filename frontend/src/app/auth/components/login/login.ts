import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
    </div>
  `,
  styles: [`
    .login-container {
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
export class LoginComponent {}
