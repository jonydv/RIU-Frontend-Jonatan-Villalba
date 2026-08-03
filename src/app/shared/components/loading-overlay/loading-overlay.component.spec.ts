import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingOverlayComponent } from './loading-overlay.component';
import { LoadingService } from '../../../core/services/loading.service';

function setup(): { fixture: ComponentFixture<LoadingOverlayComponent>; loading: LoadingService } {
  TestBed.configureTestingModule({ imports: [LoadingOverlayComponent] });

  return {
    fixture: TestBed.createComponent(LoadingOverlayComponent),
    loading: TestBed.inject(LoadingService),
  };
}

function progressBar(fixture: ComponentFixture<LoadingOverlayComponent>): HTMLElement | null {
  return fixture.nativeElement.querySelector('mat-progress-bar');
}

describe('LoadingOverlayComponent', () => {
  it('should not render the progress bar while idle', () => {
    const { fixture } = setup();

    fixture.detectChanges();

    expect(progressBar(fixture)).toBeNull();
  });

  it('should render the progress bar while a request is pending', () => {
    const { fixture, loading } = setup();

    loading.increment();
    fixture.detectChanges();

    expect(progressBar(fixture)).not.toBeNull();
  });

  it('should remove the progress bar once every request settles', () => {
    const { fixture, loading } = setup();

    loading.increment();
    fixture.detectChanges();
    loading.decrement();
    fixture.detectChanges();

    expect(progressBar(fixture)).toBeNull();
  });
});
