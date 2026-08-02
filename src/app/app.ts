import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
import { ROUTE_PATHS } from './core/constants/app-routes.constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbar, LoadingOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly heroesPath = `/${ROUTE_PATHS.heroes}`;
}
