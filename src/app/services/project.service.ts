import { Injectable, inject } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirestoreService } from './firestore.service';

export interface Media {
    file?: File; // Only available in browser, not stored in Firestore
    path: string; // Blob URL or storage URL
    type: 'image' | 'video' | 'audio';
    format: string;
    name?: string; // File name
    size?: number; // File size in bytes
}

export interface Project {
    id?: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    media?: Media[];
}

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private firestoreService = inject(FirestoreService);
    private authService = inject(AuthService);
    private readonly PROJECTS_COLLECTION = 'projects';

    async createProject(name: string): Promise<void> {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const project: Omit<Project, 'id'> = {
            name,
            userId: user.uid,
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString()
        };

        await this.firestoreService.create<Project>(this.PROJECTS_COLLECTION, project);
    }

    async deleteProject(projectId: string): Promise<void> {
        await this.firestoreService.delete(this.PROJECTS_COLLECTION, projectId);
    }

    async getProjectById(projectId: string): Promise<Project | null> {
        return await this.firestoreService.getById<Project>(this.PROJECTS_COLLECTION, projectId);
    }

    getUserProjects(): Observable<Project[]> {
        return this.authService.user$.pipe(
            switchMap(user => {
                if (!user) {
                    return of([]);
                }
                // Use the abstraction layer for real-time query
                return this.firestoreService.query<Project>(
                    this.PROJECTS_COLLECTION,
                    where('userId', '==', user.uid)
                );
            })
        );
    }

    async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
        await this.firestoreService.update<Project>(this.PROJECTS_COLLECTION, projectId, updates);
    }

    private async getCurrentUser() {
        return new Promise<any>((resolve) => {
            this.authService.user$.subscribe(user => {
                resolve(user);
            });
        });
    }
}
