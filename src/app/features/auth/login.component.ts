import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="login-container">
      <h1>Welcome to Imagix</h1>
      <button (click)="login()">Sign in with Google</button>
    </div>
  `,
    styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #121212;
      color: white;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
  `]
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    async login() {
        try {
            await this.authService.login();
            this.router.navigate(['/dashboard']);
        } catch (error) {
            console.error(error);
        }
    }
}
