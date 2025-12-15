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
   * Initialize a basic Etro.js movie
   */
  private async initEtro() {
    try {
      const etro: any = await import('etro');

      // Movie without canvas initially (will be attached by PreviewComponent)
      const movie = new etro.Movie({ width: 960, height: 540 });

      const savedTimeline = this.project()?.timeline;
      let scene: any;

      if (savedTimeline && savedTimeline.layers) {
        // Reconstruct from saved data
        scene = new etro.Scene({ duration: savedTimeline.duration || 10 });

        savedTimeline.layers.forEach((layerData: any) => {
          let newLayer;
          const { type, ...options } = layerData;

          // Construct layer based on type
          if (type === 'Image') {
            newLayer = new etro.layers.Image(options);
          } else if (type === 'Video') {
            newLayer = new etro.layers.Video(options);
          } else if (type === 'Audio') {
            newLayer = new etro.layers.Audio(options);
          } else if (type === 'Rect') {
            newLayer = new etro.layers.Rect(options);
          } else if (type === 'Text') {
            newLayer = new etro.layers.Text(options);
          }

          if (newLayer) {
            scene.addLayer(newLayer);
          }
        });
      } else {
        // Default initialization
        scene = new etro.Scene({ duration: 10 });

        // Solid background layer
        const bgLayer = new etro.layers.Rect({
          name: 'Background',
          color: '#111827',
          width: 960,
          height: 540,
          startTime: 0,
          duration: 10
        });
        scene.addLayer(bgLayer);

        // Title text layer
        const projectName = this.project()?.name || `Project ${this.projectId}`;
        const textLayer = new etro.layers.Text({
          name: 'Title',
          text: projectName,
          color: '#fff',
          font: '48px Inter, sans-serif',
          x: 80,
          y: 120,
          startTime: 0,
          duration: 5
        });
        scene.addLayer(textLayer);
      }

      movie.addScene(scene);
      this.movie = movie;

      this.updateLayersList();

      await movie.play();
    } catch (error) {
      console.error('Failed to initialize Etro', error);
    }
  }

  onMediaChange(media: Media[]) {
    this.projectMedia.set(media);
  }

  async onMediaDrop(media: Media) {
    if (!this.movie) return;

    try {
      const etro: any = await import('etro');
      const scene = this.movie.layers[0]; // Assuming single scene for now

      let newLayer;
      const startTime = 0; // Default to start for now

      if (media.type === 'image') {
        newLayer = new etro.layers.Image({
          name: media.name || 'Image',
          source: media.path,
          x: 0,
          y: 0,
          width: 400, // Default width
          height: 300, // Default height
          startTime: startTime,
          duration: 5
        });
      } else if (media.type === 'video') {
        newLayer = new etro.layers.Video({
          name: media.name || 'Video',
          source: media.path,
          x: 0,
          y: 0,
          width: 480,
          height: 270,
          startTime: startTime,
          // duration: 10 // Let it use source duration or default
        });
      } else if (media.type === 'audio') {
        newLayer = new etro.layers.Audio({
          name: media.name || 'Audio',
          source: media.path,
          startTime: startTime,
        });
      }

      if (newLayer) {
        scene.addLayer(newLayer);
        this.updateLayersList();

        // Refresh movie logic if needed (usually addLayer is enough)
        // ensure movie is playing or refreshed
      }
    } catch (error) {
      console.error('Error adding layer:', error);
    }
  }

  private updateLayersList() {
    if (this.movie && this.movie.layers && this.movie.layers[0]) {
      // Get layers from the first scene match existing logic
      // Etro structure: Movie -> [Scene] -> [Layers]
      // My simplified init has movie.layers[0] as scene
      const scene = this.movie.layers[0];
      this.layers.set([...scene.layers]);
    }
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
        timeline: timelineData,
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


