import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'System4 Mobile',
  slug: 'mobile-system4',
  scheme: 'system4mobile',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.system4.mobile',
  },
  android: {
    package: 'com.system4.mobile',
    adaptiveIcon: {
      backgroundColor: '#0f766e',
    },
  },
  extra: {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3001/api', // NOSONAR: emulator-loopback dev fallback only; real environments inject an https URL via EXPO_PUBLIC_API_BASE_URL
  },
};

export default config;
