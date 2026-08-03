import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  readonly baseUrl: string;
  readonly simulatedDelayMs: number;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: (): ApiConfig => ({
    baseUrl: environment.apiBaseUrl,
    simulatedDelayMs: environment.simulatedApiDelayMs,
  }),
});
