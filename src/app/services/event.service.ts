import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private createProjectSubject = new Subject<void>();

    createProject$ = this.createProjectSubject.asObservable();

    triggerCreateProject() {
        this.createProjectSubject.next();
    }
}
