import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HeroEventsService } from '../../../shared/services/hero-events.service';
import { LayoutService } from '../../../core/services/layout.service';
import { HeroFormDialogComponent } from '../components/hero-form-dialog/hero-form-dialog.component';
import { DIALOG_SIZES } from '../../../core/constants/layout.constants';
import { DIALOG_ACTION } from '../../../shared/constants/dialog.constants';
import { HERO_EVENT_TYPE } from '../constants/hero-event.constants';
import { HERO_FORM_MODE } from '../constants/hero-form.constants';
import type { HeroDialogData, HeroDialogResult } from '../models/hero-form.model';
import type { Hero } from '../models/hero.model';

@Injectable({ providedIn: 'root' })
export class HeroFormFlowService {
  private readonly dialog = inject(MatDialog);
  private readonly heroEventsService = inject(HeroEventsService);
  private readonly layoutService = inject(LayoutService);
  private readonly snackBar = inject(MatSnackBar);

  openCreate(): Observable<boolean> {
    return this.open({ mode: HERO_FORM_MODE.create });
  }

  openEdit(hero: Hero): Observable<boolean> {
    return this.open({ mode: HERO_FORM_MODE.edit, hero });
  }

  private open(data: HeroDialogData): Observable<boolean> {
    const size = this.layoutService.isHandset() ? DIALOG_SIZES.handset : DIALOG_SIZES.form;

    const dialogRef = this.dialog.open<HeroFormDialogComponent, HeroDialogData, HeroDialogResult>(
      HeroFormDialogComponent,
      { ...size, data, autoFocus: 'first-tabbable' },
    );

    return dialogRef.afterClosed().pipe(
      map((result) => {
        if (result?.action !== DIALOG_ACTION.confirm) {
          return false;
        }

        const isCreate = data.mode === HERO_FORM_MODE.create;

        this.heroEventsService.emit(
          isCreate
            ? { type: HERO_EVENT_TYPE.created, hero: result.hero }
            : { type: HERO_EVENT_TYPE.updated, hero: result.hero },
        );

        this.snackBar.open(
          isCreate ? $localize`Héroe creado` : $localize`Héroe actualizado`,
          $localize`Cerrar`,
          { duration: 3000 },
        );

        return true;
      }),
    );
  }
}
