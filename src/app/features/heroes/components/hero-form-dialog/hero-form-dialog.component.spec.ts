import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HeroFormDialogComponent } from './hero-form-dialog.component';
import { API_CONFIG, type ApiConfig } from '../../../../core/tokens/api-config.token';
import { API_ENDPOINTS, HTTP_METHODS } from '../../../../core/constants/api.constants';
import { DIALOG_ACTION } from '../../../../shared/constants/dialog.constants';
import { VALIDATION_ERROR_KEYS } from '../../../../shared/constants/validation.constants';
import { HERO_FORM_MODE } from '../../constants/hero-form.constants';
import { HERO_PUBLISHERS } from '../../constants/hero.constants';
import { SEARCH_DEBOUNCE_MS } from '../../constants/hero-list.constants';
import type { HeroDialogData } from '../../models/hero-form.model';
import type { Hero } from '../../models/hero.model';
import type { HeroPage } from '../../models/hero-page.model';

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
  fixture: ComponentFixture<HeroFormDialogComponent>;
  httpMock: HttpTestingController;
  close: ReturnType<typeof vi.fn>;
  form: HeroFormDialogComponent['form'];
}

function setup(data: HeroDialogData = { mode: HERO_FORM_MODE.create }): Harness {
  const close = vi.fn();

  TestBed.configureTestingModule({
    imports: [HeroFormDialogComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: TEST_API_CONFIG },
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close } },
    ],
  });

  const fixture = TestBed.createComponent(HeroFormDialogComponent);
  fixture.detectChanges();

  return {
    fixture,
    httpMock: TestBed.inject(HttpTestingController),
    close,
    form: (fixture.componentInstance as unknown as { form: HeroFormDialogComponent['form'] }).form,
  };
}

function emptyPage(): HeroPage<Hero> {
  return { items: [], total: 0, page: 0, size: 50 };
}

function resolveNameCheck(harness: Harness, matches: readonly Hero[] = []): void {
  vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  const request = harness.httpMock.expectOne(
    (candidate) => candidate.url === HEROES_URL && candidate.method === HTTP_METHODS.get,
  );
  request.flush({ ...emptyPage(), items: matches, total: matches.length });
  harness.fixture.detectChanges();
}

function fillValidForm(harness: Harness): void {
  harness.form.patchValue({
    name: 'NIGHTWING',
    alterEgo: 'Dick Grayson',
    imageUrl: '',
    publisher: HERO_PUBLISHERS.dc,
    powers: ['Acrobacia'],
    powerLevel: 70,
    firstAppearance: '1984-10-01',
    active: true,
  });
  resolveNameCheck(harness);
}

