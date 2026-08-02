import type { HERO_EVENT_TYPE } from '../constants/hero-event.constants';
import type { Hero } from './hero.model';

export type HeroEvent =
  | { readonly type: typeof HERO_EVENT_TYPE.created; readonly hero: Hero }
  | { readonly type: typeof HERO_EVENT_TYPE.updated; readonly hero: Hero }
  | { readonly type: typeof HERO_EVENT_TYPE.deleted; readonly heroId: string };
