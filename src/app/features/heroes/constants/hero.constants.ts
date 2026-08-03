import type { HeroField } from '../models/hero.model';

export const HERO_FIELDS = {
  id: 'id',
  name: 'name',
  alterEgo: 'alterEgo',
  imageUrl: 'imageUrl',
  publisher: 'publisher',
  powers: 'powers',
  powerLevel: 'powerLevel',
  firstAppearance: 'firstAppearance',
  active: 'active',
} as const satisfies Record<HeroField, HeroField>;

export const HERO_PUBLISHERS = {
  dc: 'DC Comics',
  marvel: 'Marvel Comics',
  other: 'Otros',
} as const;

export type HeroPublisher = (typeof HERO_PUBLISHERS)[keyof typeof HERO_PUBLISHERS];

export const HERO_PUBLISHER_VALUES: readonly HeroPublisher[] = Object.values(HERO_PUBLISHERS);

export const HERO_SEARCH_MAX_RESULTS = 50;
