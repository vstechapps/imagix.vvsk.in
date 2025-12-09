import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media, ProjectService } from '../services/project.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.html',
  styleUrl: './media.css',
})
export class MediaComponent implements OnInit {
  @Input() projectId: string = '';
  @Input() initialMedia: Media[] = [];
  @Output() mediaChange = new EventEmitter<Media[]>();

  private projectService = inject(ProjectService);

  // Media management
  media = signal<Media[]>([]);
  images = signal<Media[]>([]);
  videos = signal<Media[]>([]);
  audio = signal<Media[]>([]);
  
  // Collapsible states
  isImagesExpanded = signal(false);
  isVideosExpanded = signal(false);
  isAudioExpanded = signal(false);

  ngOnInit() {
    // Load initial media if provided
    if (this.initialMedia && this.initialMedia.length > 0) {
      this.media.set(this.initialMedia);
      this.organizeMedia(this.initialMedia);
    }
  }

  private organizeMedia(mediaArray: Media[]) {
    this.images.set(mediaArray.filter(m => m.type === 'image'));
    this.videos.set(mediaArray.filter(m => m.type === 'video'));
    this.audio.set(mediaArray.filter(m => m.type === 'audio'));
  }

  // Media selection handlers
  onMediaSelected(event: Event, type: 'image' | 'video' | 'audio') {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (!files || files.length === 0) return;

    const newMedia: Media[] = Array.from(files).map(file => {
      const path = URL.createObjectURL(file);
      const format = file.name.split('.').pop()?.toLowerCase() || '';
      
      return {
        file,
        path,
        type,
        format
      };
    });

    // Add to existing media
    const currentMedia = this.media();
    const updatedMedia = [...currentMedia, ...newMedia];
    this.media.set(updatedMedia);
    this.organizeMedia(updatedMedia);

    // Emit change event
    this.mediaChange.emit(updatedMedia);

    // Save to project
    this.saveMediaToProject(updatedMedia);

    // Reset input
    input.value = '';
  }

  private async saveMediaToProject(mediaArray: Media[]) {
    if (!this.projectId) return;

    try {
      // Convert File objects to serializable format for Firestore
      // Note: Files need to be uploaded to storage first, then save URLs
      // For now, we'll save metadata (name, type, format) and handle file upload separately
      const mediaMetadata: Media[] = mediaArray.map(m => ({
        path: m.path, // Blob URL (temporary) or storage URL
        type: m.type,
        format: m.format,
        name: m.file?.name || m.name,
        size: m.file?.size || m.size
        // file property is excluded as it can't be serialized
      }));

      await this.projectService.updateProject(this.projectId, {
        media: mediaMetadata
      });
    } catch (error) {
      console.error('Error saving media to project:', error);
    }
  }

  removeMedia(mediaItem: Media) {
    const currentMedia = this.media();
    const updatedMedia = currentMedia.filter(m => 
      m.path !== mediaItem.path && 
      (m.file?.name !== mediaItem.file?.name && m.name !== mediaItem.name)
    );
    this.media.set(updatedMedia);
    this.organizeMedia(updatedMedia);
    
    // Emit change event
    this.mediaChange.emit(updatedMedia);
    
    // Save to project
    this.saveMediaToProject(updatedMedia);
    
    // Revoke object URL to free memory if it's a blob URL
    if (mediaItem.path.startsWith('blob:')) {
      URL.revokeObjectURL(mediaItem.path);
    }
  }

  toggleImages() {
    this.isImagesExpanded.set(!this.isImagesExpanded());
  }

  toggleVideos() {
    this.isVideosExpanded.set(!this.isVideosExpanded());
  }

  toggleAudio() {
    this.isAudioExpanded.set(!this.isAudioExpanded());
  }
}

