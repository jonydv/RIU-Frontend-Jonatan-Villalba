import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroViewModeToggleComponent } from './hero-view-mode-toggle.component';
import { HERO_VIEW_MODE, type HeroViewMode } from '../../constants/hero-list.constants';

function setup(viewMode: HeroViewMode = HERO_VIEW_MODE.card): {
  fixture: ComponentFixture<HeroViewModeToggleComponent>;
  toggles: HTMLButtonElement[];
} {
  TestBed.configureTestingModule({ imports: [HeroViewModeToggleComponent] });

  const fixture = TestBed.createComponent(HeroViewModeToggleComponent);
  fixture.componentRef.setInput('viewMode', viewMode);
  fixture.detectChanges();

  return {
    fixture,
    toggles: Array.from(fixture.nativeElement.querySelectorAll('mat-button-toggle button')),
  };
}

describe('HeroViewModeToggleComponent', () => {
  it('should render one option per view mode', () => {
    const { toggles } = setup();

    expect(toggles).toHaveLength(2);
  });

  it('should mark the current view mode as selected', () => {
    const { fixture } = setup(HERO_VIEW_MODE.table);
    const selected: HTMLElement | null = fixture.nativeElement.querySelector(
      '.mat-button-toggle-checked',
    );

    expect(selected?.textContent).toContain('table_rows');
  });

  it('should emit the table mode when the table option is picked', () => {
    const { fixture, toggles } = setup(HERO_VIEW_MODE.card);
    const emitted: HeroViewMode[] = [];
    fixture.componentInstance.viewModeChange.subscribe((mode) => emitted.push(mode));

    toggles[1].click();
    fixture.detectChanges();

    expect(emitted).toEqual([HERO_VIEW_MODE.table]);
  });

  it('should emit the card mode when the card option is picked', () => {
    const { fixture, toggles } = setup(HERO_VIEW_MODE.table);
    const emitted: HeroViewMode[] = [];
    fixture.componentInstance.viewModeChange.subscribe((mode) => emitted.push(mode));

    toggles[0].click();
    fixture.detectChanges();

    expect(emitted).toEqual([HERO_VIEW_MODE.card]);
  });
});
