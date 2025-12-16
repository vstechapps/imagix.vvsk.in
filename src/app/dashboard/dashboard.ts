import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProjectService } from '../services/project.service';
import { Project } from '../app.models';
import { EventService } from '../services/event.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private eventService = inject(EventService);
  private router = inject(Router);

  projects = signal<Project[]>([]);
  showCreateDialog = signal(false);
  newProjectName = signal('');
  newProjectTemplate = signal<'portrait' | 'landscape'>('portrait');
  newProjectDuration = signal(3);
  newProjectWidth = signal(180);
  newProjectHeight = signal(320);

  isLoading = signal(false);
  private projectsSub?: Subscription;

  updateDimensions(template: string) {
    if (template === 'portrait') {
      this.newProjectWidth.set(180);
      this.newProjectHeight.set(320);
    } else {
      this.newProjectWidth.set(320);
      this.newProjectHeight.set(180);
    }
  }


  ngOnInit() {
    this.loadProjects();

    // Listen for create createProject events from header
    this.eventService.createProject$.subscribe(() => {
      this.openCreateDialog();
    });
  }

  ngOnDestroy() {
    this.projectsSub?.unsubscribe();
  }

  loadProjects() {
    this.projectsSub?.unsubscribe();
    this.projectsSub = this.projectService.getUserProjects().subscribe((projects: Project[]) => {
      this.projects.set(projects);
    },
      (error) => {
        console.error('Error loading projects:', error);
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

    const template = this.newProjectTemplate();
    const duration = this.newProjectDuration();
    const width = this.newProjectWidth();
    const height = this.newProjectHeight();

    this.isLoading.set(true);
    try {
      await this.projectService.createProject(name, template, duration, width, height);
      this.closeCreateDialog();
      this.loadProjects();
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
      this.loadProjects();
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
