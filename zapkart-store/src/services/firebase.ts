import { getApp, getApps, initializeApp } from 'firebase/app';

/**
 * Firebase is kept ONLY for FCM push notifications.
 * Phone Auth has been removed and replaced by 2Factor.in via backend.
 * Do NOT import firebase/auth anywhere in the app.
 *
 * PRD Section 2.1 — Firebase items to keep:
 *  - Firebase project ✅
 *  - google-services.json ✅
 *  - @react-native-firebase/app ✅
 *  - @react-native-firebase/messaging ✅
 */

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (singleton guard)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;

// NOTE: FCM push notification token registration is handled in
// src/services/notificationService.ts using @react-native-firebase/messaging
// Do NOT add auth exports here.
