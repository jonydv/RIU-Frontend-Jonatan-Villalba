import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { VALIDATION_ERROR_KEYS } from '../../../shared/constants/validation.constants';
import { SEARCH_DEBOUNCE_MS } from '../constants/hero-list.constants';
import type { HeroService } from '../data/hero.service';

export function uniqueHeroNameValidator(
  heroService: HeroService,
  currentHeroId: string | null,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = (control.value as string | null)?.trim() ?? '';

    if (!name) {
      return of(null);
    }

    return timer(SEARCH_DEBOUNCE_MS).pipe(
      switchMap(() => heroService.searchByName(name)),
      map((heroes) => {
        const taken = heroes.some(
          (hero) => hero.id !== currentHeroId && hero.name.toUpperCase() === name.toUpperCase(),
        );

        return taken ? { [VALIDATION_ERROR_KEYS.duplicatedName]: true } : null;
      }),
    );
  };
}
