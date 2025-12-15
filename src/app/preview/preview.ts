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
          if (type === 'Visual') {
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
      this.isPlaying.set(false);

    } catch (error) {
      console.error('Failed to initialize Etro in preview', error);
    }
  }

  togglePlay() {
    if (!this._movie) return;
    if (this.isPlaying()) {
      this._movie.pause();
      this.isPlaying.set(false);
      clearInterval(this._updateInterval);
    } else {
      // Clear any existing interval just in case
      clearInterval(this._updateInterval);
      this.isPlaying.set(true); // Optimistic update
      this.startProgressTracker();
      this._movie.play().catch(() => {
        this.isPlaying.set(false);
        clearInterval(this._updateInterval);
      });
    }
  }

  stop() {
    if (!this._movie) return;
    this._movie.stop();
    clearInterval(this._updateInterval);
    this.isPlaying.set(false);
    this._movie.currentTime = 0;
    this.currentTime.set(0);
  }

  seek(event: any) {
    if (!this._movie) return;
    const time = Number(event.target.value);
    this.currentTime.set(time);
    this._movie.currentTime = time;
  }

  startProgressTracker() {
    clearInterval(this._updateInterval); // Ensure no duplicates
    this._updateInterval = setInterval(() => {
      // Check if movie exists. usage of isPlaying check here is redundant if we manage interval correctly
      if (this._movie) {
        this.currentTime.set(this._movie.currentTime);
        // Auto-stop if reached end? Etro might loop or stop.
        if (this._movie.currentTime >= this.duration()) {
          this.stop();
        }
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
