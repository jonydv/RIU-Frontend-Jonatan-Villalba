import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeroSearchFieldComponent } from '../../components/hero-search-field/hero-search-field.component';
import { HeroViewModeToggleComponent } from '../../components/hero-view-mode-toggle/hero-view-mode-toggle.component';
import { HeroCardListComponent } from '../../components/hero-card-list/hero-card-list.component';
import { HeroTableComponent } from '../../components/hero-table/hero-table.component';
import { HeroListStoreService } from '../../stores/hero-list-store.service';
import { HeroService } from '../../data/hero.service';
import { LayoutService } from '../../../../core/services/layout.service';
import { HeroEventsService } from '../../../../shared/services/hero-events.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DIALOG_SIZES } from '../../../../core/constants/layout.constants';
import { DIALOG_ACTION } from '../../../../shared/constants/dialog.constants';
import { HERO_EVENT_TYPE } from '../../constants/hero-event.constants';
import { HERO_VIEW_MODE, PAGE_SIZE_OPTIONS } from '../../constants/hero-list.constants';
import type { ConfirmDialogData, ConfirmDialogResult } from '../../../../shared/models/confirm-dialog.model';
import type { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-list-page',
  imports: [
    HeroSearchFieldComponent,
    HeroViewModeToggleComponent,
    HeroCardListComponent,
    HeroTableComponent,
    MatPaginator,
  ],
  providers: [HeroListStoreService],
  templateUrl: './hero-list-page.component.html',
  styleUrl: './hero-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroListPageComponent {
  protected readonly store = inject(HeroListStoreService);
  private readonly layoutService = inject(LayoutService);
  private readonly heroService = inject(HeroService);
  private readonly heroEventsService = inject(HeroEventsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly viewModes = HERO_VIEW_MODE;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly isHandset = this.layoutService.isHandset;

  protected onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.store.pageSize()) {
      this.store.setPageSize(event.pageSize);
      return;
    }

    this.store.setPageIndex(event.pageIndex);
  }

  protected onDelete(hero: Hero): void {
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== DIALOG_ACTION.confirm) {
        return;
      }

      this.heroService.deleteHero(hero.id).subscribe(() => {
        this.heroEventsService.emit({ type: HERO_EVENT_TYPE.deleted, heroId: hero.id });
        this.store.refresh();
        this.snackBar.open($localize`Héroe eliminado`, $localize`Cerrar`, { duration: 3000 });
      });
    });
  }
}
