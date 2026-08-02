import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  imports: [MatProgressBar],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  protected readonly loadingService = inject(LoadingService);
}
