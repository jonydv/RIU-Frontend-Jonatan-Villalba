import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroSearchFieldComponent } from './hero-search-field.component';

function setup(searchTerm = ''): {
  fixture: ComponentFixture<HeroSearchFieldComponent>;
  input: HTMLInputElement;
} {
  TestBed.configureTestingModule({ imports: [HeroSearchFieldComponent] });

  const fixture = TestBed.createComponent(HeroSearchFieldComponent);
  fixture.componentRef.setInput('searchTerm', searchTerm);
  fixture.detectChanges();

  return { fixture, input: fixture.nativeElement.querySelector('input') };
}

describe('HeroSearchFieldComponent', () => {
  it('should show the current search term', () => {
    const { input } = setup('superman');

    expect(input.value).toBe('superman');
  });

  it('should emit the typed value', () => {
    const { fixture, input } = setup();
    const emitted: string[] = [];
    fixture.componentInstance.searchTermChange.subscribe((value) => emitted.push(value));

    input.value = 'batman';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual(['batman']);
  });

  it('should emit an empty string when the field is cleared', () => {
    const { fixture, input } = setup('batman');
    const emitted: string[] = [];
    fixture.componentInstance.searchTermChange.subscribe((value) => emitted.push(value));

    input.value = '';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toEqual(['']);
  });
});
