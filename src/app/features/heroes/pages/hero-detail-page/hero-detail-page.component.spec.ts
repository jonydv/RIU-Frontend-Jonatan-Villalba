import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, type ParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, of } from 'rxjs';
import { HeroDetailPageComponent } from './hero-detail-page.component';
import { HeroDeleteFlowService } from '../../services/hero-delete-flow.service';
import { HeroFormFlowService } from '../../services/hero-form-flow.service';
import { API_CONFIG, type ApiConfig } from '../../../../core/tokens/api-config.token';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import {
  ROUTE_PARAMS,
  routeToHeroList,
  routeToNotFound,
} from '../../../../core/constants/app-routes.constants';
import { HERO_PUBLISHERS } from '../../constants/hero.constants';
import type { Hero } from '../../models/hero.model';

const TEST_API_CONFIG: ApiConfig = { baseUrl: '/test-api', simulatedDelayMs: 0 };
const HEROES_URL = `${TEST_API_CONFIG.baseUrl}/${API_ENDPOINTS.heroes}`;

const HERO: Hero = {
  id: 'hero-1',
  name: 'SUPERMAN',
  alterEgo: 'Clark Kent',
  imageUrl: 'https://example.test/superman.jpg',
  publisher: HERO_PUBLISHERS.dc,
  powers: ['Vuelo', 'Superfuerza'],
  powerLevel: 99,
  firstAppearance: '1938-06-01',
  active: true,
};

interface Harness {
  fixture: ComponentFixture<HeroDetailPageComponent>;
  httpMock: HttpTestingController;
  navigateByUrl: ReturnType<typeof vi.fn>;
  confirmDelete: ReturnType<typeof vi.fn>;
  openEdit: ReturnType<typeof vi.fn>;
  paramMap$: BehaviorSubject<ParamMap>;
}

function setup(
  options: { heroId?: string | null; deleted?: boolean; saved?: boolean } = {},
): Harness {
  const paramMap$ = new BehaviorSubject<ParamMap>(
    convertToParamMap(
      options.heroId === null ? {} : { [ROUTE_PARAMS.id]: options.heroId ?? HERO.id },
    ),
  );
  const navigateByUrl = vi.fn().mockResolvedValue(true);
  const confirmDelete = vi.fn().mockReturnValue(of(options.deleted ?? false));
  const openEdit = vi.fn().mockReturnValue(of(options.saved ?? false));

  TestBed.configureTestingModule({
    imports: [HeroDetailPageComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: TEST_API_CONFIG },
      { provide: ActivatedRoute, useValue: { paramMap: paramMap$ } },
      { provide: Router, useValue: { navigateByUrl, createUrlTree: () => ({}), serializeUrl: () => '' } },
      { provide: HeroDeleteFlowService, useValue: { confirm: confirmDelete } },
      { provide: HeroFormFlowService, useValue: { openEdit } },
    ],
  });

  return {
    fixture: TestBed.createComponent(HeroDetailPageComponent),
    httpMock: TestBed.inject(HttpTestingController),
    navigateByUrl,
    confirmDelete,
    openEdit,
    paramMap$,
  };
}

function settle(harness: Harness, hero: Hero = HERO): void {
  harness.fixture.detectChanges();
  harness.httpMock.expectOne(`${HEROES_URL}/${hero.id}`).flush(hero);
  harness.fixture.detectChanges();
}

function buttonWithText(fixture: ComponentFixture<HeroDetailPageComponent>, text: string) {
  const buttons: HTMLButtonElement[] = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  );
  const button = buttons.find((candidate) => candidate.textContent?.includes(text));

  if (!button) {
    throw new Error(`Button "${text}" not found`);
  }

  return button;
}

describe('HeroDetailPageComponent', () => {
  it('should load the hero from the route param', () => {
    const harness = setup();

    settle(harness);

    const text: string = harness.fixture.nativeElement.textContent;
    expect(text).toContain('SUPERMAN');
    expect(text).toContain('Clark Kent');
    harness.httpMock.verify();
  });

  it('should render every power of the hero', () => {
    const harness = setup();

    settle(harness);

    expect(harness.fixture.nativeElement.querySelectorAll('mat-chip')).toHaveLength(
      HERO.powers.length,
    );
  });

  it('should redirect to not found when the hero does not exist', () => {
    const harness = setup({ heroId: 'missing-id' });

    harness.fixture.detectChanges();
    harness.httpMock
      .expectOne(`${HEROES_URL}/missing-id`)
      .flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(harness.navigateByUrl).toHaveBeenCalledWith(routeToNotFound());
  });

  it('should redirect to not found when the route has no id', () => {
    const harness = setup({ heroId: null });

    harness.fixture.detectChanges();

    expect(harness.navigateByUrl).toHaveBeenCalledWith(routeToNotFound());
    harness.httpMock.verify();
  });

  it('should reload the hero when the route param changes', () => {
    const harness = setup();
    settle(harness);

    const batman: Hero = { ...HERO, id: 'hero-2', name: 'BATMAN', alterEgo: 'Bruce Wayne' };
    harness.paramMap$.next(convertToParamMap({ [ROUTE_PARAMS.id]: batman.id }));
    settle(harness, batman);

    expect(harness.fixture.nativeElement.textContent).toContain('BATMAN');
  });

  it('should open the edit dialog with the loaded hero', () => {
    const harness = setup();
    settle(harness);

    buttonWithText(harness.fixture, 'Editar').click();

    expect(harness.openEdit).toHaveBeenCalledWith(HERO);
  });

  it('should reload the hero after a successful edit', () => {
    const harness = setup({ saved: true });
    settle(harness);

    buttonWithText(harness.fixture, 'Editar').click();

    settle(harness, { ...HERO, name: 'SUPERMAN PRIME' });
    expect(harness.fixture.nativeElement.textContent).toContain('SUPERMAN PRIME');
  });

  it('should ask for confirmation before deleting', () => {
    const harness = setup();
    settle(harness);

    buttonWithText(harness.fixture, 'Eliminar').click();

    expect(harness.confirmDelete).toHaveBeenCalledWith(HERO);
  });

  it('should navigate back to the list after a confirmed delete', () => {
    const harness = setup({ deleted: true });
    settle(harness);

    buttonWithText(harness.fixture, 'Eliminar').click();

    expect(harness.navigateByUrl).toHaveBeenCalledWith(routeToHeroList());
  });

  it('should stay on the page when the delete is cancelled', () => {
    const harness = setup({ deleted: false });
    settle(harness);

    buttonWithText(harness.fixture, 'Eliminar').click();

    expect(harness.navigateByUrl).not.toHaveBeenCalled();
  });
});
