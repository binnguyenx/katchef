import { useCallback, useEffect, useRef } from 'react';

import { subscribeToAuthChanges } from '../services/auth';
import { bootstrapUserProfile } from '../services/firestore';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useFridgeStore } from '../store/fridgeStore';
import type { AuthSession } from '../types';
import { getErrorMessage } from '../utils/error';

export const useAuthBootstrap = () => {
  const setUser = useAuthStore(state => state.setUser);
  const setProfile = useAuthStore(state => state.setProfile);
  const setBootstrapping = useAuthStore(state => state.setBootstrapping);
  const setAuthError = useAuthStore(state => state.setAuthError);
  const resetFridge = useFridgeStore(state => state.reset);
  const clearChat = useChatStore(state => state.clear);

  const stableRef = useRef({ setUser, setProfile, setBootstrapping, setAuthError, resetFridge, clearChat });
  stableRef.current = { setUser, setProfile, setBootstrapping, setAuthError, resetFridge, clearChat };

  const handleAuthChange = useCallback(async (session: AuthSession | null) => {
    const { setUser, setProfile, setBootstrapping, setAuthError, resetFridge, clearChat } = stableRef.current;
    setBootstrapping(true);
    setAuthError(null);

    if (!session) {
      setUser(null);
      setProfile(null);
      resetFridge();
      clearChat();
      setBootstrapping(false);
      return;
    }

    try {
      setUser(session);
      const profile = await bootstrapUserProfile(session);
      setProfile(profile);
    } catch (error) {
      setAuthError(getErrorMessage(error, 'We could not restore your KatChef session.'));
    } finally {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(session => {
      void handleAuthChange(session);
    });

    return unsubscribe;
  }, [handleAuthChange]);
};
