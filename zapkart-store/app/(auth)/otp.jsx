import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { sendOTP, verifyOTP } from '../../src/services/authService';
import { useAuthStore } from '../../src/stores/useAuthStore';

/**
 * OTP verification screen — 6-digit code entry with auto-submit.
 * Verifies via backend (2Factor.in) and stores JWT token in Zustand + AsyncStorage.
 * Routes to: (tabs) → active store | /register → new store | /register/pending → pending
 */
export default function OTPScreen() {
  const router   = useRouter();
  const { phone, isSandbox } = useLocalSearchParams();

  const [code, setCode]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer]     = useState(60);
  const [error, setError]     = useState(null);

  const inputRefs = useRef([]);
  const { setToken, setUser, setStoreProfile } = useAuthStore();

  // ── Resend countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ── Auto-submit when all 6 digits filled ────────────────────────────────
  useEffect(() => {
    if (code.every((d) => d !== '')) {
      handleVerify();
    }
  }, [code]);

  const displayPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : '';

  // ── Digit input handlers ────────────────────────────────────────────────
  const handleCodeChange = (text, index) => {
    setError(null);
    const newCode = [...code];
    newCode[index] = text.slice(-1);
    setCode(newCode);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setError(null);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    try {
      const res = await sendOTP(phone || '');
      if (res.success) {
        setTimer(60);
      } else {
        setError(res.error || 'Failed to resend. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP and route ────────────────────────────────────────────────
  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6 || loading) return;

    setLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      const res = await verifyOTP(phone || '', fullCode);

      if (res.success && res.token) {
        // Persist to Zustand
        setToken(res.token);
        setUser(res.user ?? { id: 'unknown', phone: `+91${phone}` });

        const profile = res.storeProfile;
        setStoreProfile(profile);

        // Route based on store status
        if (!profile) {
          // No store registered yet → start registration
          router.replace('/register/store-details');
        } else if (profile.status === 'active') {
          router.replace('/(tabs)');
        } else if (profile.status === 'suspended') {
          setError('This store has been suspended. Please contact ZapKart support.');
          setCode(['', '', '', '', '', '']);
        } else {
          // pending or any other status → pending screen
          router.replace('/register/pending');
        }
      } else {
        setError(res.error || 'Invalid verification code. Please check and try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed. Please try again.');
      setCode(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-brand-soft rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">📱</Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary">Verify Number</Text>
            <Text className="text-sm text-text-secondary text-center mt-2 leading-5">
              We sent a 6-digit code to{'\n'}
              <Text className="font-semibold text-text-primary">{displayPhone}</Text>
            </Text>
            {isSandbox === '1' && (
              <View className="mt-3 bg-warning-soft border border-yellow-200 rounded-xl px-4 py-2">
                <Text className="text-xs text-warning text-center font-medium">
                  🧪 Sandbox mode — use OTP <Text className="font-bold">123456</Text>
                </Text>
              </View>
            )}
          </View>

          {/* 6-digit OTP Input */}
          <View className="flex-row justify-between mb-8 px-1">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-[48px] h-[56px] border rounded-xl text-center text-text-primary text-2xl font-bold bg-surface ${
                  digit ? 'border-brand' : error ? 'border-error' : 'border-border'
                }`}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!loading}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error-soft border border-red-100 rounded-xl p-3 mb-5">
              <Text className="text-error text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            className={`w-full h-[52px] rounded-xl items-center justify-center ${
              code.join('').length === 6 && !loading
                ? 'bg-brand active:bg-brand-dark'
                : 'bg-gray-300'
            }`}
            disabled={code.join('').length !== 6 || loading}
            onPress={handleVerify}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Verify & Proceed</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View className="flex-row justify-center mt-6">
            {timer > 0 ? (
              <Text className="text-text-secondary text-sm">
                Resend code in{' '}
                <Text className="font-semibold text-text-primary">{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text className="text-brand font-bold text-sm">Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Change number */}
          <TouchableOpacity
            className="items-center mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-text-secondary text-sm">
              Wrong number?{' '}
              <Text className="text-brand font-semibold">Change</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
