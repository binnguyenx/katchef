import { create } from 'zustand';

import {
  deleteFridgeItem as removeFridgeItemRecord,
  getFridgeItems,
  saveDetectedIngredients as persistDetectedIngredients,
  saveFridgeItem,
} from '../services/firestore';
import type { FridgeItem, IngredientDetection, IngredientFormValues, IngredientCategory } from '../types';
import { getErrorMessage } from '../utils/error';

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
  saveScanResults: (userId: string, ingredients: IngredientDetection[]) => Promise<void>;
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
      set({ items, isLoading: false });
    } catch (error) {
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
      const nextItems = [...get().items.filter(entry => entry.id !== item.id), item].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt)
      );
      set({ items: nextItems, error: null });
      return item;
    } catch (error) {
      set({ error: getErrorMessage(error, 'We could not save that ingredient.') });
      return null;
    }
  },
  removeItem: async (userId, itemId) => {
    try {
      await removeFridgeItemRecord(userId, itemId);
      set(state => ({
        items: state.items.filter(item => item.id !== itemId),
        error: null,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'We could not delete that ingredient.') });
    }
  },
  saveScanResults: async (userId, ingredients) => {
    try {
      await persistDetectedIngredients(userId, ingredients);
      const items = await getFridgeItems(userId);
      set({ items, error: null });
    } catch (error) {
      set({ error: getErrorMessage(error, 'We could not save those detected ingredients.') });
    }
  },
  reset: () =>
    set({
      items: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      categoryFilter: 'All',
    }),
}));
