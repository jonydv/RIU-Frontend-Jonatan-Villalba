import { Routes } from '@angular/router';
import { ROUTE_PATHS } from '../../core/constants/app-routes.constants';

export const heroesRoutes: Routes = [
  {
    path: ROUTE_PATHS.root,
    loadComponent: () =>
      import('./pages/hero-list-page/hero-list-page.component').then(
        (m) => m.HeroListPageComponent,
      ),
  },
  {
    path: ROUTE_PATHS.heroDetail,
    loadComponent: () =>
      import('./pages/hero-detail-page/hero-detail-page.component').then(
        (m) => m.HeroDetailPageComponent,
      ),
  },
];
