import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../../../core/layout/layout.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="app-header">
      <div class="left-section">
        <button class="menu-btn" (click)="toggleSidebar()">☰</button>
        <div class="logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">Imagix</span>
        </div>
      </div>
      <div class="actions">
        <button class="create-btn">+ New Project</button>
        <div class="user-profile" *ngIf="authService.user$ | async as user">
          <img [src]="user.photoURL" alt="User" class="avatar">
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  `,
    styles: [`
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      height: 60px;
      background-color: #1e1e1e;
      border-bottom: 1px solid #333;
      color: white;
    }
    .left-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .menu-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      display: none;
    }
    @media (max-width: 768px) {
      .menu-btn {
        display: block;
      }
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      font-weight: bold;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .create-btn {
      background-color: #6200ea;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
    .logout-btn {
      background: none;
      border: 1px solid #555;
      color: #aaa;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }
  `]
})
export class HeaderComponent {
    authService = inject(AuthService);
    layoutService = inject(LayoutService);
    private router = inject(Router);

    toggleSidebar() {
        this.layoutService.toggleSidebar();
    }

    async logout() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
}
