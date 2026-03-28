import { create } from 'zustand';

import {
  deleteFridgeItem as removeFridgeItemRecord,
  getFridgeItems,
  saveDetectedIngredients as persistDetectedIngredients,
  saveFridgeItem,
} from '../services/firestore';
import type { FridgeItem, IngredientFormValues, IngredientCategory } from '../types';
import { isAuthUserStill } from '../utils/authScope';
import { getErrorMessage } from '../utils/error';

export type ScanIngredientPayload = { name: string; quantity: string; category: string };

type CategoryFilter = 'All' | IngredientCategory;

type FridgeState = {
  items: FridgeItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: CategoryFilter;
  loadItems: (userId: string) => Promise<void>;
  setSearchQuery: (value: string) => void;
  setCategoryFilter: (value: CategoryFilter) => void;
  upsertItem: (userId: string, values: IngredientFormValues, itemId?: string) => Promise<FridgeItem | null>;
  removeItem: (userId: string, itemId: string) => Promise<void>;
  saveScanResults: (userId: string, ingredients: ScanIngredientPayload[]) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
};

export const useFridgeStore = create<FridgeState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  categoryFilter: 'All',
  loadItems: async userId => {
    set({ isLoading: true, error: null });

    try {
      const items = await getFridgeItems(userId);
      if (!isAuthUserStill(userId)) {
        set({ isLoading: false });
        return;
      }
      set({ items, isLoading: false });
    } catch (error) {
      if (!isAuthUserStill(userId)) {
        set({ isLoading: false });
        return;
      }
      set({
        isLoading: false,
        error: getErrorMessage(error, 'We could not load your fridge right now.'),
      });
    }
  },
  setSearchQuery: searchQuery => set({ searchQuery }),
  setCategoryFilter: categoryFilter => set({ categoryFilter }),
  upsertItem: async (userId, values, itemId) => {
    try {
      const item = await saveFridgeItem(userId, values, { itemId });
      if (!isAuthUserStill(userId)) {
        return null;
      }
      const nextItems = [...get().items.filter(entry => entry.id !== item.id), item].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt)
      );
      set({ items: nextItems, error: null });
      return item;
    } catch (error) {
      if (isAuthUserStill(userId)) {
        set({ error: getErrorMessage(error, 'We could not save that ingredient.') });
      }
      return null;
    }
  },
  removeItem: async (userId, itemId) => {
    try {
      await removeFridgeItemRecord(userId, itemId);
      if (!isAuthUserStill(userId)) {
        return;
      }
      set(state => ({
        items: state.items.filter(item => item.id !== itemId),
        error: null,
      }));
    } catch (error) {
      if (isAuthUserStill(userId)) {
        set({ error: getErrorMessage(error, 'We could not delete that ingredient.') });
      }
    }
  },
  saveScanResults: async (userId, ingredients) => {
    try {
      await persistDetectedIngredients(userId, ingredients);
      const items = await getFridgeItems(userId);
      if (!isAuthUserStill(userId)) {
        return false;
      }
      set({ items, error: null });
      return true;
    } catch (error) {
      if (isAuthUserStill(userId)) {
        set({ error: getErrorMessage(error, 'We could not save those detected ingredients.') });
      }
      return false;
    }
  },
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      items: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      categoryFilter: 'All',
    }),
}));
