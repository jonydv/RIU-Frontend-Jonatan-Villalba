import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HeroStoreService } from './hero-store.service';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { HERO_SEED } from '../../features/heroes/data/hero-seed.data';
import { HERO_PUBLISHERS } from '../../features/heroes/constants/hero.constants';
import type { Hero, HeroDraft } from '../../features/heroes/models/hero.model';

function createStore(platform: 'browser' | 'server' = 'browser'): HeroStoreService {
  TestBed.configureTestingModule({
    providers: [{ provide: PLATFORM_ID, useValue: platform }],
  });

  return TestBed.inject(HeroStoreService);
}

describe('HeroStoreService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should seed from HERO_SEED on the server platform, ignoring storage', () => {
    localStorage.setItem(STORAGE_KEYS.heroes, JSON.stringify([]));

    const store = createStore('server');

    expect(store.getAll()).toEqual(HERO_SEED);
  });

  it('should seed from HERO_SEED on the browser when nothing is persisted', () => {
    const store = createStore('browser');

    expect(store.getAll()).toEqual(HERO_SEED);
  });

  it('should hydrate from localStorage on the browser platform', () => {
    const persisted: Hero[] = [HERO_SEED[0]];
    localStorage.setItem(STORAGE_KEYS.heroes, JSON.stringify(persisted));

    const store = createStore('browser');

    expect(store.getAll()).toEqual(persisted);
  });

  it('should fall back to the seed when the persisted data is corrupted json', () => {
    localStorage.setItem(STORAGE_KEYS.heroes, '{not-json');

    const store = createStore('browser');

    expect(store.getAll()).toEqual(HERO_SEED);
  });

  it('should fall back to the seed when the persisted data is not an array', () => {
    localStorage.setItem(STORAGE_KEYS.heroes, JSON.stringify({ not: 'an array' }));

    const store = createStore('browser');

    expect(store.getAll()).toEqual(HERO_SEED);
  });

  describe('crud', () => {
    const draft: HeroDraft = {
      name: 'TEST HERO',
      alterEgo: 'Test Alter Ego',
      imageUrl: null,
      publisher: HERO_PUBLISHERS.other,
      powers: ['Test Power'],
      powerLevel: 50,
      firstAppearance: '2024-01-01',
      active: true,
    };

    it('should create a hero, assign an id and persist it', () => {
      const store = createStore('browser');

      const created = store.create(draft);

      expect(created.id).toBeTruthy();
      expect(store.findById(created.id)).toEqual(created);
      const persisted: Hero[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.heroes) ?? '[]');
      expect(persisted).toContainEqual(created);
    });

    it('should update an existing hero and persist the change', () => {
      const store = createStore('browser');
      const created = store.create(draft);

      const updated = store.update({ id: created.id, name: 'UPDATED HERO' });

      expect(updated?.name).toBe('UPDATED HERO');
      expect(store.findById(created.id)?.name).toBe('UPDATED HERO');
    });

    it('should return undefined when updating an unknown id', () => {
      const store = createStore('browser');

      expect(store.update({ id: 'missing-id', name: 'X' })).toBeUndefined();
    });

    it('should remove an existing hero and persist the change', () => {
      const store = createStore('browser');
      const created = store.create(draft);

      const removed = store.remove(created.id);

      expect(removed).toBe(true);
      expect(store.findById(created.id)).toBeUndefined();
      const persisted: Hero[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.heroes) ?? '[]');
      expect(persisted).not.toContainEqual(created);
    });

    it('should return false when removing an unknown id', () => {
      const store = createStore('browser');

      expect(store.remove('missing-id')).toBe(false);
    });
  });
});
