import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import { fakeHeroesBackendInterceptor } from './core/interceptors/fake-heroes-backend.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { API_ENDPOINTS } from './core/constants/api.constants';
import { environment } from '../environments/environment';

const heroesUrl = `${environment.apiBaseUrl}/${API_ENDPOINTS.heroes}`;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        filter: (req) => !req.url.startsWith(heroesUrl),
      }),
    ),
    provideHttpClient(withInterceptors([loadingInterceptor, fakeHeroesBackendInterceptor])),
  ],
};
