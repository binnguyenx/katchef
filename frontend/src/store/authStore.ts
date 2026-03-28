import { create } from 'zustand';

import { dataMode } from '../constants/config';
import type { AuthSession, UserProfile } from '../types';

type AuthState = {
  user: AuthSession | null;
  profile: UserProfile | null;
  isBootstrapping: boolean;
  authError: string | null;
  dataMode: 'firebase' | 'demo';
  setUser: (user: AuthSession | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setBootstrapping: (value: boolean) => void;
  setAuthError: (value: string | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  profile: null,
  isBootstrapping: true,
  authError: null,
  dataMode,
  setUser: user =>
    set(state => ({
      user,
      profile: user ? state.profile : null,
    })),
  setProfile: profile => set({ profile }),
  setBootstrapping: isBootstrapping => set({ isBootstrapping }),
  setAuthError: authError => set({ authError }),
  reset: () =>
    set({
      user: null,
      profile: null,
      isBootstrapping: false,
      authError: null,
    }),
}));
