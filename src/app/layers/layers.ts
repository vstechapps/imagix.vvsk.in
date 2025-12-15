import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { Project, Layer, Visual, Text, Image, Audio, Video } from '../app.models';

@Component({
  selector: 'app-layers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layers.html',
  styleUrl: './layers.css',
})
export class LayersComponent implements OnInit {
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);

  projectId = '';
  layers = signal<Layer[]>([]);
  project = signal<Project | null>(null);

  // Add Layer Dialog
  showAddLayerDialog = signal(false);
  newLayerName = signal('');
  newLayerType = signal<'Visual' | 'Text' | 'Audio' | 'Video' | 'Image'>('Visual');

  // Edit Layer Dialog
  showEditLayerDialog = signal(false);
  selectedLayer = signal<Layer | null>(null);

  get editingLayer(): any {
    return this.selectedLayer();
  }

  async ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      await this.loadProject();
    }
  }

  async loadProject() {
    const project = await this.projectService.getProjectById(this.projectId);
    if (project) {
      this.project.set(project);
      if (project.layers) {
        this.layers.set(project.layers);
      }
    }
  }

  generateLayerName() {
    const hash = Math.random().toString(36).substring(2, 9);
    return `Layer ${hash}`;
  }

  openAddLayerDialog() {
    this.newLayerName.set(this.generateLayerName());
    this.newLayerType.set('Visual');
    this.showAddLayerDialog.set(true);
  }

  closeAddLayerDialog() {
    this.showAddLayerDialog.set(false);
  }

  async addLayer() {
    const name = this.newLayerName();
    const type = this.newLayerType();
    const id = Math.random().toString(36).substring(2, 15);

    let newLayer: any = {
      name,
      type,
      id,
      startTime: 0,
      duration: 5,
    };

    if (type === 'Visual') {
      newLayer = {
        ...newLayer,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        background: 'transparent',
        opacity: 1,
        border: { color: '#000000', thickness: 0 }
      } as Visual;
    } else if (type === 'Text') {
      newLayer = {
        ...newLayer,
        text: 'New Text',
        x: 0,
        y: 0,
        width: 200,
        height: 50,
        opacity: 1,
        color: '#ffffff',
        font: '24px Arial',
        textX: 0,
        textY: 0,
        textAlign: 'left',
        textBaseline: 'alphabetic',
        textDirection: 'ltr',
        textStroke: null
      } as Text;
    } else if (type === 'Video') {
      newLayer = {
        ...newLayer,
        x: 0, y: 0, width: 320, height: 180, source: '',
        sourceX: 0, sourceY: 0, sourceWidth: 320, sourceHeight: 180, sourceStartTime: 0,
        destX: 0, destY: 0, destWidth: 320, destHeight: 180,
        opacity: 1, muted: false, volume: 1, playbackRate: 1
      } as Video;
    } else if (type === 'Audio') {
      newLayer = {
        ...newLayer,
        source: '',
        sourceStartTime: 0, muted: false, volume: 1, playbackRate: 1
      } as Audio;
    } else if (type === 'Image') {
      newLayer = {
        ...newLayer,
        source: '',
        x: 0, y: 0, width: 100, height: 100,
        sourceX: 0, sourceY: 0, sourceWidth: 100, sourceHeight: 100,
        destX: 0, destY: 0, destWidth: 100, destHeight: 100,
        opacity: 1
      } as Image;
    }

    // cast back to Layer for the array
    const layer = newLayer as Layer;

    const currentLayers = this.layers();
    const updatedLayers = [...currentLayers, layer];

    await this.saveLayers(updatedLayers);
    this.closeAddLayerDialog();
  }

  openEditLayerDialog(layer: Layer) {
    this.selectedLayer.set(JSON.parse(JSON.stringify(layer))); // Deep copy to avoid direct mutation
    this.showEditLayerDialog.set(true);
  }

  closeEditLayerDialog() {
    this.showEditLayerDialog.set(false);
    this.selectedLayer.set(null);
  }

  async saveLayerChanges() {
    const editedLayer = this.selectedLayer();
    if (!editedLayer) return;

    const currentLayers = this.layers();
    const updatedLayers = currentLayers.map(l => l.id === editedLayer.id ? editedLayer : l);

    await this.saveLayers(updatedLayers);
    this.closeEditLayerDialog();
  }

  async deleteLayer(layer: Layer) {
    if (!confirm(`Are you sure you want to delete ${layer.name}?`)) return;

    const currentLayers = this.layers();
    const updatedLayers = currentLayers.filter(l => l.id !== layer.id);

    await this.saveLayers(updatedLayers);
  }

  async saveLayers(updatedLayers: Layer[]) {
    this.layers.set(updatedLayers);

    // Save to firestore
    const project = this.project();
    if (project) {

      await this.projectService.updateProject(this.projectId, {
        layers: updatedLayers
      });
    }
  }
}
