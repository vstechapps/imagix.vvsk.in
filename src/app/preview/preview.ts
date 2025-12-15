import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.html',
  styleUrl: './preview.css',
})
export class PreviewComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private _movie: any;

  @Input()
  set movie(value: any) {
    this._movie = value;
    this.updateCanvas();
  }

  get movie(): any {
    return this._movie;
  }

  ngOnInit() {
    if (this.movie && this.canvasRef) {
      this.movie.canvas = this.canvasRef.nativeElement;
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private updateCanvas() {
    if (this._movie && this.canvasRef) {
      this._movie.canvas = this.canvasRef.nativeElement;
    }
  }
}
