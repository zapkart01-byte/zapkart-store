import { useRouter } from 'expo-router';
import { RecaptchaVerifier } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
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
import { auth } from '../../src/services/firebase';
import { sendOTP } from '../../src/services/authService';

// Phone login screen with locked +91 prefix and formatting
export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const recaptchaRef = useRef(null);

  // Formats and returns user-friendly explanations for common Firebase Auth issues
  const getFriendlyErrorMessage = (errMsg) => {
    if (!errMsg) return null;
    if (errMsg.includes('operation-not-allowed') || errMsg.includes('SMS unable to be sent')) {
      return (
        <View>
          <Text className="text-error text-sm text-center font-bold">
            Firebase SMS is not enabled for this region.
          </Text>
          <Text className="text-text-secondary text-xs text-center mt-2 leading-5">
            💡 For testing, please use the built-in sandbox number:
            {"\n"}
            <Text className="font-bold text-text-primary text-sm">Phone: 98765 43210</Text> • <Text className="font-bold text-text-primary text-sm">OTP: 123456</Text>
            {"\n\n"}
            To use a real phone number, enable your region in the Firebase Console under:
            {"\n"}
            <Text className="font-semibold text-text-primary">Authentication ➔ Settings ➔ SMS Region Policy</Text>.
          </Text>
        </View>
      );
    }
    return <Text className="text-error text-sm text-center font-medium">{errMsg}</Text>;
  };

  // Initialize invisible Recaptcha Verifier on Web platforms
  useEffect(() => {
    if (Platform.OS === 'web' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {},
        });
      } catch (err) {
        // Recaptcha initialization warning ignored for development
      }
    }
  }, []);

  // Validates the phone format (10-digit numeric check)
  const isValidPhone = phoneNumber.replace(/\D/g, '').length === 10;

  // Handles sending the verification code to the phone number
  const handleSendOTP = async () => {
    if (!isValidPhone) return;
    setLoading(true);
    setError(null);

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    const fullPhone = `+91${cleanedPhone}`;

    // On native platforms, recaptcha is ignored if it is the sandbox phone
    const verifier = Platform.OS === 'web' ? window.recaptchaVerifier : null;

    try {
      const res = await sendOTP(fullPhone, verifier);
      if (res.success) {
        // Navigate to OTP verification page and pass phone and verification ID
        router.push({
          pathname: '/(auth)/otp',
          params: {
            phone: cleanedPhone,
            verificationId: res.verificationId || '',
          },
        });
      } else {
        setError(res.error || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
          {/* Logo Brand Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-brand rounded-2xl items-center justify-center mb-4 shadow-sm">
              {/* Bolt Icon Emoji */}
              <Text className="text-3xl text-white">⚡</Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary">ZapKart</Text>
            <Text className="text-sm text-text-secondary mt-1">Store Partner Portal</Text>
          </View>

          {/* Form Fields */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-text-primary mb-2">
              Mobile Number
            </Text>
            <View className="flex-row items-center border border-border bg-surface rounded-xl px-4 h-12">
              <Text className="text-text-primary font-semibold mr-2">+91</Text>
              <View className="w-[1] h-6 bg-border mr-3" />
              <TextInput
                className="flex-1 text-text-primary font-medium h-full"
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
              />
            </View>
          </View>

          {/* Error Message Section */}
          {error ? (
            <View className="bg-error-soft border border-red-100 rounded-xl p-4 mb-6">
              {getFriendlyErrorMessage(error)}
            </View>
          ) : null}

          {/* Action CTA Button */}
          <TouchableOpacity
            className={`w-full h-[52px] rounded-xl items-center justify-center ${
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

          {/* Info helper */}
          <Text className="text-center text-xs text-text-secondary mt-6 px-4">
            By signing in, you agree to ZapKart partner terms and verify that this device belongs to the store owner.
          </Text>

          {/* Invisible Recaptcha container required for Web */}
          {Platform.OS === 'web' && <View id="recaptcha-container" />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


