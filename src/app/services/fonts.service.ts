import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { Font } from '../app.models';
import { orderBy } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FontsService {
    private firestoreService = inject(FirestoreService);
    private readonly FONTS_COLLECTION = 'fonts';

    /** Real-time fonts stream */
    getFonts(): Observable<Font[]> {
        return this.firestoreService.getQueryData<Font>(
            this.FONTS_COLLECTION,
            { idField: 'id' },
            orderBy('createdAt', 'desc')
        );
    }

    /** Create font */
    addFont(font: Pick<Font, 'name' | 'source'>): Promise<string> {
        return this.firestoreService.create<Font>(this.FONTS_COLLECTION, {
            ...font,
            createdAt: Date.now()
        });
    }

    /** Update font */
    updateFont(id: string, data: Partial<Font>): Promise<void> {
        return this.firestoreService.update<Font>(this.FONTS_COLLECTION, id, {
            ...data,
            updatedAt: Date.now()
        });
    }

    /** Delete font */
    deleteFont(id: string): Promise<void> {
        return this.firestoreService.delete(this.FONTS_COLLECTION, id);
    }
}