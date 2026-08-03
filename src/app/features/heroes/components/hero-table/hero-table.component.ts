import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { HERO_ACTIONS_COLUMN, HERO_TABLE_COLUMNS } from '../../constants/hero-list.constants';
import { HERO_FIELDS } from '../../constants/hero.constants';
import { routeToHeroDetail } from '../../../../core/constants/app-routes.constants';
import type { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-table',
  imports: [
    RouterLink,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './hero-table.component.html',
  styleUrl: './hero-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroTableComponent {
  readonly heroes = input.required<readonly Hero[]>();
  readonly edit = output<Hero>();
  readonly delete = output<Hero>();

  protected readonly displayedColumns = HERO_TABLE_COLUMNS;
  protected readonly actionsColumn = HERO_ACTIONS_COLUMN;
  protected readonly heroFields = HERO_FIELDS;
  protected readonly routeToHeroDetail = routeToHeroDetail;

  protected editLabel(hero: Hero): string {
    return $localize`Editar ${hero.name}`;
  }

  protected deleteLabel(hero: Hero): string {
    return $localize`Eliminar ${hero.name}`;
  }
}
