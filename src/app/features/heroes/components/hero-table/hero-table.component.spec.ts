import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroTableComponent } from './hero-table.component';
import { HERO_PUBLISHERS } from '../../constants/hero.constants';
import { HERO_TABLE_COLUMNS } from '../../constants/hero-list.constants';
import { routeToHeroDetail } from '../../../../core/constants/app-routes.constants';
import type { Hero } from '../../models/hero.model';

const SUPERMAN: Hero = {
  id: 'hero-1',
  name: 'SUPERMAN',
  alterEgo: 'Clark Kent',
  imageUrl: 'https://example.test/superman.jpg',
  publisher: HERO_PUBLISHERS.dc,
  powers: ['Vuelo'],
  powerLevel: 99,
  firstAppearance: '1938-06-01',
  active: true,
};

const RETIRED: Hero = {
  ...SUPERMAN,
  id: 'hero-2',
  name: 'CYBORG',
  imageUrl: null,
  active: false,
};

function setup(heroes: readonly Hero[] = [SUPERMAN]): ComponentFixture<HeroTableComponent> {
  TestBed.configureTestingModule({
    imports: [HeroTableComponent],
    providers: [provideRouter([])],
  });

  const fixture = TestBed.createComponent(HeroTableComponent);
  fixture.componentRef.setInput('heroes', heroes);
  fixture.detectChanges();

  return fixture;
}

describe('HeroTableComponent', () => {
  it('should render one row per hero', () => {
    const fixture = setup([SUPERMAN, RETIRED]);

    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('should render every configured column in the header', () => {
    const fixture = setup();

    expect(fixture.nativeElement.querySelectorAll('thead th')).toHaveLength(
      HERO_TABLE_COLUMNS.length,
    );
  });

  it('should link the hero name to its detail route', () => {
    const fixture = setup();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.hero-table__name');

    expect(link.getAttribute('href')).toBe(routeToHeroDetail(SUPERMAN.id));
  });

  it('should fall back to a placeholder when the hero has no image', () => {
    const fixture = setup([RETIRED]);

    expect(fixture.nativeElement.querySelector('.hero-table__avatar')).toBeNull();
    expect(fixture.nativeElement.querySelector('.hero-table__placeholder')).not.toBeNull();
  });

  it('should show the hero status', () => {
    const fixture = setup([SUPERMAN, RETIRED]);
    const statuses: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.hero-table__status'),
    );

    expect(statuses[0].textContent?.trim()).toBe('Activo');
    expect(statuses[1].textContent?.trim()).toBe('Inactivo');
  });

  it('should emit the hero when the edit action is used', () => {
    const fixture = setup();
    const emitted: Hero[] = [];
    fixture.componentInstance.edit.subscribe((hero) => emitted.push(hero));

    fixture.nativeElement.querySelectorAll('tbody button')[0].click();

    expect(emitted).toEqual([SUPERMAN]);
  });

  it('should emit the hero when the delete action is used', () => {
    const fixture = setup();
    const emitted: Hero[] = [];
    fixture.componentInstance.delete.subscribe((hero) => emitted.push(hero));

    fixture.nativeElement.querySelectorAll('tbody button')[1].click();

    expect(emitted).toEqual([SUPERMAN]);
  });
});
