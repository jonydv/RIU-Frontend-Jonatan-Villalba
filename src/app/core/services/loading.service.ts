import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pendingCount = signal(0);

  readonly isLoading = computed(() => this.pendingCount() > 0);

  increment(): void {
    this.pendingCount.update((count) => count + 1);
  }

  decrement(): void {
    this.pendingCount.update((count) => count - 1);
  }
}
