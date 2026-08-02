import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroCardListComponent } from './hero-card-list.component';
import { HERO_PUBLISHERS } from '../../constants/hero.constants';
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
  alterEgo: null,
  imageUrl: null,
  powerLevel: 40,
  active: false,
};

function setup(heroes: readonly Hero[] = [SUPERMAN]): ComponentFixture<HeroCardListComponent> {
  TestBed.configureTestingModule({
    imports: [HeroCardListComponent],
    providers: [provideRouter([])],
  });

  const fixture = TestBed.createComponent(HeroCardListComponent);
  fixture.componentRef.setInput('heroes', heroes);
  fixture.detectChanges();

  return fixture;
}

describe('HeroCardListComponent', () => {
  it('should render one card per hero', () => {
    const fixture = setup([SUPERMAN, RETIRED]);

    expect(fixture.nativeElement.querySelectorAll('.hero-card')).toHaveLength(2);
  });

  it('should show the hero name, alter ego and publisher', () => {
    const fixture = setup();
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('SUPERMAN');
    expect(text).toContain('Clark Kent');
    expect(text).toContain(HERO_PUBLISHERS.dc);
  });

  it('should link the hero name to its detail route', () => {
    const fixture = setup();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.hero-card__link');

    expect(link.getAttribute('href')).toBe(routeToHeroDetail(SUPERMAN.id));
  });

  it('should render the hero image when available', () => {
    const fixture = setup();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.hero-card__image');

    expect(image.getAttribute('src')).toBe(SUPERMAN.imageUrl);
  });

  it('should fall back to a placeholder when the hero has no image', () => {
    const fixture = setup([RETIRED]);

    expect(fixture.nativeElement.querySelector('.hero-card__image')).toBeNull();
    expect(fixture.nativeElement.querySelector('.hero-card__placeholder')).not.toBeNull();
  });

  it('should flag inactive heroes', () => {
    const fixture = setup([RETIRED]);

    expect(fixture.nativeElement.querySelector('.hero-card--inactive')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
  });

  it('should emit the hero when the edit action is used', () => {
    const fixture = setup();
    const emitted: Hero[] = [];
    fixture.componentInstance.edit.subscribe((hero) => emitted.push(hero));

    fixture.nativeElement.querySelectorAll('.hero-card__actions button')[0].click();

    expect(emitted).toEqual([SUPERMAN]);
  });

  it('should emit the hero when the delete action is used', () => {
    const fixture = setup();
    const emitted: Hero[] = [];
    fixture.componentInstance.delete.subscribe((hero) => emitted.push(hero));

    fixture.nativeElement.querySelectorAll('.hero-card__actions button')[1].click();

    expect(emitted).toEqual([SUPERMAN]);
  });

  it('should name the actions after the hero for assistive technology', () => {
    const fixture = setup();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.hero-card__actions button'),
    );

    expect(buttons[0].getAttribute('aria-label')).toContain('SUPERMAN');
    expect(buttons[1].getAttribute('aria-label')).toContain('SUPERMAN');
  });
});
