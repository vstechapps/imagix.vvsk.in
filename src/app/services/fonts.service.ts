import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc, updateDoc, addDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { Font } from '../app.models';

@Injectable({ providedIn: 'root' })
export class FontsService {
    private firestore = inject(Firestore);
    private fontsRef = collection(this.firestore, 'fonts');

    getFonts(): Observable<Font[]> {
        const q = query(this.fontsRef, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Font[]>;
    }

    addFont(font: Omit<Font, 'id'>) {
        return addDoc(this.fontsRef, font);
    }

    updateFont(id: string, font: Partial<Font>) {
        const ref = doc(this.firestore, `fonts/${id}`);
        return updateDoc(ref, {
            ...font,
            updatedAt: Date.now()
        });
    }

    deleteFont(id: string) {
        const ref = doc(this.firestore, `fonts/${id}`);
        return deleteDoc(ref);
    }
}