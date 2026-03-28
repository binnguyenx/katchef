import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getUserProfile } from '../services/firestore';
import { useAuthStore } from '../store/authStore';
import { useFridgeStore } from '../store/fridgeStore';

/** Home + Profile: làm mới fridge và profile khi vào màn. */
export const useProfileFridgeOnFocus = (userId: string | undefined) => {
  const setProfile = useAuthStore(state => state.setProfile);
  const loadItems = useFridgeStore(state => state.loadItems);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return;
      }

      void loadItems(userId);
      void getUserProfile(userId).then(nextProfile => {
        if (nextProfile) {
          setProfile(nextProfile);
        }
      });
    }, [loadItems, setProfile, userId])
  );
};
