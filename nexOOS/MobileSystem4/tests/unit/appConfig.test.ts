import { appConfig } from '@/config/appConfig';

describe('appConfig', () => {
  it('provides mobile-safe defaults', () => {
    expect(appConfig.appName).toBeTruthy();
    expect(appConfig.apiBaseUrl).toMatch(/^https?:\/\//);
  });
});
