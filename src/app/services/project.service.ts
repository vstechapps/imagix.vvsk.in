import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, query, where, getDocs, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';

export interface Project {
    id?: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);
    private projectsCollection = collection(this.firestore, 'projects') as CollectionReference<DocumentData>;

    async createProject(name: string): Promise<void> {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const project: Omit<Project, 'id'> = {
            name,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await addDoc(this.projectsCollection, project);
    }

    async deleteProject(projectId: string): Promise<void> {
        const projectDoc = doc(this.firestore, 'projects', projectId);
        await deleteDoc(projectDoc);
    }

    getUserProjects(): Observable<Project[]> {
        return new Observable((observer) => {
            this.authService.user$.subscribe(user => {
                if (user) {
                    collectionData(this.projectsCollection, { idField: 'id' }).subscribe(
                        (projects) => observer.next(projects as Project[]),
                        (error) => observer.error(error)
                    );
                } else {
                    observer.next([]);
                }
            });
        });
    }

    private async getCurrentUser() {
        return new Promise<any>((resolve) => {
            this.authService.user$.subscribe(user => {
                resolve(user);
            });
        });
    }
}
