import type { DIALOG_ACTION } from '../../../shared/constants/dialog.constants';
import type { HERO_FORM_MODE } from '../constants/hero-form.constants';
import type { Hero } from './hero.model';

export type HeroDialogData =
  | { readonly mode: typeof HERO_FORM_MODE.create }
  | { readonly mode: typeof HERO_FORM_MODE.edit; readonly hero: Hero };

export type HeroDialogResult =
  | { readonly action: typeof DIALOG_ACTION.cancel }
  | { readonly action: typeof DIALOG_ACTION.confirm; readonly hero: Hero };
