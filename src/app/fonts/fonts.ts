import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontsService } from '../services/fonts.service';
import { Font } from '../app.models';

@Component({
  selector: 'app-fonts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fonts.html',
  styleUrl: './fonts.css'
})
export class Fonts {
  private fontsService = inject(FontsService);

  fonts = signal<Font[]>([]);
  editingFontId = signal<string | null>(null);

  form = signal({
    name: '',
    source: ''
  });

  constructor() {
    this.fontsService.getFonts().subscribe(fonts => {
      this.fonts.set(fonts);
    });
  }

  saveFont() {
    const { name, source } = this.form();
    if (!name || !source) return;

    if (this.editingFontId()) {
      this.fontsService.updateFont(this.editingFontId()!, {
        name,
        source
      });
    } else {
      this.fontsService.addFont({ name, source });
    }

    this.resetForm();
  }

  editFont(font: Font) {
    this.editingFontId.set(font.id!);
    this.form.set({
      name: font.name,
      source: font.source
    });
  }

  deleteFont(id: string) {
    if (confirm('Delete this font?')) {
      this.fontsService.deleteFont(id);
    }
  }

  resetForm() {
    this.form.set({ name: '', source: '' });
    this.editingFontId.set(null);
  }
}
