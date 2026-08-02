import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS, QUERY_PARAMS } from '../../../core/constants/api.constants';
import { API_CONFIG } from '../../../core/tokens/api-config.token';
import { HERO_SEARCH_MAX_RESULTS } from '../constants/hero.constants';
import type { Hero, HeroDraft, HeroUpdate } from '../models/hero.model';
import type { HeroPage, HeroQuery } from '../models/hero-page.model';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly heroesUrl = `${this.apiConfig.baseUrl}/${API_ENDPOINTS.heroes}`;

  getHeroes(query: HeroQuery): Observable<HeroPage<Hero>> {
    const params = new HttpParams()
      .set(QUERY_PARAMS.search, query.search)
      .set(QUERY_PARAMS.page, query.page)
      .set(QUERY_PARAMS.size, query.size);

    return this.http.get<HeroPage<Hero>>(this.heroesUrl, { params });
  }

  getHeroById(id: string): Observable<Hero> {
    return this.http.get<Hero>(`${this.heroesUrl}/${id}`);
  }

  createHero(draft: HeroDraft): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, draft);
  }

  updateHero(update: HeroUpdate): Observable<Hero> {
    const { id, ...changes } = update;

    return this.http.put<Hero>(`${this.heroesUrl}/${id}`, changes);
  }

  deleteHero(id: string): Observable<void> {
    return this.http.delete<void>(`${this.heroesUrl}/${id}`);
  }

  searchByName(name: string): Observable<readonly Hero[]> {
    const params = new HttpParams()
      .set(QUERY_PARAMS.search, name)
      .set(QUERY_PARAMS.page, 0)
      .set(QUERY_PARAMS.size, HERO_SEARCH_MAX_RESULTS);

    return this.http
      .get<HeroPage<Hero>>(this.heroesUrl, { params })
      .pipe(map((page) => page.items));
  }
}
