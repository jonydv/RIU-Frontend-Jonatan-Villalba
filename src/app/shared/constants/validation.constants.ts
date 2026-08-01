export const VALIDATION_ERROR_KEYS = {
  required: 'required',
  minlength: 'minlength',
  maxlength: 'maxlength',
  min: 'min',
  max: 'max',
  duplicatedName: 'duplicatedName',
  futureDate: 'futureDate',
} as const;

export type ValidationErrorKey =
  (typeof VALIDATION_ERROR_KEYS)[keyof typeof VALIDATION_ERROR_KEYS];
