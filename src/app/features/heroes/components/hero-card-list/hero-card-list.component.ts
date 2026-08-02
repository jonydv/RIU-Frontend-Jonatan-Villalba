import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { routeToHeroDetail } from '../../../../core/constants/app-routes.constants';
import type { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-card-list',
  imports: [
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardAvatar,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatChipSet,
    MatChip,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './hero-card-list.component.html',
  styleUrl: './hero-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroCardListComponent {
  readonly heroes = input.required<readonly Hero[]>();
  readonly edit = output<Hero>();
  readonly delete = output<Hero>();

  protected readonly routeToHeroDetail = routeToHeroDetail;
}
