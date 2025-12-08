import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
    template: `
    <div class="layout-container">
      <app-header></app-header>
      <div class="content-wrapper">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .content-wrapper {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      background-color: #121212;
      color: white;
      padding: 20px;
    }
  `]
})
export class MainLayoutComponent { }
