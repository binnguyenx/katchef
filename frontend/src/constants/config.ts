import Constants from 'expo-constants';

const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');

export const config = {
  appName: 'KatChef',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  apiBaseUrl,
  useMockApi: process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false' || !apiBaseUrl,
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
} as const;

export const isFirebaseConfigured = Object.values(config.firebase).every(Boolean);
export const dataMode = isFirebaseConfigured ? 'firebase' : 'demo';
