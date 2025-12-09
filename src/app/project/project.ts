import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project as ProjectData, Media } from '../services/project.service';
import { MediaComponent } from '../media/media';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, MediaComponent],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  
  projectId = '';
  project = signal<ProjectData | null>(null);
  isLoading = signal(true);
  private movie: any;
  
  // Media for passing to media component
  projectMedia = signal<Media[]>([]);

  async ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.projectId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    await this.loadProject();
    this.initEtro();
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
    if (this.movie?.stop) {
      this.movie.stop();
    }
  }

  /**
   * Initialize a basic Etro.js movie on the canvas.
   * This is a minimal demo; extend with timeline UI and media sources as needed.
   */
  private async initEtro() {
    try {
      const etro: any = await import('etro');

      const canvas = this.canvasRef.nativeElement;
      canvas.width = 960;
      canvas.height = 540;

      const movie = new etro.Movie({ canvas });
      const scene = new etro.Scene({ duration: 5 });

      // Solid background layer
      scene.addLayer(
        new etro.layers.Rect({
          color: '#111827',
          width: 960,
          height: 540,
        })
      );

      // Title text layer
      const projectName = this.project()?.name || `Project ${this.projectId}`;
      scene.addLayer(
        new etro.layers.Text({
          text: projectName,
          color: '#fff',
          font: '48px Inter, sans-serif',
          x: 80,
          y: 120,
        })
      );

      // Simple moving bar layer to show animation
      scene.addLayer(
        new etro.layers.Rect({
          color: '#10b981',
          width: 180,
          height: 40,
          x: 80,
          y: 300,
          animations: {
            x: [
              { time: 0, value: 80 },
              { time: 5, value: 960 - 220 },
            ],
          },
        })
      );

      movie.addScene(scene);
      this.movie = movie;

      await movie.play();
    } catch (error) {
      console.error('Failed to initialize Etro', error);
    }
  }

  onMediaChange(media: Media[]) {
    this.projectMedia.set(media);
  }
}


