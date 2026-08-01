import { HERO_FIELDS } from './hero.constants';

export const PAGE_SIZE_OPTIONS = [5, 10, 25] as const;

export const DEFAULT_PAGE = {
  pageIndex: 0,
  pageSize: 10,
} as const;

export const SEARCH_DEBOUNCE_MS = 300;

export const HERO_ACTIONS_COLUMN = 'actions';

export const HERO_TABLE_COLUMNS = [
  HERO_FIELDS.name,
  HERO_FIELDS.alterEgo,
  HERO_FIELDS.publisher,
  HERO_FIELDS.powerLevel,
  HERO_FIELDS.active,
  HERO_ACTIONS_COLUMN,
] as const;

export type HeroTableColumn = (typeof HERO_TABLE_COLUMNS)[number];
