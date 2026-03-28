import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { config, dataMode, isFirebaseConfigured } from '../constants/config';

let firebaseApp: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  firebaseApp = getApps().length ? getApp() : initializeApp(config.firebase);
}

const createAuthInstance = () => {
  if (!firebaseApp) {
    return null;
  }

  if (Platform.OS === 'web') {
    const webAuth = getAuth(firebaseApp);
    void setPersistence(webAuth, browserLocalPersistence).catch(() => undefined);
    return webAuth;
  }

  try {
    const { getReactNativePersistence } = require('firebase/auth');

    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
};

export const firebaseMode = dataMode;
export const app = firebaseApp;
export const auth: Auth | null = createAuthInstance();
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });
