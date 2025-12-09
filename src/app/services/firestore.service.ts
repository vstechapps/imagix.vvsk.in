import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, QueryConstraint, collectionData, DocumentData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    private _firestore = inject(Firestore);
    private _auth = inject(Auth);

    get firestore(): Firestore {
        return this._firestore;
    }

    get auth(): Auth {
        return this._auth;
    }

    /**
     * Get a collection reference
     */
    getCollection(collectionPath: string) {
        return collection(this._firestore, collectionPath);
    }

    /**
     * Get a document reference
     */
    getDocument(collectionPath: string, documentId: string) {
        return doc(this._firestore, collectionPath, documentId);
    }

    /**
     * Create a new document in a collection
     */
    async create<T extends DocumentData>(collectionPath: string, data: Omit<T, 'id'>): Promise<string> {
        const collectionRef = this.getCollection(collectionPath);
        const docRef = await addDoc(collectionRef, data);
        return docRef.id;
    }

    /**
     * Read a single document by ID
     */
    async getById<T extends DocumentData>(collectionPath: string, documentId: string): Promise<T | null> {
        const docRef = this.getDocument(collectionPath, documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as unknown as T;
        }
        return null;
    }

    /**
     * Read all documents from a collection (one-time)
     */
    async getAll<T extends DocumentData>(collectionPath: string): Promise<T[]> {
        const collectionRef = this.getCollection(collectionPath);
        const querySnapshot = await getDocs(collectionRef);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as unknown as T[];
    }

    /**
     * Query documents with constraints (one-time)
     */
    async query<T extends DocumentData>(
        collectionPath: string,
        ...queryConstraints: QueryConstraint[]
    ): Promise<T[]> {
        const collectionRef = this.getCollection(collectionPath);
        const q = queryConstraints.length > 0 
            ? query(collectionRef, ...queryConstraints)
            : collectionRef;
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as unknown as T[];
    }

    /**
     * Real-time observable stream of documents from a collection
     */
    getCollectionData<T extends DocumentData>(
        collectionPath: string,
        options?: { idField?: string }
    ): Observable<T[]> {
        const collectionRef = this.getCollection(collectionPath);
        return collectionData(collectionRef, { idField: options?.idField || 'id' }) as Observable<T[]>;
    }

    /**
     * Real-time observable stream of queried documents
     */
    getQueryData<T extends DocumentData>(
        collectionPath: string,
        options?: { idField?: string },
        ...queryConstraints: QueryConstraint[]
    ): Observable<T[]> {
        const collectionRef = this.getCollection(collectionPath);
        const q = queryConstraints.length > 0
            ? query(collectionRef, ...queryConstraints)
            : collectionRef;
        
        return collectionData(q, { idField: options?.idField || 'id' }) as Observable<T[]>;
    }

    /**
     * Update a document
     */
    async update<T extends DocumentData>(
        collectionPath: string,
        documentId: string,
        data: Partial<T>
    ): Promise<void> {
        const docRef = this.getDocument(collectionPath, documentId);
        await updateDoc(docRef, data as DocumentData);
    }

    /**
     * Delete a document
     */
    async delete(collectionPath: string, documentId: string): Promise<void> {
        const docRef = this.getDocument(collectionPath, documentId);
        await deleteDoc(docRef);
    }
}

