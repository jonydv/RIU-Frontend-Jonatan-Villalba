import type { HERO_FIELDS, HeroPublisher } from '../constants/hero.constants';

export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly alterEgo: string | null;
  readonly publisher: HeroPublisher;
  readonly powers: readonly string[];
  readonly powerLevel: number;
  readonly firstAppearance: string;
  readonly active: boolean;
}

export type HeroField = keyof Hero;

export type HeroDraft = Omit<Hero, typeof HERO_FIELDS.id>;

export type HeroUpdate = Partial<HeroDraft> & Pick<Hero, typeof HERO_FIELDS.id>;
