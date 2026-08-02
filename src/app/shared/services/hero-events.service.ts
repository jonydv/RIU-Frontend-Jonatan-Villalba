import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { HeroEvent } from '../../features/heroes/models/hero-event.model';

@Injectable({ providedIn: 'root' })
export class HeroEventsService {
  private readonly events = new Subject<HeroEvent>();

  readonly events$ = this.events.asObservable();

  emit(event: HeroEvent): void {
    this.events.next(event);
  }
}
