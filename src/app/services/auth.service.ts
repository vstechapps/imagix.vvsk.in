import { Injectable, inject } from '@angular/core';
import { GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private firestoreService = inject(FirestoreService);
    user$: Observable<User | null> = user(this.firestoreService.auth);

    constructor() { }

    async login() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(this.firestoreService.auth, provider);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.firestoreService.auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    }
}
