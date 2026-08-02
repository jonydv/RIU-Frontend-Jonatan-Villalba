import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LayoutService } from './layout.service';
import { BREAKPOINT_QUERIES } from '../constants/layout.constants';

function setup(): { service: LayoutService; breakpointState$: Subject<BreakpointState> } {
  const breakpointState$ = new Subject<BreakpointState>();

  TestBed.configureTestingModule({
    providers: [
      {
        provide: BreakpointObserver,
        useValue: { observe: () => breakpointState$ },
      },
    ],
  });

  return { service: TestBed.inject(LayoutService), breakpointState$ };
}

describe('LayoutService', () => {
  it('should default isHandset to false before the browser resolves the query', () => {
    const { service } = setup();

    expect(service.isHandset()).toBe(false);
  });

  it('should reflect the handset breakpoint state once resolved', () => {
    const { service, breakpointState$ } = setup();

    breakpointState$.next({ matches: true, breakpoints: {} });
    expect(service.isHandset()).toBe(true);

    breakpointState$.next({ matches: false, breakpoints: {} });
    expect(service.isHandset()).toBe(false);
  });

  it('should observe the handset breakpoint query', () => {
    let observedQuery: string | readonly string[] | undefined;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: (query: string | readonly string[]) => {
              observedQuery = query;
              return new Subject<BreakpointState>();
            },
          },
        },
      ],
    });

    TestBed.inject(LayoutService);

    expect(observedQuery).toBe(BREAKPOINT_QUERIES.handset);
  });
});
