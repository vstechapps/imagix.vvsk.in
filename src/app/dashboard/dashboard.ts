import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ProjectService, Project } from '../services/project.service';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private eventService = inject(EventService);
  private router = inject(Router);

  projects = signal<Project[]>([]);
  showCreateDialog = signal(false);
  newProjectName = signal('');
  isLoading = signal(false);

  ngOnInit() {
    this.loadProjects();

    // Listen for create project events from header
    this.eventService.createProject$.subscribe(() => {
      this.openCreateDialog();
    });
  }

  loadProjects() {
    this.projectService.getUserProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });
  }

  openCreateDialog() {
    this.showCreateDialog.set(true);
    this.newProjectName.set('');
  }

  closeCreateDialog() {
    this.showCreateDialog.set(false);
    this.newProjectName.set('');
  }

  async createProject() {
    const name = this.newProjectName().trim();
    if (!name) {
      alert('Please enter a project name');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.projectService.createProject(name);
      this.closeCreateDialog();
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteProject(project: Project) {
    if (!project.id) return;

    const confirmed = confirm(`Are you sure you want to delete "${project.name}"?`);
    if (!confirmed) return;

    try {
      await this.projectService.deleteProject(project.id);
    } catch (error: unknown) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error: unknown) {
      console.error('Logout error:', error);
    }
  }

}
