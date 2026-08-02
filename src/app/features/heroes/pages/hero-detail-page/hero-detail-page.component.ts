import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HeroService } from '../../data/hero.service';
import { HeroDeleteFlowService } from '../../services/hero-delete-flow.service';
import { HeroFormFlowService } from '../../services/hero-form-flow.service';
import {
  ROUTE_PARAMS,
  routeToHeroList,
  routeToNotFound,
} from '../../../../core/constants/app-routes.constants';
import type { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-detail-page',
  imports: [RouterLink, MatChipSet, MatChip, MatProgressBar, MatButton, MatIcon],
  templateUrl: './hero-detail-page.component.html',
  styleUrl: './hero-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly heroService = inject(HeroService);
  private readonly heroDeleteFlow = inject(HeroDeleteFlowService);
  private readonly heroFormFlow = inject(HeroFormFlowService);

  private readonly refreshTrigger = signal(0);

  protected readonly routeToHeroList = routeToHeroList();

  protected readonly hero = toSignal(
    combineLatest([this.route.paramMap, toObservable(this.refreshTrigger)]).pipe(
      switchMap(([params]) => {
        const id = params.get(ROUTE_PARAMS.id);

        if (!id) {
          void this.router.navigateByUrl(routeToNotFound());
          return of(null);
        }

        return this.heroService.getHeroById(id).pipe(
          catchError(() => {
            void this.router.navigateByUrl(routeToNotFound());
            return of(null);
          }),
        );
      }),
    ),
    { initialValue: null },
  );

  protected onEdit(hero: Hero): void {
    this.heroFormFlow.openEdit(hero).subscribe((saved) => {
      if (saved) {
        this.refreshTrigger.update((count) => count + 1);
      }
    });
  }

  protected editLabel(hero: Hero): string {
    return $localize`Editar ${hero.name}`;
  }

  protected deleteLabel(hero: Hero): string {
    return $localize`Eliminar ${hero.name}`;
  }

  protected onDelete(hero: Hero): void {
    this.heroDeleteFlow.confirm(hero).subscribe((deleted) => {
      if (deleted) {
        void this.router.navigateByUrl(routeToHeroList());
      }
    });
  }
}
