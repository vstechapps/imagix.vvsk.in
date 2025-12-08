import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/layout/layout.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <nav class="sidebar" [class.open]="layoutService.sidebarOpen()">
      <ul>
        <li><a routerLink="/dashboard" routerLinkActive="active" (click)="closeSidebar()">Projects</a></li>
        <li><a routerLink="/assets" routerLinkActive="active" (click)="closeSidebar()">Assets</a></li>
        <li><a routerLink="/settings" routerLinkActive="active" (click)="closeSidebar()">Settings</a></li>
      </ul>
    </nav>
    <div class="overlay" *ngIf="layoutService.sidebarOpen()" (click)="closeSidebar()"></div>
  `,
    styles: [`
    .sidebar {
      width: 250px;
      background-color: #1e1e1e;
      border-right: 1px solid #333;
      height: 100%;
      padding-top: 20px;
      transition: transform 0.3s ease;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      margin-bottom: 5px;
    }
    a {
      display: block;
      padding: 10px 20px;
      color: #aaa;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    a:hover, a.active {
      background-color: #333;
      color: white;
    }
    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
    }
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 60px; /* Below header */
        left: 0;
        bottom: 0;
        z-index: 100;
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .overlay {
        display: block;
        top: 60px;
      }
    }
  `]
})
export class SidebarComponent {
    layoutService = inject(LayoutService);

    closeSidebar() {
        if (window.innerWidth <= 768) {
            this.layoutService.closeSidebar();
        }
    }
}
