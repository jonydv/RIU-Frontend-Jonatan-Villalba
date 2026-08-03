import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  host: {
    '(input)': 'onInput($event)',
  },
})
export class UppercaseDirective {
  private readonly ngControl = inject(NgControl, { self: true });

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const uppercased = input.value.toUpperCase();

    if (uppercased === input.value) {
      return;
    }

    const { selectionStart, selectionEnd } = input;
    this.ngControl.control?.setValue(uppercased);

    if (selectionStart !== null && selectionEnd !== null) {
      input.setSelectionRange(selectionStart, selectionEnd);
    }
  }
}
