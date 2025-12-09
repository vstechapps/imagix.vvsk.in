import { ApplicationConfig, provideZoneChangeDetection, isDevMode, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp, FirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // Ensure Auth uses the same app instance
    provideAuth(() => {
      const app = inject(FirebaseApp);
      return getAuth(app);
    }),
    // Ensure Firestore uses the same app instance
    provideFirestore(() => {
      const app = inject(FirebaseApp);
      return getFirestore(app);
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
