import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontsService } from '../services/fonts.service';
import { Font } from '../app.models';

@Component({
  selector: 'app-fonts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fonts.html',
  styleUrl: './fonts.css'
})
export class Fonts {

  private fontsService = inject(FontsService);

  fonts$ = this.fontsService.getFonts();

  fontForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    source: new FormControl('', { nonNullable: true }),
    enabled: new FormControl(false, { nonNullable: true }) // ✅ default ON
  });

  editingId: string | null = null;

  save() {
    if (this.fontForm.invalid) return;

    const data = {
      ...this.fontForm.value,
      createdAt: Date.now()
    } as any;

    if (this.editingId) {
      this.fontsService.updateFont(this.editingId, data);
    } else {
      this.fontsService.createFont(data);
    }

    this.fontForm.reset({ enabled: true });
    this.editingId = null;
  }

  edit(font: Font) {
    this.editingId = font.id!;
    this.fontForm.setValue({
      name: font.name,
      source: font.source,
      enabled: font.enabled
    });
  }

  toggle(font: Font) {
    this.fontsService.toggleEnabled(font);
  }

  delete(id: string) {
    this.fontsService.deleteFont(id);
  }
}
