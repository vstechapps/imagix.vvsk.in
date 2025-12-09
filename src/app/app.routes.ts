import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './services/auth.guard';
import { Project } from './project/project';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'projects/:id', component: Project, canActivate: [authGuard] },
    { path: '**', redirectTo: 'dashboard' }
];
