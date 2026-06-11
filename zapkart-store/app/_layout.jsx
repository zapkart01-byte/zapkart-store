import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, AppState, Text, View } from 'react-native';
import { getStoredSession } from '../src/services/authService';
import { getStoreByOwnerPhone } from '../src/services/storeService';
import { useAuthStore } from '../src/stores/useAuthStore';
import '../global.css';

/**
 * Root layout for the ZapKart Store app.
 * Bootstraps auth session from AsyncStorage on app start.
 * Uses JWT-based auth (2Factor.in via backend) — no Firebase auth here.
 * Firebase is imported only in services that need FCM push notifications.
 */
export default function RootLayout() {
  const { setToken, setUser, setStoreProfile, setLoading, setInitialized } = useAuthStore();

  // ── Session Bootstrap ──────────────────────────────────────────────────────
  // On app start, check AsyncStorage for a persisted JWT token.
  // If found, restore the auth state and fetch the store profile.
  useEffect(() => {
    const bootstrapSession = async () => {
      setLoading(true);
      try {
        const session = await getStoredSession();

        if (session) {
          // Restore minimal user object from stored phone
          setToken(session.token);
          setUser({ id: 'restored', phone: session.phone });

          // Fetch full store profile from Supabase
          const profile = await getStoreByOwnerPhone(session.phone).catch(() => null);
          setStoreProfile(profile);
        }
      } catch (err) {
        // Session bootstrap failure — user will land on login screen
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    bootstrapSession();
  }, []);

  // ── AppState listener ──────────────────────────────────────────────────────
  // When app comes back to foreground, re-sync the store profile
  // (e.g. admin may have approved/suspended the store while app was backgrounded)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        const session = await getStoredSession().catch(() => null);
        if (session?.phone) {
          const profile = await getStoreByOwnerPhone(session.phone).catch(() => null);
          setStoreProfile(profile);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#0D0D0D',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="(auth)"     options={{ headerShown: false }} />
      <Stack.Screen name="register"   options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"     options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
    </Stack>
  );
}
