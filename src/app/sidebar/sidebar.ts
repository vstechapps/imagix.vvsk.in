import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  layoutService = inject(LayoutService);

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.layoutService.closeSidebar();
    }
  }

}
