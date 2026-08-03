import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type FormControl,
} from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatError, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatChipGrid,
  MatChipInput,
  MatChipRemove,
  MatChipRow,
  type MatChipInputEvent,
} from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HeroService } from '../../data/hero.service';
import { UppercaseDirective } from '../../../../shared/directives/uppercase.directive';
import { uniqueHeroNameValidator } from '../../validators/unique-hero-name.validator';
import { notFutureDateValidator } from '../../../../shared/validators/not-future-date.validator';
import { HERO_FORM_LIMITS, HERO_FORM_MODE } from '../../constants/hero-form.constants';
import { HERO_PUBLISHER_VALUES } from '../../constants/hero.constants';
import { VALIDATION_ERROR_KEYS } from '../../../../shared/constants/validation.constants';
import { DIALOG_ACTION } from '../../../../shared/constants/dialog.constants';
import type { HeroDialogData, HeroDialogResult } from '../../models/hero-form.model';
import type { Hero, HeroDraft } from '../../models/hero.model';

@Component({
  selector: 'app-hero-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatSlider,
    MatSliderThumb,
    MatSlideToggle,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    MatButton,
    MatIcon,
    UppercaseDirective,
  ],
  templateUrl: './hero-form-dialog.component.html',
  styleUrl: './hero-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFormDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly heroService = inject(HeroService);
  private readonly dialogRef =
    inject<MatDialogRef<HeroFormDialogComponent, HeroDialogResult>>(MatDialogRef);

  protected readonly data = inject<HeroDialogData>(MAT_DIALOG_DATA);

  protected readonly formModes = HERO_FORM_MODE;
  protected readonly limits = HERO_FORM_LIMITS;
  protected readonly publishers = HERO_PUBLISHER_VALUES;
  protected readonly errorKeys = VALIDATION_ERROR_KEYS;
  protected readonly separatorKeyCodes = [ENTER, COMMA];
  protected readonly saving = signal(false);

  private readonly editedHero = this.data.mode === HERO_FORM_MODE.edit ? this.data.hero : null;

  protected readonly form = this.formBuilder.nonNullable.group({
    name: [
      this.editedHero?.name ?? '',
      [
        Validators.required,
        Validators.minLength(HERO_FORM_LIMITS.nameMinLength),
        Validators.maxLength(HERO_FORM_LIMITS.nameMaxLength),
      ],
      [uniqueHeroNameValidator(this.heroService, this.editedHero?.id ?? null)],
    ],
    alterEgo: [
      this.editedHero?.alterEgo ?? '',
      [Validators.maxLength(HERO_FORM_LIMITS.alterEgoMaxLength)],
    ],
    imageUrl: [this.editedHero?.imageUrl ?? ''],
    publisher: [this.editedHero?.publisher ?? this.publishers[0], [Validators.required]],
    powers: [[...(this.editedHero?.powers ?? [])], [Validators.required]],
    powerLevel: [
      this.editedHero?.powerLevel ?? HERO_FORM_LIMITS.minPowerLevel,
      [
        Validators.required,
        Validators.min(HERO_FORM_LIMITS.minPowerLevel),
        Validators.max(HERO_FORM_LIMITS.maxPowerLevel),
      ],
    ],
    firstAppearance: [
      this.editedHero?.firstAppearance ?? '',
      [Validators.required, notFutureDateValidator],
    ],
    active: [this.editedHero?.active ?? true],
  });

  protected get powersControl(): FormControl<string[]> {
    return this.form.controls.powers;
  }

  protected addPower(event: MatChipInputEvent): void {
    const power = event.value.trim();

    if (power && !this.powersControl.value.includes(power)) {
      this.powersControl.setValue([...this.powersControl.value, power]);
      this.powersControl.markAsDirty();
    }

    event.chipInput.clear();
  }

  protected removePower(power: string): void {
    this.powersControl.setValue(this.powersControl.value.filter((item) => item !== power));
    this.powersControl.markAsDirty();
  }

  protected cancel(): void {
    this.dialogRef.close({ action: DIALOG_ACTION.cancel });
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const draft: HeroDraft = {
      name: value.name.trim(),
      alterEgo: value.alterEgo.trim() || null,
      imageUrl: value.imageUrl.trim() || null,
      publisher: value.publisher,
      powers: value.powers,
      powerLevel: value.powerLevel,
      firstAppearance: value.firstAppearance,
      active: value.active,
    };

    this.saving.set(true);

    const request$ = this.editedHero
      ? this.heroService.updateHero({ ...draft, id: this.editedHero.id })
      : this.heroService.createHero(draft);

    request$.subscribe({
      next: (hero: Hero) => this.dialogRef.close({ action: DIALOG_ACTION.confirm, hero }),
      error: () => this.saving.set(false),
    });
  }
}
