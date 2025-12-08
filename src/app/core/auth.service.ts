import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    user$: Observable<User | null> = user(this.auth);

    constructor() { }

    async login() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(this.auth, provider);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    }
}
