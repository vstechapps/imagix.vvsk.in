import { Injectable, inject } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirestoreService } from './firestore.service';
import { Project } from '../app.models';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private firestoreService = inject(FirestoreService);
    private authService = inject(AuthService);
    private readonly PROJECTS_COLLECTION = 'projects';

    // Observable source for the currently active project
    activeProject$ = new BehaviorSubject<Project | null>(null);

    async createProject(
        name: string,
        template: 'portrait' | 'landscape',
        duration: number,
        width: number,
        height: number
    ): Promise<void> {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const project: Omit<Project, 'id'> = {
            name,
            userId: user.uid,
            template,
            duration,
            width,
            height,
            createdAt: new Date().toDateString(),
            updatedAt: new Date().toDateString(),
            media: []
        };

        const docRef = await this.firestoreService.create<Project>(this.PROJECTS_COLLECTION, project);
        // docRef doesn't return the full project usually, but we can construct it if needed, 
        // or let the caller rely on reloading/navigating.
        // Assuming create returns the ID or reference. Firestorage service implementation dependent.
    }

    async deleteProject(projectId: string): Promise<void> {
        await this.firestoreService.delete(this.PROJECTS_COLLECTION, projectId);
    }

    async getProjectById(projectId: string): Promise<Project | null> {
        const project = await this.firestoreService.getById<Project>(this.PROJECTS_COLLECTION, projectId);
        if (project) {
            this.activeProject$.next(project);
        }
        return project;
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
