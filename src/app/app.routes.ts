import { Routes } from '@angular/router';
import { ROUTE_PATHS } from './core/constants/app-routes.constants';

export const routes: Routes = [
  { path: ROUTE_PATHS.root, redirectTo: ROUTE_PATHS.heroes, pathMatch: 'full' },
  {
    path: ROUTE_PATHS.heroes,
    loadChildren: () => import('./features/heroes/heroes.routes').then((m) => m.heroesRoutes),
  },
  {
    path: ROUTE_PATHS.notFound,
    loadComponent: () =>
      import('./features/heroes/pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
  },
  { path: ROUTE_PATHS.wildcard, redirectTo: ROUTE_PATHS.notFound },
];
