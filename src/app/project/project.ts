import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project as ProjectData, Media } from '../services/project.service';
import { MediaComponent } from '../media/media';
import { PreviewComponent } from '../preview/preview';
import { TimelineComponent } from '../timeline/timeline';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, MediaComponent, PreviewComponent, TimelineComponent],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);

  projectId = '';
  project = signal<ProjectData | null>(null);
  isLoading = signal(true);
  movie: any;
  layers = signal<any[]>([]); // For timeline

  // Media for passing to media component
  projectMedia = signal<Media[]>([]);

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
        // Project not found, redirect to dashboard
        this.router.navigate(['/dashboard']);
        return;
      }

      this.project.set(project);

      // Load existing media for media component
      if (project.media && project.media.length > 0) {
        this.projectMedia.set(project.media);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      this.router.navigate(['/dashboard']);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onMediaChange(media: Media[]) {
    this.projectMedia.set(media);
  }

  async onMediaDrop(media: Media) {
    // Logic for media drop needs to coordinate with Preview now, 
    // or we just add to media list. The prompt asked to move initEtro. 
    // Assuming onMediaDrop logic for updating the movie should also move or be handled via signal updates to project.
    // For now, removing direct movie manipulation.
    console.log('Media drop', media);
  }

  async saveProject() {
    if (!this.projectId) return;

    try {
      this.isLoading.set(true);
      console.log('Saving project...');

      // Serialize timeline
      let timelineData = null;
      if (this.movie && this.movie.layers && this.movie.layers.length > 0) {
        // Assuming single scene at index 0
        const scene = this.movie.layers[0];

        // Map layers to a serializable format
        // We need to handle different layer types
        const serializedLayers = scene.layers.map((layer: any) => {
          const base = {
            name: layer.name,
            startTime: layer.startTime,
            duration: layer.duration,
            // Determine type based on constructor name or specific properties
            // simplified check:
            type: layer.constructor.name
          };

          // specific properties based on type
          let specificProps = {};
          if (layer.constructor.name === 'Image' || layer.constructor.name === 'Video') {
            specificProps = {
              source: layer.source, // This should be the path/url
              x: layer.x,
              y: layer.y,
              width: layer.width,
              height: layer.height
            };
          } else if (layer.constructor.name === 'Audio') {
            specificProps = {
              source: layer.source
            };
          } else if (layer.constructor.name === 'Rect') {
            specificProps = {
              color: layer.color,
              x: layer.x,
              y: layer.y,
              width: layer.width,
              height: layer.height
            };
          } else if (layer.constructor.name === 'Text') {
            specificProps = {
              text: layer.text,
              color: layer.color,
              font: layer.font,
              x: layer.x,
              y: layer.y
            };
          }

          return { ...base, ...specificProps };
        });

        timelineData = {
          duration: scene.duration,
          layers: serializedLayers
        };
      }

      await this.projectService.updateProject(this.projectId, {
        media: this.projectMedia(),
        updatedAt: new Date().toDateString()
      });

      console.log('Project saved successfully');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}


