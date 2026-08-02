import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HeroService } from '../data/hero.service';
import { DEFAULT_PAGE, SEARCH_DEBOUNCE_MS } from '../constants/hero-list.constants';
import type { Hero } from '../models/hero.model';
import type { HeroPage, HeroQuery } from '../models/hero-page.model';

const EMPTY_HERO_PAGE: HeroPage<Hero> = {
  items: [],
  total: 0,
  page: DEFAULT_PAGE.pageIndex,
  size: DEFAULT_PAGE.pageSize,
};

function isSameQuery(a: HeroQuery, b: HeroQuery): boolean {
  return a.search === b.search && a.page === b.page && a.size === b.size;
}

@Injectable()
export class HeroListStoreService {
  private readonly heroService = inject(HeroService);

  private readonly searchTermSignal = signal('');
  private readonly pageIndexSignal = signal<number>(DEFAULT_PAGE.pageIndex);
  private readonly pageSizeSignal = signal<number>(DEFAULT_PAGE.pageSize);

  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly pageIndex = this.pageIndexSignal.asReadonly();
  readonly pageSize = this.pageSizeSignal.asReadonly();

  private readonly query = computed<HeroQuery>(() => ({
    search: this.searchTermSignal(),
    page: this.pageIndexSignal(),
    size: this.pageSizeSignal(),
  }));

  readonly heroPage = toSignal(
    toObservable(this.query).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(isSameQuery),
      switchMap((query) => this.heroService.getHeroes(query)),
    ),
    { initialValue: EMPTY_HERO_PAGE },
  );

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
}
