import { User } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from '../services/firebase';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  storeProfile: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setStoreProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
}

// Global authentication state store for the Expo App
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  storeProfile: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setStoreProfile: (storeProfile) => set({ storeProfile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  logout: async () => {
    await auth.signOut();
    await supabase.auth.signOut();
    set({ user: null, storeProfile: null });
  },
}));
