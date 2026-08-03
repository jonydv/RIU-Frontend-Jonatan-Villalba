export const HERO_FORM_MODE = {
  create: 'create',
  edit: 'edit',
} as const;

export type HeroFormMode = (typeof HERO_FORM_MODE)[keyof typeof HERO_FORM_MODE];

export const HERO_FORM_LIMITS = {
  nameMinLength: 3,
  nameMaxLength: 50,
  alterEgoMaxLength: 60,
  minPowerLevel: 1,
  maxPowerLevel: 100,
} as const;
