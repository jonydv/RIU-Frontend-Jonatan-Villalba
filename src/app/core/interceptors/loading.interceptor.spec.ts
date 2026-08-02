import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

function setup(): {
  http: HttpClient;
  httpMock: HttpTestingController;
  loadingService: LoadingService;
} {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([loadingInterceptor])),
      provideHttpClientTesting(),
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
    loadingService: TestBed.inject(LoadingService),
  };
}

describe('loadingInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should turn loading on while the request is pending and off once it resolves', async () => {
    const { http, httpMock, loadingService } = setup();

    const promise = firstValueFrom(http.get('/ping'));
    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/ping').flush({});
    await promise;

    expect(loadingService.isLoading()).toBe(false);
  });

  it('should keep loading on until every concurrent request settles', async () => {
    const { http, httpMock, loadingService } = setup();

    const first = firstValueFrom(http.get('/one'));
    const second = firstValueFrom(http.get('/two'));
    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/one').flush({});
    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/two').flush({});
    await Promise.all([first, second]);

    expect(loadingService.isLoading()).toBe(false);
  });

  it('should turn loading off even when the request errors', async () => {
    const { http, httpMock, loadingService } = setup();

    const promise = firstValueFrom(http.get('/broken'));
    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/broken').flush('error', { status: 500, statusText: 'Server Error' });

    await expect(promise).rejects.toMatchObject({ status: 500 });
    expect(loadingService.isLoading()).toBe(false);
  });
});
