import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { HERO_SEED } from '../../features/heroes/data/hero-seed.data';
import type { Hero, HeroDraft, HeroUpdate } from '../../features/heroes/models/hero.model';

@Injectable({ providedIn: 'root' })
export class HeroStoreService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private heroes: Hero[] = this.load();

  getAll(): readonly Hero[] {
    return this.heroes;
  }

  findById(id: string): Hero | undefined {
    return this.heroes.find((hero) => hero.id === id);
  }

  create(draft: HeroDraft): Hero {
    const hero: Hero = { ...draft, id: crypto.randomUUID() };
    this.heroes = [...this.heroes, hero];
    this.persist();
    return hero;
  }

  update(update: HeroUpdate): Hero | undefined {
    const index = this.heroes.findIndex((hero) => hero.id === update.id);
    if (index === -1) {
      return undefined;
    }

    const updated: Hero = { ...this.heroes[index], ...update };
    this.heroes = [...this.heroes.slice(0, index), updated, ...this.heroes.slice(index + 1)];
    this.persist();
    return updated;
  }

  remove(id: string): boolean {
    const initialLength = this.heroes.length;
    this.heroes = this.heroes.filter((hero) => hero.id !== id);
    const removed = this.heroes.length !== initialLength;
    if (removed) {
      this.persist();
    }
    return removed;
  }

  private load(): Hero[] {
    if (!this.isBrowser) {
      return [...HERO_SEED];
    }

    const raw = localStorage.getItem(STORAGE_KEYS.heroes);
    if (!raw) {
      return [...HERO_SEED];
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Hero[]) : [...HERO_SEED];
    } catch {
      return [...HERO_SEED];
    }
  }

  private persist(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.heroes, JSON.stringify(this.heroes));
  }
}
