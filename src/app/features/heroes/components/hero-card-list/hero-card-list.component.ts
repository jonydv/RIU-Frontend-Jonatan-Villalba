import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { routeToHeroDetail } from '../../../../core/constants/app-routes.constants';
import type { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-card-list',
  imports: [RouterLink, MatIconButton, MatIcon],
  templateUrl: './hero-card-list.component.html',
  styleUrl: './hero-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardListComponent {
  readonly heroes = input.required<readonly Hero[]>();
  readonly edit = output<Hero>();
  readonly delete = output<Hero>();

  protected readonly routeToHeroDetail = routeToHeroDetail;

  protected editLabel(hero: Hero): string {
    return $localize`Editar ${hero.name}`;
  }

  protected deleteLabel(hero: Hero): string {
    return $localize`Eliminar ${hero.name}`;
  }

  protected powerLabel(hero: Hero): string {
    return $localize`Nivel de poder ${hero.powerLevel} de 100`;
  }
}
