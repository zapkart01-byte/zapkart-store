import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { logOut } from '../services/authService';

interface AuthUser {
  id: string;
  phone: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  storeProfile: any | null;
  loading: boolean;
  initialized: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setStoreProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
}

/**
 * Global authentication state store for the ZapKart Store app.
 * Uses JWT token (from backend) instead of Firebase User object.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  storeProfile: null,
  loading: true,
  initialized: false,

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setStoreProfile: (storeProfile) => set({ storeProfile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  logout: async () => {
    await logOut();
    await AsyncStorage.multiRemove(['auth_token', 'auth_phone']);
    set({ token: null, user: null, storeProfile: null });
  },
}));
