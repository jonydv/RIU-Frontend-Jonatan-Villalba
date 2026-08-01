import { TestBed } from '@angular/core/testing';
import { API_CONFIG, ApiConfig } from './api-config.token';
import { environment } from '../../../environments/environment';

describe('API_CONFIG', () => {
  it('should build the config from the active environment', () => {
    const config = TestBed.inject(API_CONFIG);

    expect(config.baseUrl).toBe(environment.apiBaseUrl);
    expect(config.simulatedDelayMs).toBe(environment.simulatedApiDelayMs);
  });

  it('should be overridable by tests', () => {
    const stub: ApiConfig = { baseUrl: '/stub-api', simulatedDelayMs: 0 };
    TestBed.configureTestingModule({
      providers: [{ provide: API_CONFIG, useValue: stub }],
    });

    expect(TestBed.inject(API_CONFIG)).toBe(stub);
  });
});
