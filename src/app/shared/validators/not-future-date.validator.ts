import { AbstractControl, ValidationErrors } from '@angular/forms';
import { VALIDATION_ERROR_KEYS } from '../constants/validation.constants';

export function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;

  if (!value) {
    return null;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return new Date(value) > today ? { [VALIDATION_ERROR_KEYS.futureDate]: true } : null;
}
