import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable } from 'rxjs';
import { Font } from '../app.models';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FontsService {
    private readonly FONTS_COLLECTION = 'fonts';
    private injectedFonts = new Set<string>();
    private document = inject(DOCUMENT);

    constructor(private fs: FirestoreService) { }

    getFonts(): Observable<Font[]> {
        return this.fs.getQueryData<Font>(
            this.FONTS_COLLECTION,
            { idField: 'id' }
        );
    }

    createFont(font: Omit<Font, 'id'>) {
        return this.fs.create<Font>(this.FONTS_COLLECTION, font);
    }

    updateFont(id: string, data: Partial<Font>) {
        return this.fs.update<Font>(this.FONTS_COLLECTION, id, data);
    }

    deleteFont(id: string) {
        return this.fs.delete(this.FONTS_COLLECTION, id);
    }

    toggleEnabled(font: Font) {
        return this.updateFont(font.id!, { enabled: !font.enabled });
    }

    /** Load & inject enabled fonts once */
    loadFonts(): void {
        this.getFonts()
            .pipe(
                map(fonts => fonts.filter(f => f.enabled)),
                take(1)
            )
            .subscribe(fonts => {
                fonts.forEach(font => this.injectFont(font));
            });
    }

    /** Inject font link into <head> */
    private injectFont(font: Font): void {
        if (!font.source || this.injectedFonts.has(font.source)) return;

        const link = this.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.source;
        link.setAttribute('data-font', font.name);

        this.document.head.appendChild(link);
        this.injectedFonts.add(font.source);
    }


}
