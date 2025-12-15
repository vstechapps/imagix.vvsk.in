import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project as ProjectData } from '../services/project.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrl: './preview.css',
})
export class PreviewComponent implements OnInit, OnDestroy {
  @Input() project: ProjectData | null = null;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private _movie: any;

  async ngOnInit() {
    if (this.project) {
      await this.initEtro();
    }
  }

  async ngOnChanges(changes: any) {
    if (changes.project && !changes.project.firstChange && this.project) {
      if (this._movie) {
        this._movie.stop();
        this._movie = null;
      }
      await this.initEtro();
    }
  }

  private async initEtro() {
    if (!this.project || !this.canvasRef) return;

    try {
      const etro: any = await import('etro');

      const width = this.project.width || 960;
      const height = this.project.height || 540;
      const duration = this.project.duration || 10;

      // Movie WITH canvas attached
      const movie = new etro.Movie({
        canvas: this.canvasRef.nativeElement,
        width,
        height
      });

      const layers = this.project.layers;
      let scene: any;

      if (layers && layers.length > 0) {
        // Reconstruct from saved data
        scene = new etro.Scene({ duration });

        layers.forEach((layerData: any) => {
          let newLayer;
          const { type, ...options } = layerData;

          // Construct layer based on type
          if (type === 'Image' || type === 'Visual') {
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
        // Default initialization if no layers
        scene = new etro.Scene({ duration });

        // Solid background layer
        const bgLayer = new etro.layers.Rect({
          name: 'Background',
          color: '#111827',
          width,
          height,
          startTime: 0,
          duration
        });
        scene.addLayer(bgLayer);

        // Title text layer
        const projectName = this.project.name || 'Project';
        const textLayer = new etro.layers.Text({
          name: 'Title',
          text: projectName,
          color: '#fff',
          font: '48px Inter, sans-serif',
          x: width / 2 - 100,
          y: height / 2,
          startTime: 0,
          duration: Math.min(5, duration)
        });
        scene.addLayer(textLayer);
      }

      movie.addScene(scene);
      this._movie = movie;

      await movie.play();
    } catch (error) {
      console.error('Failed to initialize Etro in preview', error);
    }
  }

  ngOnDestroy() {
    if (this._movie?.stop) {
      this._movie.stop();
    }
  }
}
