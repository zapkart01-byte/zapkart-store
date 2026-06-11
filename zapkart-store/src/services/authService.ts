import {
  PhoneAuthProvider,
  signInAnonymously,
  signInWithCredential,
  signInWithPhoneNumber,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { supabase } from './supabase';
import { getStoreByOwnerPhone } from './storeService';

// Bypasses Firebase for local testing with this specific phone number
const SANDBOX_PHONE = '+919876543210';
const SANDBOX_CODE = '123456';

export interface OTPResponse {
  success: boolean;
  verificationId?: string;
  isSandbox?: boolean;
  error?: string;
}

// Sends an OTP to the given phone number via Firebase
export async function sendOTP(phone: string, recaptchaVerifier: any): Promise<OTPResponse> {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  // Sandbox bypass check
  if (formattedPhone === SANDBOX_PHONE) {
    return { success: true, isSandbox: true, verificationId: 'sandbox_verification' };
  }

  try {
    // Attempt standard Firebase SMS OTP
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return {
      success: true,
      verificationId: confirmationResult.verificationId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Firebase phone authentication failed',
    };
  }
}

// Confirms the OTP code and authenticates the user
export async function confirmOTP(
  verificationId: string,
  code: string,
  phone: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  // Sandbox check
  if (verificationId === 'sandbox_verification' && code === SANDBOX_CODE) {
    // For sandbox, we can check Supabase directly or simulate a user session.
    // However, to satisfy Firebase Auth on the client, we sign in using a custom token or standard anonymous session if needed,
    // or just return success with a mock user. Since we need a valid Firebase UID in orders/tables,
    // we can sign in anonymously or use standard credentials.
    // Let's create or sign in anonymously in Firebase Auth for sandbox testing.
    try {
      const result = await signInAnonymously(auth);
      // Tag the user's phone in a custom property or just set it locally
      // For sandbox, we mock the phoneNumber property
      const mockUser = {
        ...result.user,
        phoneNumber: formattedPhone,
      } as User;
      return { success: true, user: mockUser };
    } catch (err: any) {
      // Fallback: If Anonymous Sign-in is disabled in Firebase, use in-memory mock user
      const mockUser = {
        uid: 'sandbox_user_uid_123',
        phoneNumber: formattedPhone,
        emailVerified: true,
      } as any as User;
      return { success: true, user: mockUser };
    }
  }

  try {
    // Normal flow
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const result = await signInWithCredential(auth, credential);
    return { success: true, user: result.user };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Verification code is invalid or expired',
    };
  }
}

// Log out the active session
export async function logOut(): Promise<void> {
  await signOut(auth);
  await supabase.auth.signOut();
}
