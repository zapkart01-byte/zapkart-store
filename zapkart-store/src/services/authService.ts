import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getStoreByOwnerPhone } from './storeService';

// ─────────────────────────────────────────────────
// Sandbox bypass — avoids real OTP during development
// ─────────────────────────────────────────────────
const SANDBOX_PHONE = '9876543210';
const SANDBOX_OTP   = '123456';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export interface SendOTPResponse {
  success: boolean;
  isSandbox?: boolean;
  error?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    phone: string;
    role?: string;
  };
  storeProfile?: any;
  error?: string;
}

/**
 * Sends a 6-digit OTP to the given 10-digit Indian phone number.
 * Calls the backend which triggers the 2Factor.in SMS gateway.
 * Falls back to sandbox mode for +919876543210 without a real SMS.
 */
export async function sendOTP(phone: string): Promise<SendOTPResponse> {
  // Normalize — strip country code, keep 10 digits
  const cleaned = phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);

  // Sandbox bypass — no network call needed
  if (cleaned === SANDBOX_PHONE) {
    return { success: true, isSandbox: true };
  }

  try {
    const response = await fetch(`${API_URL}/auth/mobile/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: `+91${cleaned}`, userType: 'store' }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error || json.message || 'Failed to send OTP. Please try again.' };
    }

    return { success: true };
  } catch (err: any) {
    // Network failure — inform user
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
}

/**
 * Verifies the 6-digit OTP entered by the user.
 * On success, the backend returns a JWT token + user record.
 * The token is persisted to AsyncStorage for session continuity.
 */
export async function verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
  const cleaned = phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);

  // ── Sandbox bypass ──
  if (cleaned === SANDBOX_PHONE && otp === SANDBOX_OTP) {
    const mockToken = 'sandbox_token_' + Date.now();
    const mockUser  = { id: 'sandbox-store-owner', phone: `+91${cleaned}`, role: 'store' };

    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('auth_phone', `+91${cleaned}`);

    // Try to look up the real store profile in Supabase even for sandbox
    const storeProfile = await getStoreByOwnerPhone(`+91${cleaned}`).catch(() => null);

    return { success: true, token: mockToken, user: mockUser, storeProfile };
  }

  try {
    const response = await fetch(`${API_URL}/auth/mobile/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: `+91${cleaned}`, otp }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error || json.message || 'Invalid OTP. Please try again.' };
    }

    // Backend returns { success, user, tokens: { access_token, refresh_token }, isNewUser }
    const { tokens, user } = json;
    const token = tokens?.access_token || '';

    // Persist session — store both access and refresh tokens
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_phone', `+91${cleaned}`);
    if (tokens?.refresh_token) {
      await AsyncStorage.setItem('auth_refresh_token', tokens.refresh_token);
    }

    // Fetch store profile from Supabase
    const storeProfile = await getStoreByOwnerPhone(`+91${cleaned}`).catch(() => null);

    return { success: true, token, user, storeProfile };

  } catch (err: any) {
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
}

/**
 * Clears the stored session from AsyncStorage and signs out from Supabase.
 */
export async function logOut(): Promise<void> {
  await AsyncStorage.multiRemove(['auth_token', 'auth_phone']);
  await supabase.auth.signOut();
}

/**
 * Reads the persisted JWT token from AsyncStorage.
 * Returns null if no session exists.
 */
export async function getStoredSession(): Promise<{ token: string; phone: string } | null> {
  const token = await AsyncStorage.getItem('auth_token');
  const phone = await AsyncStorage.getItem('auth_phone');
  if (token && phone) return { token, phone };
  return null;
}
