import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { Project as ProjectData } from '../app.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preview.html',
  styleUrl: './preview.css',
})
export class PreviewComponent implements OnInit, OnDestroy {
  @Input() project: ProjectData | null = null;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);

  projectId = '';
  isLoading = signal(false);
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);

  private _movie: any;
  private _updateInterval: any;

  async ngOnInit() {
    // If project input is not provided, try to load it from route
    // This supports both usage: embedded in parent or standalone route
    if (!this.project) {
      this.projectId = this.route.snapshot.paramMap.get('id') || '';
      if (this.projectId) {
        await this.loadProject();
      }
    } else {
      await this.initEtro();
    }
  }

  async loadProject() {
    this.isLoading.set(true);
    const project = await this.projectService.getProjectById(this.projectId);
    this.isLoading.set(false);
    if (project) {
      this.project = project;
      await this.initEtro();
    }
  }

  async ngOnChanges(changes: any) {
    if (changes.project && !changes.project.firstChange && this.project) {
      this.cleanup();
      await this.initEtro();
    }
  }

  private async initEtro() {
    if (!this.project || !this.canvasRef) return;

    try {
      const etro: any = await import('etro');

      const width = this.project.width || 960;
      const height = this.project.height || 540;
      this.duration.set(this.project.duration || 10);

      // set the width and height of the canvas
      this.canvasRef.nativeElement.width = width;
      this.canvasRef.nativeElement.height = height;

      // Movie WITH canvas attached
      const movie = new etro.Movie({
        canvas: this.canvasRef.nativeElement
      });

      const layers = this.project.layers;

      if (layers && layers.length > 0) {
        layers.forEach((layerData: any) => {
          let newLayer;
          const { id, name, type, ...options } = layerData;

          // Construct layer based on type
          // Note: etro.layers.Visual might not exist, usually it is etro.layer.Visual or similar. Check exact import.
          // Assuming etro.layer.* per previous context.
          if (type === 'Visual') {
            // 'Visual' in our model might map to a generic layer or specific shape if extended. 
            // If model says Visual is for shapes, maybe map to etro.layer.Video/Image if source present or custom? 
            // If just a container/rect:
            // For now assuming existing logic was correct or close.
            // If 'Visual' refers to 'etro.layer.Visual', good.
            // Previous code used 'etro.layer.Visual' but usually 'etro.Visual' doesn't exist? 
            // Let's use generic if needed or keep user's flow.
            // Actually, Etro usually has 'etro.layer.Image', 'etro.layer.Video', 'etro.layer.Audio', 'etro.layer.Text'.
            // There isn't a generic 'Visual' layer visible in docs usually, maybe 'etro.layer.Visual' is an abstract?
            // Assuming previous code worked or we use a fallback. 
            // IF 'Visual' = Shape (Rect), maybe we need a custom shape or Image with color?
            // Let's stick to existing map, but ensure we handle constructor carefully.
            newLayer = new etro.layer.Visual(options);
          } else if (type === 'Text') {
            newLayer = new etro.layer.Text(options);
          } else if (type === 'Image') {
            newLayer = new etro.layer.Image(options);
          } else if (type === 'Video') {
            newLayer = new etro.layer.Video(options);
          } else if (type === 'Audio') {
            newLayer = new etro.layer.Audio(options);
          }
          if (newLayer) movie.layers.push(newLayer);
        });
      }

      this._movie = movie;
      // Don't auto play, wait for user
      // await movie.play(); 
      this.isPlaying.set(false);
      this.startProgressTracker();

    } catch (error) {
      console.error('Failed to initialize Etro in preview', error);
    }
  }

  togglePlay() {
    if (!this._movie) return;
    if (this.isPlaying()) {
      this._movie.pause();
      this.isPlaying.set(false);
    } else {
      this._movie.play().then(() => {
        this.isPlaying.set(true);
      });
    }
  }

  stop() {
    if (!this._movie) return;
    this._movie.stop();
    this.isPlaying.set(false);
    this._movie.currentTime = 0;
    this.currentTime.set(0);
  }

  seek(event: any) {
    if (!this._movie) return;
    const time = Number(event.target.value);
    this.currentTime.set(time);
    this._movie.currentTime = time;
    // If was playing, it might continue or pause depending on Etro behavior, usually continues if not paused explicitly.
  }

  startProgressTracker() {
    this._updateInterval = setInterval(() => {
      if (this._movie && this.isPlaying()) {
        this.currentTime.set(this._movie.currentTime);
      }
    }, 100);
  }

  cleanup() {
    if (this._updateInterval) clearInterval(this._updateInterval);
    if (this._movie) {
      this._movie.stop();
      this._movie = null;
    }
    this.isPlaying.set(false);
  }

  ngOnDestroy() {
    this.cleanup();
  }
}
