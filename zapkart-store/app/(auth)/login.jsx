import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { sendOTP } from '../../src/services/authService';

/**
 * Phone login screen — enters 10-digit Indian mobile number.
 * OTP is sent via backend → 2Factor.in (no Firebase, no reCaptcha).
 * Sandbox: use 9876543210 to bypass real SMS during development.
 */
export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const isValidPhone = phoneNumber.replace(/\D/g, '').length === 10;

  /**
   * Sends OTP to the entered phone number via the ZapKart backend.
   * On success, navigates to the OTP verification screen.
   */
  const handleSendOTP = async () => {
    if (!isValidPhone || loading) return;

    setLoading(true);
    setError(null);

    const cleaned = phoneNumber.replace(/\D/g, '');

    try {
      const res = await sendOTP(cleaned);

      if (res.success) {
        router.push({
          pathname: '/(auth)/otp',
          params: { phone: cleaned, isSandbox: res.isSandbox ? '1' : '0' },
        });
      } else {
        setError(res.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
          {/* Brand Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-brand rounded-3xl items-center justify-center mb-5 shadow-sm">
              <Text className="text-4xl">⚡</Text>
            </View>
            <Text className="text-3xl font-bold text-text-primary">ZapKart</Text>
            <Text className="text-sm text-text-secondary mt-1">Store Partner Portal</Text>
          </View>

          {/* Heading */}
          <Text className="text-xl font-bold text-text-primary mb-1">Sign In</Text>
          <Text className="text-sm text-text-secondary mb-6">
            Enter your mobile number to receive a verification code
          </Text>

          {/* Phone Input */}
          <View className="mb-2">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Mobile Number
            </Text>
            <View
              className={`flex-row items-center border rounded-xl px-4 h-[52px] bg-surface ${
                error ? 'border-error' : 'border-border'
              }`}
            >
              <Text className="text-text-primary font-bold mr-2">+91</Text>
              <View className="w-[1px] h-6 bg-border mr-3" />
              <TextInput
                className="flex-1 text-text-primary font-medium text-base h-full"
                placeholder="98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/\D/g, ''));
                  setError(null);
                }}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
              {phoneNumber.length > 0 && (
                <TouchableOpacity onPress={() => { setPhoneNumber(''); setError(null); }}>
                  <Text className="text-text-secondary text-lg">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error-soft border border-red-100 rounded-xl p-4 mb-4 mt-2">
              <Text className="text-error text-sm text-center font-medium">{error}</Text>
            </View>
          ) : (
            <View className="mb-4" />
          )}

          {/* Send OTP Button */}
          <TouchableOpacity
            className={`w-full h-[52px] rounded-xl items-center justify-center mt-2 ${
              isValidPhone && !loading ? 'bg-brand active:bg-brand-dark' : 'bg-gray-300'
            }`}
            disabled={!isValidPhone || loading}
            onPress={handleSendOTP}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Send Verification Code</Text>
            )}
          </TouchableOpacity>

          {/* Sandbox hint */}
          <View className="mt-6 bg-surface border border-border rounded-xl p-4">
            <Text className="text-xs text-text-secondary text-center leading-5">
              🧪 For testing, use{' '}
              <Text className="font-bold text-text-primary">9876543210</Text>
              {' '}with OTP{' '}
              <Text className="font-bold text-text-primary">123456</Text>
            </Text>
          </View>

          {/* Legal text */}
          <Text className="text-center text-xs text-text-secondary mt-6 px-4 leading-5">
            By signing in, you agree to ZapKart partner terms and verify that this device belongs to the store owner.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
