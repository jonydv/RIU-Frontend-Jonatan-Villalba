import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { routeToHeroList } from '../../../../core/constants/app-routes.constants';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, MatButton, MatIcon],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {
  protected readonly routeToHeroList = routeToHeroList();
}
