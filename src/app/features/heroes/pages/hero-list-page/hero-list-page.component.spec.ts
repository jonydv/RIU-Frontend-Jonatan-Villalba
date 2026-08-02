import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { Subject, of } from 'rxjs';
import { HeroListPageComponent } from './hero-list-page.component';
import { HeroDeleteFlowService } from '../../services/hero-delete-flow.service';
import { HeroFormFlowService } from '../../services/hero-form-flow.service';
import { API_CONFIG, type ApiConfig } from '../../../../core/tokens/api-config.token';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { HERO_PUBLISHERS } from '../../constants/hero.constants';
import { DEFAULT_PAGE, SEARCH_DEBOUNCE_MS } from '../../constants/hero-list.constants';
import type { Hero } from '../../models/hero.model';
import type { HeroPage } from '../../models/hero-page.model';

const TEST_API_CONFIG: ApiConfig = { baseUrl: '/test-api', simulatedDelayMs: 0 };
const HEROES_URL = `${TEST_API_CONFIG.baseUrl}/${API_ENDPOINTS.heroes}`;

const HERO: Hero = {
  id: 'hero-1',
  name: 'SUPERMAN',
  alterEgo: 'Clark Kent',
  imageUrl: null,
  publisher: HERO_PUBLISHERS.dc,
  powers: ['Vuelo'],
  powerLevel: 99,
  firstAppearance: '1938-06-01',
  active: true,
};

function page(items: readonly Hero[], total = items.length): HeroPage<Hero> {
  return { items, total, page: DEFAULT_PAGE.pageIndex, size: DEFAULT_PAGE.pageSize };
}

interface Harness {
  fixture: ComponentFixture<HeroListPageComponent>;
  httpMock: HttpTestingController;
  confirmDelete: ReturnType<typeof vi.fn>;
  openCreate: ReturnType<typeof vi.fn>;
  openEdit: ReturnType<typeof vi.fn>;
}

function setup(options: { deleted?: boolean; saved?: boolean } = {}): Harness {
  const confirmDelete = vi.fn().mockReturnValue(of(options.deleted ?? false));
  const openCreate = vi.fn().mockReturnValue(of(options.saved ?? false));
  const openEdit = vi.fn().mockReturnValue(of(options.saved ?? false));

  TestBed.configureTestingModule({
    imports: [HeroListPageComponent],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: TEST_API_CONFIG },
      { provide: BreakpointObserver, useValue: { observe: () => new Subject<BreakpointState>() } },
      { provide: HeroDeleteFlowService, useValue: { confirm: confirmDelete } },
      { provide: HeroFormFlowService, useValue: { openCreate, openEdit } },
    ],
  });

  const fixture = TestBed.createComponent(HeroListPageComponent);

  return {
    fixture,
    httpMock: TestBed.inject(HttpTestingController),
    confirmDelete,
    openCreate,
    openEdit,
  };
}

function settle(harness: Harness, response: HeroPage<Hero> = page([HERO])): void {
  harness.fixture.detectChanges();
  vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  harness.httpMock.expectOne((request) => request.url === HEROES_URL).flush(response);
  harness.fixture.detectChanges();
}

function buttonWithText(fixture: ComponentFixture<HeroListPageComponent>, text: string) {
  const buttons: HTMLButtonElement[] = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  );
  const button = buttons.find((candidate) => candidate.textContent?.includes(text));

  if (!button) {
    throw new Error(`Button "${text}" not found`);
  }

  return button;
}

describe('HeroListPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the fetched heroes as cards by default', () => {
    const harness = setup();

    settle(harness);

    expect(harness.fixture.nativeElement.querySelectorAll('.hero-card')).toHaveLength(1);
    expect(harness.fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should show the total number of heroes', () => {
    const harness = setup();

    settle(harness, page([HERO], 25));

    expect(harness.fixture.nativeElement.textContent).toContain('25');
  });

  it('should show the empty state when nothing matches', () => {
    const harness = setup();

    settle(harness, page([]));

    expect(harness.fixture.nativeElement.querySelector('.hero-list-page__empty')).not.toBeNull();
    expect(harness.fixture.nativeElement.querySelector('.hero-card')).toBeNull();
  });

  it('should open the create dialog', () => {
    const harness = setup();
    settle(harness);

    buttonWithText(harness.fixture, 'Nuevo héroe').click();

    expect(harness.openCreate).toHaveBeenCalled();
  });

  it('should refetch after a hero is created', () => {
    const harness = setup({ saved: true });
    settle(harness);

    buttonWithText(harness.fixture, 'Nuevo héroe').click();

    settle(harness);
    harness.httpMock.verify();
  });

  it('should not refetch when the create dialog is dismissed', () => {
    const harness = setup({ saved: false });
    settle(harness);

    buttonWithText(harness.fixture, 'Nuevo héroe').click();
    harness.fixture.detectChanges();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    harness.httpMock.expectNone((request) => request.url === HEROES_URL);
  });

  it('should open the edit dialog with the picked hero', () => {
    const harness = setup();
    settle(harness);

    harness.fixture.nativeElement.querySelectorAll('.hero-card__actions button')[0].click();

    expect(harness.openEdit).toHaveBeenCalledWith(HERO);
  });

  it('should ask for confirmation before deleting', () => {
    const harness = setup();
    settle(harness);

    harness.fixture.nativeElement.querySelectorAll('.hero-card__actions button')[1].click();

    expect(harness.confirmDelete).toHaveBeenCalledWith(HERO);
  });

  it('should refetch after a confirmed delete', () => {
    const harness = setup({ deleted: true });
    settle(harness);

    harness.fixture.nativeElement.querySelectorAll('.hero-card__actions button')[1].click();

    settle(harness, page([]));
    harness.httpMock.verify();
  });

  it('should not refetch when the delete is cancelled', () => {
    const harness = setup({ deleted: false });
    settle(harness);

    harness.fixture.nativeElement.querySelectorAll('.hero-card__actions button')[1].click();
    harness.fixture.detectChanges();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    harness.httpMock.expectNone((request) => request.url === HEROES_URL);
  });
});
