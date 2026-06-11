import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { auth } from '../src/services/firebase';
import { supabase } from '../src/services/supabase';
import { getStoreByOwnerPhone } from '../src/services/storeService';
import { useAuthStore } from '../src/stores/useAuthStore';
import '../global.css';

const REQUIRED_ENV_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_MAPTILER_KEY',
];

// Entry layout wrapper for the ZapKart Store app
export default function RootLayout() {
  const [missingVars, setMissingVars] = useState([]);
  const { setUser, setStoreProfile, setLoading, setInitialized } = useAuthStore();

  // Validate env variables on boot
  useEffect(() => {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    setMissingVars(missing);
  }, []);

  // Listen to Firebase authentication state changes
  useEffect(() => {
    if (missingVars.length > 0) return;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser?.phoneNumber) {
        try {
          const profile = await getStoreByOwnerPhone(firebaseUser.phoneNumber);
          setStoreProfile(profile);
        } catch (err) {
          // Profile check error handled gracefully
          setStoreProfile(null);
        }
      } else {
        setStoreProfile(null);
      }

      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, [missingVars]);

  // Listen to AppState transitions (foreground/background) to sync store profile status
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const firebaseUser = auth.currentUser;
        if (firebaseUser?.phoneNumber) {
          try {
            const profile = await getStoreByOwnerPhone(firebaseUser.phoneNumber);
            setStoreProfile(profile);
          } catch (err) {
            // Profile re-fetch error handled gracefully
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Render error screen if any environment variables are missing
  if (missingVars.length > 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="items-center border border-red-200 bg-red-50 p-6 rounded-xl shadow-sm">
            <Text className="text-xl font-bold text-red-600 mb-2">
              Configuration Error
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              The application cannot start because the following environment variables are missing from your .env file:
            </Text>
            <View className="w-full bg-white border border-red-100 rounded-lg p-4">
              {missingVars.map((v) => (
                <Text key={v} className="font-mono text-sm text-red-500 my-1">
                  • {v}
                </Text>
              ))}
            </View>
            <Text className="text-xs text-gray-500 mt-6 text-center">
              Please create a .env file based on .env.example and rebuild.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#0D0D0D',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
    </Stack>
  );
}