describe('HeroFormDialogComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create mode', () => {
    it('should start invalid with an empty form', () => {
      const harness = setup();

      expect(harness.form.invalid).toBe(true);
      harness.httpMock.verify();
    });

    it('should require a name', () => {
      const harness = setup();

      expect(harness.form.controls.name.hasError(VALIDATION_ERROR_KEYS.required)).toBe(true);
    });

    it('should reject a name shorter than the minimum length', () => {
      const harness = setup();

      harness.form.controls.name.setValue('AB');

      expect(harness.form.controls.name.hasError(VALIDATION_ERROR_KEYS.minlength)).toBe(true);
    });

    it('should require at least one power', () => {
      const harness = setup();

      expect(harness.form.controls.powers.hasError(VALIDATION_ERROR_KEYS.required)).toBe(true);
    });

    it('should reject a future first appearance date', () => {
      const harness = setup();
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      harness.form.controls.firstAppearance.setValue(nextYear.toISOString().slice(0, 10));

      expect(harness.form.controls.firstAppearance.hasError(VALIDATION_ERROR_KEYS.futureDate)).toBe(
        true,
      );
    });

    it('should reject a name that already exists', () => {
      const harness = setup();

      harness.form.controls.name.setValue('SUPERMAN');
      resolveNameCheck(harness, [HERO]);

      expect(harness.form.controls.name.hasError(VALIDATION_ERROR_KEYS.duplicatedName)).toBe(true);
    });

    it('should accept a name that is not taken', () => {
      const harness = setup();

      harness.form.controls.name.setValue('NIGHTWING');
      resolveNameCheck(harness);

      expect(harness.form.controls.name.valid).toBe(true);
    });

    it('should not submit while the form is invalid', () => {
      const harness = setup();

      harness.fixture.componentInstance['submit']();

      harness.httpMock.expectNone((request) => request.method === HTTP_METHODS.post);
      expect(harness.close).not.toHaveBeenCalled();
    });

    it('should post the hero and close with the created one', () => {
      const harness = setup();
      fillValidForm(harness);

      harness.fixture.componentInstance['submit']();

      const request = harness.httpMock.expectOne(
        (candidate) => candidate.url === HEROES_URL && candidate.method === HTTP_METHODS.post,
      );
      expect(request.request.body).toMatchObject({ name: 'NIGHTWING', powerLevel: 70 });

      const created: Hero = { ...HERO, id: 'hero-99', name: 'NIGHTWING' };
      request.flush(created);

      expect(harness.close).toHaveBeenCalledWith({
        action: DIALOG_ACTION.confirm,
        hero: created,
      });
    });

    it('should send null instead of empty optional fields', () => {
      const harness = setup();
      fillValidForm(harness);
      harness.form.controls.alterEgo.setValue('');

      harness.fixture.componentInstance['submit']();

      const request = harness.httpMock.expectOne(
        (candidate) => candidate.method === HTTP_METHODS.post,
      );
      expect(request.request.body).toMatchObject({ alterEgo: null, imageUrl: null });
      request.flush(HERO);
    });
  });

  describe('edit mode', () => {
    const editData: HeroDialogData = { mode: HERO_FORM_MODE.edit, hero: HERO };

    it('should prefill the form with the edited hero', () => {
      const harness = setup(editData);

      expect(harness.form.getRawValue()).toMatchObject({
        name: HERO.name,
        alterEgo: HERO.alterEgo,
        publisher: HERO.publisher,
        powers: HERO.powers,
        powerLevel: HERO.powerLevel,
        firstAppearance: HERO.firstAppearance,
        active: HERO.active,
      });
      harness.httpMock.verify();
    });

    it('should start valid when nothing was changed', () => {
      const harness = setup(editData);

      resolveNameCheck(harness, [HERO]);

      expect(harness.form.valid).toBe(true);
    });

    it('should not flag the edited hero as its own duplicate', () => {
      const harness = setup(editData);

      resolveNameCheck(harness, [HERO]);

      expect(harness.form.controls.name.hasError(VALIDATION_ERROR_KEYS.duplicatedName)).toBe(false);
    });

    it('should flag a name taken by a different hero', () => {
      const harness = setup(editData);

      harness.form.controls.name.setValue('BATMAN');
      resolveNameCheck(harness, [{ ...HERO, id: 'hero-2', name: 'BATMAN' }]);

      expect(harness.form.controls.name.hasError(VALIDATION_ERROR_KEYS.duplicatedName)).toBe(true);
    });

    it('should put the hero and close with the updated one', () => {
      const harness = setup(editData);
      resolveNameCheck(harness, [HERO]);
      harness.form.controls.powerLevel.setValue(80);

      harness.fixture.componentInstance['submit']();

      const request = harness.httpMock.expectOne(
        (candidate) =>
          candidate.url === `${HEROES_URL}/${HERO.id}` && candidate.method === HTTP_METHODS.put,
      );
      const updated: Hero = { ...HERO, powerLevel: 80 };
      request.flush(updated);

      expect(harness.close).toHaveBeenCalledWith({
        action: DIALOG_ACTION.confirm,
        hero: updated,
      });
    });
  });

  describe('powers', () => {
    it('should add a typed power', () => {
      const harness = setup();
      const chipInput = { clear: vi.fn() };

      harness.fixture.componentInstance['addPower']({
        value: 'Telepatía',
        chipInput,
      } as never);

      expect(harness.form.controls.powers.value).toEqual(['Telepatía']);
      expect(chipInput.clear).toHaveBeenCalled();
    });

    it('should ignore a duplicated power', () => {
      const harness = setup();
      const chipInput = { clear: vi.fn() };
      harness.form.controls.powers.setValue(['Vuelo']);

      harness.fixture.componentInstance['addPower']({ value: 'Vuelo', chipInput } as never);

      expect(harness.form.controls.powers.value).toEqual(['Vuelo']);
    });

    it('should ignore a blank power', () => {
      const harness = setup();
      const chipInput = { clear: vi.fn() };

      harness.fixture.componentInstance['addPower']({ value: '   ', chipInput } as never);

      expect(harness.form.controls.powers.value).toEqual([]);
    });

    it('should remove a power', () => {
      const harness = setup();
      harness.form.controls.powers.setValue(['Vuelo', 'Superfuerza']);

      harness.fixture.componentInstance['removePower']('Vuelo');

      expect(harness.form.controls.powers.value).toEqual(['Superfuerza']);
    });
  });

  it('should close with the cancel action', () => {
    const harness = setup();

    harness.fixture.componentInstance['cancel']();

    expect(harness.close).toHaveBeenCalledWith({ action: DIALOG_ACTION.cancel });
  });
});
