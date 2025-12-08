import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <header>
        <h1>Imagix Dashboard</h1>
        <button (click)="logout()">Logout</button>
      </header>
      <main>
        <p>Welcome to your projects.</p>
      </main>
    </div>
  `,
    styles: [`
    .dashboard-container {
      padding: 20px;
      background-color: #121212;
      color: white;
      min-height: 100vh;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    button {
      padding: 8px 16px;
      cursor: pointer;
    }
  `]
})
export class DashboardComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    async logout() {
        try {
            await this.authService.logout();
            this.router.navigate(['/login']);
        } catch (error) {
            console.error(error);
        }
    }
}
