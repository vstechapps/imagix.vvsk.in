import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LayoutService } from '../services/layout.service';
import { EventService } from '../services/event.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  layoutService = inject(LayoutService);
  private eventService = inject(EventService);
  private router = inject(Router);

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }

  createNewProject() {
    this.eventService.triggerCreateProject();
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
