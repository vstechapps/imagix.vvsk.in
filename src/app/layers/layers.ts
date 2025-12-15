import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProjectService, Project, Layer } from '../services/project.service';

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
  newLayerType = signal<'Visual' | 'Text' | 'Audio' | 'Video'>('Visual');

  // Edit Layer Dialog
  showEditLayerDialog = signal(false);
  selectedLayer = signal<Layer | null>(null);

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
    const layerId = Math.random().toString(36).substring(2, 15);

    const newLayer: Layer = {
      name,
      type,
      layerId,
      startTime: 0,
      duration: 5, // Default duration
      // Default properties based on type could be set here
    };

    if (type === 'Text') {
      newLayer.text = 'New Text';
      newLayer.font = '24px Arial';
      newLayer.color = '#ffffff';
      newLayer.x = 100;
      newLayer.y = 100;
    } else if (type === 'Visual') {
      newLayer.width = 100;
      newLayer.height = 100;
      newLayer.x = 0;
      newLayer.y = 0;
      newLayer.color = '#ff0000'; // Placeholder color
    }
    // Audio/Video might need source, defaulting to empty or placeholder

    const currentLayers = this.layers();
    const updatedLayers = [...currentLayers, newLayer];

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
    const updatedLayers = currentLayers.map(l => l.layerId === editedLayer.layerId ? editedLayer : l);

    await this.saveLayers(updatedLayers);
    this.closeEditLayerDialog();
  }

  async deleteLayer(layer: Layer) {
    if (!confirm(`Are you sure you want to delete ${layer.name}?`)) return;

    const currentLayers = this.layers();
    const updatedLayers = currentLayers.filter(l => l.layerId !== layer.layerId);

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

      // Refresh project data locally
      // this.project.set({ ...project, timeline: { duration, layers: updatedLayers } });
    }
  }
}
