import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ScreenTrackingService,
  UserTrackingService,
  getAnalytics,
  provideAnalytics,
} from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';
import { provideToastr } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase))
    ),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    provideHttpClient(withFetch()),
    provideMarkdown(),
    provideAnimations(),
    provideToastr({
      closeButton: true,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      timeOut: 2000,
    }),
    ScreenTrackingService,
    UserTrackingService,
  ],
};
