import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { HeroService } from './hero.service';
import { API_CONFIG, ApiConfig } from '../../../core/tokens/api-config.token';
import { API_ENDPOINTS, HTTP_METHODS, QUERY_PARAMS } from '../../../core/constants/api.constants';
import { HERO_PUBLISHERS, HERO_SEARCH_MAX_RESULTS } from '../constants/hero.constants';
import type { Hero, HeroDraft, HeroUpdate } from '../models/hero.model';
import type { HeroPage } from '../models/hero-page.model';

const TEST_API_CONFIG: ApiConfig = { baseUrl: '/test-api', simulatedDelayMs: 0 };
const HEROES_URL = `${TEST_API_CONFIG.baseUrl}/${API_ENDPOINTS.heroes}`;

const HERO: Hero = {
  id: 'hero-1',
  name: 'SUPERMAN',
  alterEgo: 'Clark Kent',
  imageUrl: null,
  publisher: HERO_PUBLISHERS.dc,
  powers: ['Vuelo'],
  powerLevel: 99,
  firstAppearance: '1938-06-01',
  active: true,
};

function setup(): { service: HeroService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: TEST_API_CONFIG },
    ],
  });

  return {
    service: TestBed.inject(HeroService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('HeroService', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should compose the heroes url from API_CONFIG.baseUrl', () => {
    const { service, httpMock } = setup();

    service.getHeroById('hero-1').subscribe();

    const req = httpMock.expectOne(`${HEROES_URL}/hero-1`);
    expect(req.request.url).toBe(`${TEST_API_CONFIG.baseUrl}/${API_ENDPOINTS.heroes}/hero-1`);
    req.flush(HERO);
  });

  describe('getHeroes', () => {
    it('should build search, page and size query params', () => {
      const { service, httpMock } = setup();
      const page: HeroPage<Hero> = { items: [HERO], total: 1, page: 0, size: 10 };

      let result: HeroPage<Hero> | undefined;
      service
        .getHeroes({ search: 'super', page: 0, size: 10 })
        .subscribe((response) => (result = response));

      const req = httpMock.expectOne(
        (request) => request.url === HEROES_URL && request.method === HTTP_METHODS.get,
      );
      expect(req.request.params.get(QUERY_PARAMS.search)).toBe('super');
      expect(req.request.params.get(QUERY_PARAMS.page)).toBe('0');
      expect(req.request.params.get(QUERY_PARAMS.size)).toBe('10');

      req.flush(page);
      expect(result).toEqual(page);
    });

    it('should propagate backend errors', async () => {
      const { service, httpMock } = setup();

      const promise = firstValueFrom(service.getHeroes({ search: '', page: 0, size: 10 }));
      const req = httpMock.expectOne(
        (request) => request.url === HEROES_URL && request.method === HTTP_METHODS.get,
      );
      req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

      await expect(promise).rejects.toMatchObject({ status: 500 });
    });
  });

  describe('getHeroById', () => {
    it('should GET the hero by id', () => {
      const { service, httpMock } = setup();

      let result: Hero | undefined;
      service.getHeroById('hero-1').subscribe((hero) => (result = hero));

      const req = httpMock.expectOne(`${HEROES_URL}/hero-1`);
      expect(req.request.method).toBe(HTTP_METHODS.get);
      req.flush(HERO);
      expect(result).toEqual(HERO);
    });

    it('should propagate a 404 when the hero does not exist', async () => {
      const { service, httpMock } = setup();

      const promise = firstValueFrom(service.getHeroById('unknown-id'));
      const req = httpMock.expectOne(`${HEROES_URL}/unknown-id`);
      req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('createHero', () => {
    it('should POST the draft to the heroes collection', () => {
      const { service, httpMock } = setup();
      const draft: HeroDraft = {
        name: HERO.name,
        alterEgo: HERO.alterEgo,
        imageUrl: HERO.imageUrl,
        publisher: HERO.publisher,
        powers: HERO.powers,
        powerLevel: HERO.powerLevel,
        firstAppearance: HERO.firstAppearance,
        active: HERO.active,
      };

      let result: Hero | undefined;
      service.createHero(draft).subscribe((hero) => (result = hero));

      const req = httpMock.expectOne(HEROES_URL);
      expect(req.request.method).toBe(HTTP_METHODS.post);
      expect(req.request.body).toEqual(draft);
      req.flush(HERO);
      expect(result).toEqual(HERO);
    });
  });

  describe('updateHero', () => {
    it('should PUT to the hero id url without the id in the body', () => {
      const { service, httpMock } = setup();
      const update: HeroUpdate = { id: 'hero-1', name: 'UPDATED' };

      let result: Hero | undefined;
      service.updateHero(update).subscribe((hero) => (result = hero));

      const req = httpMock.expectOne(`${HEROES_URL}/hero-1`);
      expect(req.request.method).toBe(HTTP_METHODS.put);
      expect(req.request.body).toEqual({ name: 'UPDATED' });
      req.flush({ ...HERO, name: 'UPDATED' });
      expect(result?.name).toBe('UPDATED');
    });
  });

  describe('deleteHero', () => {
    it('should DELETE the hero by id', () => {
      const { service, httpMock } = setup();

      let completed = false;
      service.deleteHero('hero-1').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${HEROES_URL}/hero-1`);
      expect(req.request.method).toBe(HTTP_METHODS.delete);
      req.flush(null);
      expect(completed).toBe(true);
    });
  });

  describe('searchByName', () => {
    it('should search the collection and return only the items', () => {
      const { service, httpMock } = setup();
      const page: HeroPage<Hero> = {
        items: [HERO],
        total: 1,
        page: 0,
        size: HERO_SEARCH_MAX_RESULTS,
      };

      let result: readonly Hero[] | undefined;
      service.searchByName('superman').subscribe((heroes) => (result = heroes));

      const req = httpMock.expectOne(
        (request) => request.url === HEROES_URL && request.method === HTTP_METHODS.get,
      );
      expect(req.request.params.get(QUERY_PARAMS.search)).toBe('superman');
      expect(req.request.params.get(QUERY_PARAMS.page)).toBe('0');
      expect(req.request.params.get(QUERY_PARAMS.size)).toBe(String(HERO_SEARCH_MAX_RESULTS));

      req.flush(page);
      expect(result).toEqual(page.items);
    });
  });
});
