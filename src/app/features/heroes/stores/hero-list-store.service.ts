import { Injectable, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HeroService } from '../data/hero.service';
import { DEFAULT_PAGE, HERO_VIEW_MODE, SEARCH_DEBOUNCE_MS } from '../constants/hero-list.constants';
import { LayoutService } from '../../../core/services/layout.service';
import { STORAGE_KEYS } from '../../../core/constants/storage.constants';
import type { HeroViewMode } from '../constants/hero-list.constants';
import type { Hero } from '../models/hero.model';
import type { HeroPage, HeroQuery } from '../models/hero-page.model';

const EMPTY_HERO_PAGE: HeroPage<Hero> = {
  items: [],
  total: 0,
  page: DEFAULT_PAGE.pageIndex,
  size: DEFAULT_PAGE.pageSize,
};

interface HeroListRequest extends HeroQuery {
  readonly refreshTrigger: number;
}

function isSameRequest(a: HeroListRequest, b: HeroListRequest): boolean {
  return (
    a.search === b.search &&
    a.page === b.page &&
    a.size === b.size &&
    a.refreshTrigger === b.refreshTrigger
  );
}

@Injectable()
export class HeroListStoreService {
  private readonly heroService = inject(HeroService);
  private readonly layoutService = inject(LayoutService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly searchTermSignal = signal('');
  private readonly pageIndexSignal = signal<number>(DEFAULT_PAGE.pageIndex);
  private readonly pageSizeSignal = signal<number>(DEFAULT_PAGE.pageSize);
  private readonly viewModeSignal = signal<HeroViewMode>(HERO_VIEW_MODE.card);
  private readonly refreshTriggerSignal = signal(0);

  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly pageIndex = this.pageIndexSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();
  readonly viewMode = this.viewModeSignal.asReadonly();

  readonly effectiveViewMode = computed<HeroViewMode>(() =>
    this.layoutService.isHandset() ? HERO_VIEW_MODE.card : this.viewModeSignal(),
  );

  private readonly request = computed<HeroListRequest>(() => ({
    search: this.searchTermSignal(),
    page: this.pageIndexSignal(),
    size: this.pageSizeSignal(),
    refreshTrigger: this.refreshTriggerSignal(),
  }));

  readonly heroPage = toSignal(
    toObservable(this.request).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(isSameRequest),
      switchMap((request) =>
        this.heroService.getHeroes({
          search: request.search,
          page: request.page,
          size: request.size,
        }),
      ),
    ),
    { initialValue: EMPTY_HERO_PAGE },
  );

  constructor() {
    afterNextRender(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.heroListViewMode);
      if (stored === HERO_VIEW_MODE.card || stored === HERO_VIEW_MODE.table) {
        this.viewModeSignal.set(stored);
      }
    });
  }

  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
    this.pageIndexSignal.set(DEFAULT_PAGE.pageIndex);
  }

  setPageIndex(pageIndex: number): void {
    this.pageIndexSignal.set(pageIndex);
  }

  setPageSize(pageSize: number): void {
    this.pageSizeSignal.set(pageSize);
    this.pageIndexSignal.set(DEFAULT_PAGE.pageIndex);
  }

  setViewMode(viewMode: HeroViewMode): void {
    this.viewModeSignal.set(viewMode);

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEYS.heroListViewMode, viewMode);
    }
  }

  refresh(): void {
    this.refreshTriggerSignal.update((count) => count + 1);
  }
}
