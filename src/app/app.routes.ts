import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './services/auth.guard';
import { Project } from './project/project';
import { Fonts } from './fonts/fonts';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'fonts', component: Fonts, canActivate: [authGuard] },
    { path: 'projects/:id', component: Project, canActivate: [authGuard] },
    { path: 'projects/:id/media', loadComponent: () => import('./media/media').then(m => m.MediaComponent), canActivate: [authGuard] },
    { path: 'projects/:id/layers', loadComponent: () => import('./layers/layers').then(m => m.LayersComponent), canActivate: [authGuard] },
    { path: 'projects/:id/preview', loadComponent: () => import('./preview/preview').then(m => m.PreviewComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: 'dashboard' }
];
