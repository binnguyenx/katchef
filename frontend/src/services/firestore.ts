import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

import { getLevelMeta, getUnlockedBadges } from '../constants/levels';
import { storageKeys } from '../constants/storageKeys';
import type {
  AuthSession,
  ChatMessage,
  FridgeItem,
  IngredientDetection,
  IngredientFormValues,
  UserProfile,
} from '../types';
import { formatDisplayName } from '../utils/format';
import { db } from './firebase';

type DemoProfiles = Record<string, UserProfile>;
type DemoFridge = Record<string, FridgeItem[]>;
type DemoChats = Record<string, ChatMessage[]>;
type ProfileStatKey = keyof UserProfile['stats'];

const nowIso = () => new Date().toISOString();

const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  const rawValue = await AsyncStorage.getItem(key);
  return rawValue ? (JSON.parse(rawValue) as T) : fallback;
};

const writeJson = async <T>(key: string, value: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

const buildDefaultProfile = (session: AuthSession): UserProfile => {
  const levelMeta = getLevelMeta(0);
  const timestamp = nowIso();

  return {
    id: session.uid,
    email: session.email,
    displayName: formatDisplayName(session.displayName, session.email),
    photoURL: session.photoURL ?? null,
    xp: 0,
    level: levelMeta.level,
    levelTitle: levelMeta.title,
    streak: 1,
    badges: getUnlockedBadges(0, ['Welcome Whiskers']),
    stats: {
      scans: 0,
      recipesSuggested: 0,
      fridgeItemsSaved: 0,
      chatsStarted: 0,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const normalizeProfile = (id: string, data: Partial<UserProfile>): UserProfile => {
  const fallbackLevel = getLevelMeta(data.xp ?? 0);

  return {
    id,
    email: data.email ?? '',
    displayName: formatDisplayName(data.displayName, data.email),
    photoURL: data.photoURL ?? null,
    xp: data.xp ?? 0,
    level: data.level ?? fallbackLevel.level,
    levelTitle: data.levelTitle ?? fallbackLevel.title,
    streak: data.streak ?? 1,
    badges: getUnlockedBadges(data.xp ?? 0, data.badges ?? ['Welcome Whiskers']),
    stats: {
      scans: data.stats?.scans ?? 0,
      recipesSuggested: data.stats?.recipesSuggested ?? 0,
      fridgeItemsSaved: data.stats?.fridgeItemsSaved ?? 0,
      chatsStarted: data.stats?.chatsStarted ?? 0,
    },
    createdAt: data.createdAt ?? nowIso(),
    updatedAt: data.updatedAt ?? nowIso(),
  };
};

const saveProfile = async (profile: UserProfile) => {
  if (db) {
    await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
    return profile;
  }

  const profiles = await readJson<DemoProfiles>(storageKeys.demoProfiles, {});
  profiles[profile.id] = profile;
  await writeJson(storageKeys.demoProfiles, profiles);
  return profile;
};

const loadAllFridgeItems = async (userId: string) => {
  if (db) {
    const fridgeCollection = collection(db, 'users', userId, 'fridgeItems');
    const snapshot = await getDocs(query(fridgeCollection, orderBy('updatedAt', 'desc')));

    return snapshot.docs.map(
      item =>
        ({
          id: item.id,
          ...(item.data() as Omit<FridgeItem, 'id'>),
        }) satisfies FridgeItem
    );
  }

  const fridgeByUser = await readJson<DemoFridge>(storageKeys.demoFridge, {});
  return [...(fridgeByUser[userId] ?? [])].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
};

const loadAllChatMessages = async (userId: string, sessionId = 'default') => {
  if (db) {
    const messagesCollection = collection(db, 'users', userId, 'chatSessions', sessionId, 'messages');
    const snapshot = await getDocs(query(messagesCollection, orderBy('createdAt', 'asc')));

    return snapshot.docs.map(
      message =>
        ({
          id: message.id,
          ...(message.data() as Omit<ChatMessage, 'id'>),
        }) satisfies ChatMessage
    );
  }

  const chatBySession = await readJson<DemoChats>(storageKeys.demoChats, {});
  return [...(chatBySession[`${userId}:${sessionId}`] ?? [])].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
};

const syncDerivedProfileStats = async (userId: string) => {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return null;
  }

  const fridgeItems = await loadAllFridgeItems(userId);
  const chatMessages = await loadAllChatMessages(userId);
  const nextBadges = [...profile.badges];

  if (fridgeItems.length >= 10) {
    nextBadges.push('Fridge Curator');
  }

  if (profile.stats.scans >= 3) {
    nextBadges.push('KatLens Scout');
  }

  const updatedProfile: UserProfile = {
    ...profile,
    badges: Array.from(new Set(nextBadges)),
    stats: {
      ...profile.stats,
      fridgeItemsSaved: fridgeItems.length,
      chatsStarted: chatMessages.some(message => message.role === 'user') ? 1 : 0,
    },
    updatedAt: nowIso(),
  };

  return saveProfile(updatedProfile);
};

export const bootstrapUserProfile = async (session: AuthSession) => {
  if (db) {
    const userRef = doc(db, 'users', session.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const profile = buildDefaultProfile(session);
      await setDoc(userRef, profile, { merge: true });
      return profile;
    }

    const merged = normalizeProfile(session.uid, {
      ...(snapshot.data() as Partial<UserProfile>),
      email: session.email,
      displayName: formatDisplayName(session.displayName, session.email),
      photoURL: session.photoURL ?? null,
      updatedAt: nowIso(),
    });

    await setDoc(userRef, merged, { merge: true });
    return merged;
  }

  const profiles = await readJson<DemoProfiles>(storageKeys.demoProfiles, {});
  const existing = profiles[session.uid];
  const nextProfile = existing
    ? normalizeProfile(session.uid, {
        ...existing,
        email: session.email,
        displayName: formatDisplayName(session.displayName, session.email),
        photoURL: session.photoURL ?? null,
        updatedAt: nowIso(),
      })
    : buildDefaultProfile(session);

  profiles[session.uid] = nextProfile;
  await writeJson(storageKeys.demoProfiles, profiles);
  return nextProfile;
};

export const getUserProfile = async (userId: string) => {
  if (db) {
    const snapshot = await getDoc(doc(db, 'users', userId));
    return snapshot.exists() ? normalizeProfile(userId, snapshot.data() as Partial<UserProfile>) : null;
  }

  const profiles = await readJson<DemoProfiles>(storageKeys.demoProfiles, {});
  return profiles[userId] ?? null;
};

export const awardXp = async (
  userId: string,
  amount: number,
  statIncrements: Partial<Record<ProfileStatKey, number>> = {},
  extraBadges: string[] = []
) => {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return null;
  }

  const nextXp = Math.max(0, profile.xp + amount);
  const nextLevel = getLevelMeta(nextXp);
  const nextStats = { ...profile.stats };

  Object.entries(statIncrements).forEach(([key, value]) => {
    const statKey = key as ProfileStatKey;
    nextStats[statKey] = (nextStats[statKey] ?? 0) + (value ?? 0);
  });

  const updatedProfile: UserProfile = {
    ...profile,
    xp: nextXp,
    level: nextLevel.level,
    levelTitle: nextLevel.title,
    badges: Array.from(
      new Set(getUnlockedBadges(nextXp, [...profile.badges, ...extraBadges]))
    ),
    stats: nextStats,
    updatedAt: nowIso(),
  };

  const saved = await saveProfile(updatedProfile);
  await syncDerivedProfileStats(userId);
  return saved;
};

const upsertFridgeItemRecord = async (userId: string, item: FridgeItem) => {
  if (db) {
    await setDoc(doc(db, 'users', userId, 'fridgeItems', item.id), item, { merge: true });
    return item;
  }

  const fridgeByUser = await readJson<DemoFridge>(storageKeys.demoFridge, {});
  const items = fridgeByUser[userId] ?? [];
  const existingIndex = items.findIndex(entry => entry.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.unshift(item);
  }

  fridgeByUser[userId] = items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  await writeJson(storageKeys.demoFridge, fridgeByUser);
  return item;
};

export const getFridgeItems = async (userId: string) => loadAllFridgeItems(userId);

export const saveFridgeItem = async (
  userId: string,
  values: IngredientFormValues,
  options?: {
    itemId?: string;
    source?: FridgeItem['source'];
  }
) => {
  const existingItems = await loadAllFridgeItems(userId);
  const existingItem = existingItems.find(item => item.id === options?.itemId);
  const timestamp = nowIso();
  const item: FridgeItem = {
    id: existingItem?.id ?? options?.itemId ?? createId('ingredient'),
    name: values.name.trim(),
    quantity: values.quantity.trim(),
    category: values.category,
    source: options?.source ?? existingItem?.source ?? 'manual',
    createdAt: existingItem?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  await upsertFridgeItemRecord(userId, item);
  await awardXp(userId, existingItem ? 2 : 8);
  await syncDerivedProfileStats(userId);

  return item;
};

export const deleteFridgeItem = async (userId: string, itemId: string) => {
  if (db) {
    await deleteDoc(doc(db, 'users', userId, 'fridgeItems', itemId));
  } else {
    const fridgeByUser = await readJson<DemoFridge>(storageKeys.demoFridge, {});
    fridgeByUser[userId] = (fridgeByUser[userId] ?? []).filter(item => item.id !== itemId);
    await writeJson(storageKeys.demoFridge, fridgeByUser);
  }

  await syncDerivedProfileStats(userId);
};

export const saveDetectedIngredients = async (userId: string, ingredients: IngredientDetection[]) => {
  const timestamp = nowIso();

  await Promise.all(
    ingredients.map(ingredient =>
      upsertFridgeItemRecord(userId, {
        id: createId('scan'),
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim(),
        category: ingredient.category,
        source: 'scan',
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    )
  );

  await awardXp(userId, 20 + ingredients.length * 2, { scans: 1 }, ['Fresh Finder']);
  await syncDerivedProfileStats(userId);
};

export const getChatMessages = async (userId: string, sessionId = 'default') =>
  loadAllChatMessages(userId, sessionId);

export const saveChatMessage = async (userId: string, message: ChatMessage, sessionId = 'default') => {
  if (db) {
    await setDoc(
      doc(db, 'users', userId, 'chatSessions', sessionId),
      {
        id: sessionId,
        updatedAt: message.createdAt,
        createdAt: message.createdAt,
      },
      { merge: true }
    );
    await setDoc(doc(db, 'users', userId, 'chatSessions', sessionId, 'messages', message.id), message);
  } else {
    const chatBySession = await readJson<DemoChats>(storageKeys.demoChats, {});
    const chatKey = `${userId}:${sessionId}`;
    const messages = chatBySession[chatKey] ?? [];
    const existingIndex = messages.findIndex(entry => entry.id === message.id);

    if (existingIndex >= 0) {
      messages[existingIndex] = message;
    } else {
      messages.push(message);
    }

    chatBySession[chatKey] = messages.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    await writeJson(storageKeys.demoChats, chatBySession);
  }

  await syncDerivedProfileStats(userId);
  return message;
};
