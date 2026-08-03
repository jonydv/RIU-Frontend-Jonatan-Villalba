import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { HeroListStoreService } from './hero-list-store.service';
import { API_CONFIG, type ApiConfig } from '../../../core/tokens/api-config.token';
import { API_ENDPOINTS, QUERY_PARAMS } from '../../../core/constants/api.constants';
import { STORAGE_KEYS } from '../../../core/constants/storage.constants';
import { HERO_PUBLISHERS } from '../constants/hero.constants';
import { DEFAULT_PAGE, HERO_VIEW_MODE, SEARCH_DEBOUNCE_MS } from '../constants/hero-list.constants';
import type { Hero } from '../models/hero.model';
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

function page(items: readonly Hero[], total = items.length): HeroPage<Hero> {
  return { items, total, page: DEFAULT_PAGE.pageIndex, size: DEFAULT_PAGE.pageSize };
}

interface Harness {
  store: HeroListStoreService;
  httpMock: HttpTestingController;
  breakpointState$: Subject<BreakpointState>;
}

function setup(platform: 'browser' | 'server' = 'browser'): Harness {
  const breakpointState$ = new Subject<BreakpointState>();

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      HeroListStoreService,
      { provide: API_CONFIG, useValue: TEST_API_CONFIG },
      { provide: PLATFORM_ID, useValue: platform },
      { provide: BreakpointObserver, useValue: { observe: () => breakpointState$ } },
    ],
  });

  return {
    store: TestBed.inject(HeroListStoreService),
    httpMock: TestBed.inject(HttpTestingController),
    breakpointState$,
  };
}

function render(): void {
  TestBed.inject(ApplicationRef).tick();
}

function pendingRequest(httpMock: HttpTestingController) {
  render();
  vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

  return httpMock.expectOne((request) => request.url === HEROES_URL);
}

function settle(httpMock: HttpTestingController, response: HeroPage<Hero> = page([HERO])): void {
  pendingRequest(httpMock).flush(response);
}

describe('HeroListStoreService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('search and pagination', () => {
    it('should request the first page on init', () => {
      const { store, httpMock } = setup();

      settle(httpMock);

      expect(store.heroPage().items).toEqual([HERO]);
      httpMock.verify();
    });

    it('should debounce consecutive search terms into a single request', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      store.setSearchTerm('s');
      store.setSearchTerm('su');
      store.setSearchTerm('sup');
      render();
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
      httpMock.expectNone((request) => request.url === HEROES_URL);

      vi.advanceTimersByTime(1);
      const request = httpMock.expectOne((candidate) => candidate.url === HEROES_URL);

      expect(request.request.params.get(QUERY_PARAMS.search)).toBe('sup');
      request.flush(page([HERO]));
      httpMock.verify();
    });

    it('should reset to the first page when the search term changes', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      store.setPageIndex(2);
      settle(httpMock);
      expect(store.pageIndex()).toBe(2);

      store.setSearchTerm('batman');

      expect(store.pageIndex()).toBe(DEFAULT_PAGE.pageIndex);
      settle(httpMock);
      httpMock.verify();
    });

    it('should request the selected page', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      store.setPageIndex(3);
      const request = pendingRequest(httpMock);

      expect(request.request.params.get(QUERY_PARAMS.page)).toBe('3');
      request.flush(page([HERO]));
      httpMock.verify();
    });

    it('should reset to the first page when the page size changes', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      store.setPageIndex(2);
      settle(httpMock);

      store.setPageSize(25);

      expect(store.pageIndex()).toBe(DEFAULT_PAGE.pageIndex);
      const request = pendingRequest(httpMock);
      expect(request.request.params.get(QUERY_PARAMS.size)).toBe('25');
      request.flush(page([HERO]));
      httpMock.verify();
    });

    it('should refetch the same query when refreshed', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      store.refresh();

      settle(httpMock, page([]));
      expect(store.heroPage().items).toEqual([]);
      httpMock.verify();
    });
  });

  describe('view mode', () => {
    it('should default to the card view', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      expect(store.viewMode()).toBe(HERO_VIEW_MODE.card);
      expect(store.effectiveViewMode()).toBe(HERO_VIEW_MODE.card);
    });

    it('should switch to the table view and persist the choice', () => {
      const { store, httpMock } = setup();
      settle(httpMock);

      store.setViewMode(HERO_VIEW_MODE.table);

      expect(store.effectiveViewMode()).toBe(HERO_VIEW_MODE.table);
      expect(localStorage.getItem(STORAGE_KEYS.heroListViewMode)).toBe(HERO_VIEW_MODE.table);
    });

    it('should force the card view on handset even when table is preferred', () => {
      const { store, httpMock, breakpointState$ } = setup();
      settle(httpMock);

      store.setViewMode(HERO_VIEW_MODE.table);
      breakpointState$.next({ matches: true, breakpoints: {} });

      expect(store.viewMode()).toBe(HERO_VIEW_MODE.table);
      expect(store.effectiveViewMode()).toBe(HERO_VIEW_MODE.card);
    });

    it('should restore the table view back when leaving handset', () => {
      const { store, httpMock, breakpointState$ } = setup();
      settle(httpMock);

      store.setViewMode(HERO_VIEW_MODE.table);
      breakpointState$.next({ matches: true, breakpoints: {} });
      breakpointState$.next({ matches: false, breakpoints: {} });

      expect(store.effectiveViewMode()).toBe(HERO_VIEW_MODE.table);
    });

    it('should not persist the view mode on the server platform', () => {
      const { store, httpMock } = setup('server');
      settle(httpMock);

      store.setViewMode(HERO_VIEW_MODE.table);

      expect(localStorage.getItem(STORAGE_KEYS.heroListViewMode)).toBeNull();
    });

    it('should keep the card view for the first render even when table is persisted', () => {
      localStorage.setItem(STORAGE_KEYS.heroListViewMode, HERO_VIEW_MODE.table);
      const { store, httpMock } = setup();

      expect(store.viewMode()).toBe(HERO_VIEW_MODE.card);

      settle(httpMock);

      expect(store.viewMode()).toBe(HERO_VIEW_MODE.table);
    });

    it('should ignore a corrupted persisted view mode', () => {
      localStorage.setItem(STORAGE_KEYS.heroListViewMode, 'not-a-view-mode');
      const { store, httpMock } = setup();

      settle(httpMock);

      expect(store.viewMode()).toBe(HERO_VIEW_MODE.card);
    });
  });
});
