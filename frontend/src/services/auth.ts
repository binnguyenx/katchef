import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { storageKeys } from '../constants/storageKeys';
import type { AuthProviderType, AuthSession, SignUpFormValues } from '../types';
import { getErrorMessage } from '../utils/error';
import { formatDisplayName } from '../utils/format';
import { auth, googleProvider } from './firebase';

type AuthListener = (session: AuthSession | null) => void;

const demoListeners = new Set<AuthListener>();

const mapFirebaseUser = (user: User): AuthSession => ({
  uid: user.uid,
  email: user.email ?? '',
  displayName: formatDisplayName(user.displayName, user.email),
  photoURL: user.photoURL,
  providerId: (user.providerData[0]?.providerId as AuthProviderType) ?? 'password',
});

const createDemoSession = (email: string, displayName?: string): AuthSession => {
  const cleanEmail = email.trim().toLowerCase();

  return {
    uid: `demo-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
    email: cleanEmail,
    displayName: formatDisplayName(displayName, cleanEmail),
    photoURL: null,
    providerId: 'demo',
  };
};

const notifyDemoListeners = (session: AuthSession | null) => {
  demoListeners.forEach(listener => listener(session));
};

const readDemoSession = async () => {
  const rawSession = await AsyncStorage.getItem(storageKeys.demoAuth);
  return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
};

const writeDemoSession = async (session: AuthSession | null) => {
  if (!session) {
    await AsyncStorage.removeItem(storageKeys.demoAuth);
  } else {
    await AsyncStorage.setItem(storageKeys.demoAuth, JSON.stringify(session));
  }

  notifyDemoListeners(session);
};

export const getCurrentSession = async () => {
  if (!auth) {
    return readDemoSession();
  }

  return auth.currentUser ? mapFirebaseUser(auth.currentUser) : null;
};

export const subscribeToAuthChanges = (listener: AuthListener) => {
  if (!auth) {
    demoListeners.add(listener);
    void readDemoSession().then(listener);

    return () => {
      demoListeners.delete(listener);
    };
  }

  return onAuthStateChanged(auth, user => {
    listener(user ? mapFirebaseUser(user) : null);
  });
};

export const signUpWithEmail = async (values: SignUpFormValues) => {
  if (!auth) {
    const session = createDemoSession(values.email, values.displayName);
    await writeDemoSession(session);
    return session;
  }

  const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);

  if (values.displayName.trim()) {
    await updateProfile(credential.user, { displayName: values.displayName.trim() });
  }

  return mapFirebaseUser(auth.currentUser ?? credential.user);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    const session = createDemoSession(email);
    await writeDemoSession(session);
    return session;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(credential.user);
};

export const signInWithGoogle = async () => {
  if (!auth) {
    const session = createDemoSession('demo.google@katchef.app', 'Chef Kat');
    await writeDemoSession(session);
    return session;
  }

  if (Platform.OS !== 'web') {
    throw new Error(
      'Google Sign-In is wired for Expo web in this phase. Use email sign-in on native builds until native OAuth is added.'
    );
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(credential.user);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const requestPasswordReset = async (email: string) => {
  if (!auth) {
    return;
  }

  await sendPasswordResetEmail(auth, email);
};

export const signOut = async () => {
  if (!auth) {
    await writeDemoSession(null);
    return;
  }

  await firebaseSignOut(auth);
};
