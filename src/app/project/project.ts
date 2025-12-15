import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { Project as ProjectData, Media, Layer } from '../app.models';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectId = '';
  project = signal<ProjectData | null>(null);
  isLoading = signal(true);

  // Counts
  layerCount = signal(0);
  mediaCount = signal(0);

  // Editable fields bound to UI
  editName = signal('');
  editDuration = signal(0);
  editWidth = signal(0);
  editHeight = signal(0);
  editTemplate = signal<'portrait' | 'landscape'>('landscape');
  showEditDetails = signal(false);

  async ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.projectId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    await this.loadProject();
  }

  private async loadProject() {
    try {
      this.isLoading.set(true);
      const project = await this.projectService.getProjectById(this.projectId);

      if (!project) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.project.set(project);

      // Initialize edit fields
      this.editName.set(project.name);
      this.editDuration.set(project.duration || 5);
      this.editWidth.set(project.width);
      this.editHeight.set(project.height);
      this.editTemplate.set(project.template); // Assuming template is on project, if not defaults to landscape

      // Set counts
      this.layerCount.set(project.layers?.length || 0);
      this.mediaCount.set(project.media?.length || 0);

    } catch (error) {
      console.error('Error loading project:', error);
      this.router.navigate(['/dashboard']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveProject() {
    if (!this.projectId || !this.project()) return;

    try {
      this.isLoading.set(true);
      console.log('Saving project metadata...');

      await this.projectService.updateProject(this.projectId, {
        name: this.editName(),
        duration: this.editDuration(),
        width: this.editWidth(),
        height: this.editHeight(),
        template: this.editTemplate(),
        updatedAt: new Date().toISOString()
      });

      console.log('Project saved successfully');
      // Reload to reflect any other side effects if needed, or just update local state
      const updatedProject = {
        ...this.project()!,
        name: this.editName(),
        duration: this.editDuration(),
        width: this.editWidth(),
        height: this.editHeight(),
        template: this.editTemplate(),
      };
      this.project.set(updatedProject);

    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Navigation Actions
  openLayers() {
    this.router.navigate(['layers'], { relativeTo: this.route });
  }

  openMedia() {
    // Assuming media is a route or a modal. 
    // If it was a component on page, we need a route.
    // Based on prompt "Preview which will redirect route to respective components"
    // implies new routes maybe? Or existing ones. 
    // There is no media route yet in app.routes.ts usually, but I'll assume we might need to create one or use a placeholder.
    // For now, let's assume we navigate to a 'media' child route.
    this.router.navigate(['media'], { relativeTo: this.route });
  }

  openPreview() {
    // Preview component was previously embedded. Now requesting redirect.
    // Need a preview route.
    this.router.navigate(['preview'], { relativeTo: this.route });
  }
}


