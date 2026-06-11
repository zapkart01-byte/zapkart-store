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
import { confirmOTP, sendOTP } from '../../src/services/authService';
import { getStoreByOwnerPhone } from '../../src/services/storeService';
import { useAuthStore } from '../../src/stores/useAuthStore';

// OTP Code Verification Screen
export default function OTPScreen() {
  const router = useRouter();
  const { phone, verificationId: initialVerificationId } = useLocalSearchParams();

  const [verificationId, setVerificationId] = useState(initialVerificationId || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(null);

  const inputRefs = useRef([]);
  const { setUser, setStoreProfile } = useAuthStore();

  // Resend OTP countdown timer logic
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Automatically submits code when all 6 digits are filled
  useEffect(() => {
    if (code.every((digit) => digit !== '')) {
      handleVerify();
    }
  }, [code]);

  // Formats phone number for display
  const displayPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';

  // Handles character entry in the individual code blocks
  const handleCodeChange = (text, index) => {
    setError(null);
    const newCode = [...code];
    // Take only the last typed character
    newCode[index] = text.slice(-1);
    setCode(newCode);

    // Auto-focus next input block
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handles backspace key navigation
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Requests a new OTP SMS code
  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError(null);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    const fullPhone = `+91${phone}`;
    const verifier = Platform.OS === 'web' ? window.recaptchaVerifier : null;

    try {
      const res = await sendOTP(fullPhone, verifier);
      if (res.success) {
        setVerificationId(res.verificationId || '');
        setTimer(60);
      } else {
        setError(res.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Verifies the code and checks user registration status
  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6 || loading) return;

    setLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      const res = await confirmOTP(verificationId, fullCode, phone || '');
      if (res.success && res.user) {
        setUser(res.user);

        // Fetch store profile by owner phone from Supabase
        const storeProfile = await getStoreByOwnerPhone(res.user.phoneNumber || `+91${phone}`);

        if (storeProfile) {
          setStoreProfile(storeProfile);
          if (storeProfile.status === 'active') {
            router.replace('/(tabs)');
          } else if (storeProfile.status === 'pending') {
            router.replace('/register/pending');
          } else if (storeProfile.status === 'suspended') {
            setError('This store account has been suspended. Please contact support.');
          } else {
            router.replace('/register/pending');
          }
        } else {
          // Store doesn't exist, route to step 1 of registration
          router.replace('/register/store-details');
        }
      } else {
        setError(res.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
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
          className="bg-white"
        >
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-text-primary">Verify Number</Text>
            <Text className="text-sm text-text-secondary text-center mt-2">
              We have sent a 6-digit verification code to{'\n'}
              <Text className="font-semibold text-text-primary">{displayPhone}</Text>
            </Text>
          </View>

          {/* OTP Digit Blocks */}
          <View className="flex-row justify-between mb-8 px-2">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 border border-border bg-surface text-center text-text-primary text-xl font-bold rounded-xl"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!loading}
              />
            ))}
          </View>

          {/* Error Message Section */}
          {error ? (
            <View className="bg-error-soft border border-red-100 rounded-xl p-3 mb-6">
              <Text className="text-error text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Verify CTA Button */}
          <TouchableOpacity
            className={`w-full h-[52px] rounded-xl items-center justify-center ${
              code.join('').length === 6 && !loading ? 'bg-brand active:bg-brand-dark' : 'bg-gray-300'
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

          {/* Resend Link and Countdown */}
          <View className="flex-row justify-center mt-6">
            {timer > 0 ? (
              <Text className="text-text-secondary text-sm">
                Resend code in <Text className="font-semibold text-text-primary">{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text className="text-brand font-bold text-sm">Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
