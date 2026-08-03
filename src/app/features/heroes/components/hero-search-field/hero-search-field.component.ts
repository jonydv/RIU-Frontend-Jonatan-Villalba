import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-hero-search-field',
  imports: [MatFormField, MatLabel, MatSuffix, MatInput, MatIcon],
  templateUrl: './hero-search-field.component.html',
  styleUrl: './hero-search-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSearchFieldComponent {
  readonly searchTerm = input('');
  readonly searchTermChange = output<string>();

  protected onInput(event: Event): void {
    this.searchTermChange.emit((event.target as HTMLInputElement).value);
  }
}
