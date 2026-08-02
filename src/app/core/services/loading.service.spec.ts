import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

function create(): LoadingService {
  TestBed.configureTestingModule({});

  return TestBed.inject(LoadingService);
}

describe('LoadingService', () => {
  it('should start as not loading', () => {
    const service = create();

    expect(service.isLoading()).toBe(false);
  });

  it('should be loading while there is at least one pending request', () => {
    const service = create();

    service.increment();

    expect(service.isLoading()).toBe(true);
  });

  it('should stop loading only once every pending request is decremented', () => {
    const service = create();

    service.increment();
    service.increment();
    service.decrement();

    expect(service.isLoading()).toBe(true);

    service.decrement();

    expect(service.isLoading()).toBe(false);
  });
});
