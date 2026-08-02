import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HeroSearchFieldComponent } from '../../components/hero-search-field/hero-search-field.component';
import { HeroViewModeToggleComponent } from '../../components/hero-view-mode-toggle/hero-view-mode-toggle.component';
import { HeroCardListComponent } from '../../components/hero-card-list/hero-card-list.component';
import { HeroTableComponent } from '../../components/hero-table/hero-table.component';
import { HeroListStoreService } from '../../stores/hero-list-store.service';
import { LayoutService } from '../../../../core/services/layout.service';
import { HERO_VIEW_MODE, PAGE_SIZE_OPTIONS } from '../../constants/hero-list.constants';

@Component({
  selector: 'app-hero-list-page',
  imports: [
    HeroSearchFieldComponent,
    HeroViewModeToggleComponent,
    HeroCardListComponent,
    HeroTableComponent,
    MatPaginator,
  ],
  providers: [HeroListStoreService],
  templateUrl: './hero-list-page.component.html',
  styleUrl: './hero-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroListPageComponent {
  protected readonly store = inject(HeroListStoreService);
  private readonly layoutService = inject(LayoutService);

  protected readonly viewModes = HERO_VIEW_MODE;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly isHandset = this.layoutService.isHandset;

  protected onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.store.pageSize()) {
      this.store.setPageSize(event.pageSize);
      return;
    }

    this.store.setPageIndex(event.pageIndex);
  }
}
