export const HERO_EVENT_TYPE = {
  created: 'HERO_CREATED',
  updated: 'HERO_UPDATED',
  deleted: 'HERO_DELETED',
} as const;

export type HeroEventType = (typeof HERO_EVENT_TYPE)[keyof typeof HERO_EVENT_TYPE];
