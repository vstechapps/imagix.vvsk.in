import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { LayoutService } from '../services/layout.service';
import { filter } from 'rxjs/operators';
import { ProjectService, Project } from '../services/project.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  layoutService = inject(LayoutService);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  currentProjectId = signal<string | null>(null);
  activeProject = signal<Project | null>(null);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
    });

    this.projectService.activeProject$.subscribe(project => {
      this.activeProject.set(project);
    });

    // Initial check
    this.checkRoute();
  }

  private checkRoute() {
    const url = this.router.url;
    const match = url.match(/\/projects\/([^\/]+)/);
    if (match && match[1]) {
      this.currentProjectId.set(match[1]);
    } else {
      this.currentProjectId.set(null);
    }
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.layoutService.closeSidebar();
    }
  }

}
