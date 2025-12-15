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
  @Output() mediaDrop = new EventEmitter<Media>();

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
