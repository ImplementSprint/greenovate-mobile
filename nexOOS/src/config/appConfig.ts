export type AppEnvironment = 'development' | 'staging' | 'production' | string;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export type AppConfig = {
  appName: string;
  environment: AppEnvironment;
  apiBaseUrl: string;
};

export const appConfig: AppConfig = {
  appName: process.env.EXPO_PUBLIC_APP_NAME?.trim() || 'System4 Mobile',
  environment: process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'development',
  apiBaseUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://10.0.2.2:3001/api',
  ),
};
