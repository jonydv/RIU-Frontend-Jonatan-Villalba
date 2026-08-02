import { HttpClient, HttpParams, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { fakeHeroesBackendInterceptor } from './fake-heroes-backend.interceptor';
import { API_CONFIG, ApiConfig } from '../tokens/api-config.token';
import { API_ENDPOINTS, QUERY_PARAMS } from '../constants/api.constants';
import { HERO_PUBLISHERS } from '../../features/heroes/constants/hero.constants';
import type { Hero, HeroDraft } from '../../features/heroes/models/hero.model';
import type { HeroPage } from '../../features/heroes/models/hero-page.model';

const TEST_API_CONFIG: ApiConfig = { baseUrl: '/test-api', simulatedDelayMs: 0 };
const HEROES_URL = `${TEST_API_CONFIG.baseUrl}/${API_ENDPOINTS.heroes}`;

const DRAFT: HeroDraft = {
  name: 'TEST HERO',
  alterEgo: null,
  imageUrl: null,
  publisher: HERO_PUBLISHERS.other,
  powers: ['Test Power'],
  powerLevel: 42,
  firstAppearance: '2024-01-01',
  active: true,
};

function setup(): { http: HttpClient; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([fakeHeroesBackendInterceptor])),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: TEST_API_CONFIG },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('fakeHeroesBackendInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('GET collection', () => {
    it('should paginate results honoring page and size', async () => {
      const { http } = setup();
      const params = new HttpParams()
        .set(QUERY_PARAMS.page, 0)
        .set(QUERY_PARAMS.size, 10);

      const page = await firstValueFrom(http.get<HeroPage<Hero>>(HEROES_URL, { params }));

      expect(page.total).toBe(25);
      expect(page.items).toHaveLength(10);
      expect(page.page).toBe(0);
      expect(page.size).toBe(10);
    });

    it('should return the trailing partial page', async () => {
      const { http } = setup();
      const params = new HttpParams()
        .set(QUERY_PARAMS.page, 2)
        .set(QUERY_PARAMS.size, 10);

      const page = await firstValueFrom(http.get<HeroPage<Hero>>(HEROES_URL, { params }));

      expect(page.total).toBe(25);
      expect(page.items).toHaveLength(5);
    });

    it('should filter by search normalizing both sides to uppercase', async () => {
      const { http } = setup();
      const params = new HttpParams()
        .set(QUERY_PARAMS.search, 'superman')
        .set(QUERY_PARAMS.page, 0)
        .set(QUERY_PARAMS.size, 10);

      const page = await firstValueFrom(http.get<HeroPage<Hero>>(HEROES_URL, { params }));

      expect(page.total).toBe(1);
      expect(page.items[0].name).toBe('SUPERMAN');
    });

    it('should return an empty page when nothing matches the search', async () => {
      const { http } = setup();
      const params = new HttpParams()
        .set(QUERY_PARAMS.search, 'no-such-hero')
        .set(QUERY_PARAMS.page, 0)
        .set(QUERY_PARAMS.size, 10);

      const page = await firstValueFrom(http.get<HeroPage<Hero>>(HEROES_URL, { params }));

      expect(page.total).toBe(0);
      expect(page.items).toHaveLength(0);
    });
  });

  describe('GET item', () => {
    it('should return the hero matching the id', async () => {
      const { http } = setup();

      const hero = await firstValueFrom(http.get<Hero>(`${HEROES_URL}/hero-1`));

      expect(hero.name).toBe('SUPERMAN');
    });

    it('should 404 for an unknown id', async () => {
      const { http } = setup();

      await expect(firstValueFrom(http.get(`${HEROES_URL}/unknown-id`))).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('POST', () => {
    it('should create a hero and return it with status 201', async () => {
      const { http } = setup();

      const response = await firstValueFrom(
        http.post<Hero>(HEROES_URL, DRAFT, { observe: 'response' }),
      );

      expect(response.status).toBe(201);
      expect(response.body?.id).toBeTruthy();
      expect(response.body?.name).toBe(DRAFT.name);
    });
  });

  describe('PUT', () => {
    it('should update an existing hero', async () => {
      const { http } = setup();
      const created = await firstValueFrom(http.post<Hero>(HEROES_URL, DRAFT));

      const updated = await firstValueFrom(
        http.put<Hero>(`${HEROES_URL}/${created.id}`, { name: 'UPDATED HERO' }),
      );

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('UPDATED HERO');
    });

    it('should 404 when updating an unknown id', async () => {
      const { http } = setup();

      await expect(
        firstValueFrom(http.put(`${HEROES_URL}/unknown-id`, { name: 'X' })),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('DELETE', () => {
    it('should delete an existing hero and return status 204', async () => {
      const { http } = setup();
      const created = await firstValueFrom(http.post<Hero>(HEROES_URL, DRAFT));

      const response = await firstValueFrom(
        http.delete(`${HEROES_URL}/${created.id}`, { observe: 'response' }),
      );

      expect(response.status).toBe(204);
      await expect(
        firstValueFrom(http.get(`${HEROES_URL}/${created.id}`)),
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should 404 when deleting an unknown id', async () => {
      const { http } = setup();

      await expect(
        firstValueFrom(http.delete(`${HEROES_URL}/unknown-id`)),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('passthrough', () => {
    it('should let requests to unrelated urls reach the real backend', async () => {
      const { http, httpMock } = setup();

      const responsePromise = firstValueFrom(http.get('/unrelated/ping'));
      httpMock.expectOne('/unrelated/ping').flush({ ok: true });

      await expect(responsePromise).resolves.toEqual({ ok: true });
      httpMock.verify();
    });
  });
});
