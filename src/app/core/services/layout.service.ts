import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { BREAKPOINT_QUERIES } from '../constants/layout.constants';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isHandset = toSignal(
    this.breakpointObserver
      .observe(BREAKPOINT_QUERIES.handset)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
}
