import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { HERO_VIEW_MODE } from '../../constants/hero-list.constants';
import type { HeroViewMode } from '../../constants/hero-list.constants';

@Component({
  selector: 'app-hero-view-mode-toggle',
  imports: [MatButtonToggleGroup, MatButtonToggle, MatIcon],
  templateUrl: './hero-view-mode-toggle.component.html',
  styleUrl: './hero-view-mode-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroViewModeToggleComponent {
  readonly viewMode = input.required<HeroViewMode>();
  readonly viewModeChange = output<HeroViewMode>();

  protected readonly viewModes = HERO_VIEW_MODE;

  protected onChange(event: MatButtonToggleChange): void {
    this.viewModeChange.emit(event.value as HeroViewMode);
  }
}
