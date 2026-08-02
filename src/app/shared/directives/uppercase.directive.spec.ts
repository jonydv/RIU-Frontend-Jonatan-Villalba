import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  imports: [ReactiveFormsModule, UppercaseDirective],
  template: `<input appUppercase [formControl]="control" />`,
})
class HostComponent {
  readonly control = new FormControl('', { nonNullable: true });
}

function typeAt(input: HTMLInputElement, value: string, cursor: number): void {
  input.value = value;
  input.setSelectionRange(cursor, cursor);
  input.dispatchEvent(new Event('input'));
}

function setup(): { host: HostComponent; input: HTMLInputElement } {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();

  const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

  return { host: fixture.componentInstance, input };
}

describe('UppercaseDirective', () => {
  it('should transform the typed value to uppercase', () => {
    const { input } = setup();

    typeAt(input, 'superman', 8);

    expect(input.value).toBe('SUPERMAN');
  });

  it('should write the uppercased value into the bound control', () => {
    const { host, input } = setup();

    typeAt(input, 'batman', 6);

    expect(host.control.value).toBe('BATMAN');
  });

  it('should preserve the cursor position after transforming', () => {
    const { input } = setup();

    typeAt(input, 'SUPeRMAN', 4);

    expect(input.value).toBe('SUPERMAN');
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
  });

  it('should skip the extra control write when the value is already uppercase', () => {
    const { host, input } = setup();
    let emissions = 0;
    host.control.valueChanges.subscribe(() => emissions++);

    // The bound value accessor always writes once per input event; the directive
    // only adds a second write when it actually has to uppercase something.
    typeAt(input, 'HULK', 4);
    expect(emissions).toBe(1);

    typeAt(input, 'hulk', 4);
    expect(emissions).toBe(3);
  });
});
