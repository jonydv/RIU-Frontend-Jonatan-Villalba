import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { API_ENDPOINTS, HTTP_METHODS, HTTP_STATUS, QUERY_PARAMS } from '../constants/api.constants';
import { API_CONFIG } from '../tokens/api-config.token';
import { HeroStoreService } from '../services/hero-store.service';
import { DEFAULT_PAGE } from '../../features/heroes/constants/hero-list.constants';
import type { Hero, HeroDraft } from '../../features/heroes/models/hero.model';
import type { HeroPage } from '../../features/heroes/models/hero-page.model';

export const fakeHeroesBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const apiConfig = inject(API_CONFIG);
  const heroStore = inject(HeroStoreService);
  const heroesUrl = `${apiConfig.baseUrl}/${API_ENDPOINTS.heroes}`;

  const isCollection = req.url === heroesUrl;
  const isItem = req.url.startsWith(`${heroesUrl}/`);

  if (!isCollection && !isItem) {
    return next(req);
  }

  const heroId = isItem ? req.url.slice(heroesUrl.length + 1) : null;

  return of(null).pipe(
    delay(apiConfig.simulatedDelayMs),
    switchMap(() => handleHeroesRequest(req, heroId, heroStore)),
  );
};

function handleHeroesRequest(
  req: HttpRequest<unknown>,
  heroId: string | null,
  heroStore: HeroStoreService,
): Observable<HttpEvent<unknown>> {
  if (heroId === null) {
    if (req.method === HTTP_METHODS.get) {
      return of(respond(HTTP_STATUS.ok, buildHeroPage(req, heroStore)));
    }
    if (req.method === HTTP_METHODS.post) {
      return of(respond(HTTP_STATUS.created, heroStore.create(req.body as HeroDraft)));
    }
  } else {
    if (req.method === HTTP_METHODS.get) {
      const hero = heroStore.findById(heroId);
      return hero ? of(respond(HTTP_STATUS.ok, hero)) : notFound(heroId);
    }
    if (req.method === HTTP_METHODS.put) {
      const updated = heroStore.update({ ...(req.body as HeroDraft), id: heroId });
      return updated ? of(respond(HTTP_STATUS.ok, updated)) : notFound(heroId);
    }
    if (req.method === HTTP_METHODS.delete) {
      return heroStore.remove(heroId)
        ? of(respond<null>(HTTP_STATUS.noContent, null))
        : notFound(heroId);
    }
  }

  return notFound(heroId ?? '');
}

function buildHeroPage(req: HttpRequest<unknown>, heroStore: HeroStoreService): HeroPage<Hero> {
  const search = (req.params.get(QUERY_PARAMS.search) ?? '').trim().toUpperCase();
  const page = Number(req.params.get(QUERY_PARAMS.page) ?? DEFAULT_PAGE.pageIndex);
  const size = Number(req.params.get(QUERY_PARAMS.size) ?? DEFAULT_PAGE.pageSize);

  const filtered = search
    ? heroStore.getAll().filter((hero) => hero.name.toUpperCase().includes(search))
    : heroStore.getAll();

  const start = page * size;

  return {
    items: filtered.slice(start, start + size),
    total: filtered.length,
    page,
    size,
  };
}

function respond<T>(status: number, body: T): HttpResponse<T> {
  return new HttpResponse<T>({ status, body });
}

function notFound(heroId: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status: HTTP_STATUS.notFound,
        statusText: 'Not Found',
        error: { message: `Hero ${heroId} not found` },
      }),
  );
}
