import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hero-detail-page',
  imports: [],
  templateUrl: './hero-detail-page.component.html',
  styleUrl: './hero-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroDetailPageComponent {}
