import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media } from '../app.models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class TimelineComponent {
  @Input() layers: any[] = [];
  @Input() projectDuration: number = 0;
  @Output() mediaDrop = new EventEmitter<Media>();

  getClipStyle(layer: any) {
    if (!this.projectDuration) return { width: '0%' };
    const width = (layer.duration / this.projectDuration) * 100;
    const left = (layer.startTime / this.projectDuration) * 100;
    return {
      width: `${width}%`,
      left: `${left}%`,
      position: 'absolute'
    };
  }

  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const mediaJson = event.dataTransfer?.getData('application/json');
    if (mediaJson) {
      try {
        const media = JSON.parse(mediaJson);
        this.mediaDrop.emit(media);
      } catch (e) {
        console.error('Failed to parse dropped media', e);
      }
    }
  }
}
