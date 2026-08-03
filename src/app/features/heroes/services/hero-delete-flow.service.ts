import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HeroService } from '../data/hero.service';
import { HeroEventsService } from '../../../shared/services/hero-events.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DIALOG_SIZES } from '../../../core/constants/layout.constants';
import { DIALOG_ACTION } from '../../../shared/constants/dialog.constants';
import { HERO_EVENT_TYPE } from '../constants/hero-event.constants';
import type { ConfirmDialogData, ConfirmDialogResult } from '../../../shared/models/confirm-dialog.model';
import type { Hero } from '../models/hero.model';

@Injectable({ providedIn: 'root' })
export class HeroDeleteFlowService {
  private readonly dialog = inject(MatDialog);
  private readonly heroService = inject(HeroService);
  private readonly heroEventsService = inject(HeroEventsService);
  private readonly snackBar = inject(MatSnackBar);

  confirm(hero: Hero): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: $localize`Eliminar héroe`,
      message: $localize`¿Seguro que querés eliminar a ${hero.name}? Esta acción no se puede deshacer.`,
      confirmLabel: $localize`Eliminar`,
      cancelLabel: $localize`Cancelar`,
    };

    const dialogRef = this.dialog.open<
      ConfirmDialogComponent,
      ConfirmDialogData,
      ConfirmDialogResult
    >(ConfirmDialogComponent, { ...DIALOG_SIZES.confirm, data });

    return dialogRef.afterClosed().pipe(
      switchMap((result) => {
        if (result !== DIALOG_ACTION.confirm) {
          return of(false);
        }

        return this.heroService.deleteHero(hero.id).pipe(
          tap(() => {
            this.heroEventsService.emit({ type: HERO_EVENT_TYPE.deleted, heroId: hero.id });
            this.snackBar.open($localize`Héroe eliminado`, $localize`Cerrar`, { duration: 3000 });
          }),
          map(() => true),
        );
      }),
    );
  }
}
