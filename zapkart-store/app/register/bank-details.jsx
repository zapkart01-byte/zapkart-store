import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import StepProgress from '../../components/registration/StepProgress';

// Step 2: Bank details form — account number, IFSC, GSTIN, and commission disclosure
export default function BankDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Form state for banking fields
  const [bankAccount, setBankAccount] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);

  // Per-field validation error state
  const [errors, setErrors] = useState({
    bankAccount: '',
    confirmAccount: '',
    bankIfsc: '',
    gstin: '',
  });

  // Validates IFSC code format (4 letters + 0 + 6 alphanumeric)
  const isValidIFSC = (ifsc) => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
  };

  // Validates GSTIN format (15-character alphanumeric Indian GST number)
  const isValidGSTIN = (gst) => {
    if (!gst) return true; // GSTIN is optional
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
      gst.toUpperCase()
    );
  };

  // Validates all banking fields before submission
  const validateForm = () => {
    const newErrors = {
      bankAccount: '',
      confirmAccount: '',
      bankIfsc: '',
      gstin: '',
    };
    let isValid = true;

    if (!bankAccount.trim()) {
      newErrors.bankAccount = 'Bank account number is required';
      isValid = false;
    } else if (bankAccount.trim().length < 9 || bankAccount.trim().length > 18) {
      newErrors.bankAccount = 'Account number must be 9–18 digits';
      isValid = false;
    }

    if (!confirmAccount.trim()) {
      newErrors.confirmAccount = 'Please re-enter your account number';
      isValid = false;
    } else if (confirmAccount.trim() !== bankAccount.trim()) {
      newErrors.confirmAccount = 'Account numbers do not match';
      isValid = false;
    }

    if (!bankIfsc.trim()) {
      newErrors.bankIfsc = 'IFSC code is required';
      isValid = false;
    } else if (!isValidIFSC(bankIfsc.trim())) {
      newErrors.bankIfsc = 'Invalid IFSC format (e.g., SBIN0001234)';
      isValid = false;
    }

    if (gstin.trim() && !isValidGSTIN(gstin.trim())) {
      newErrors.gstin = 'Invalid GSTIN format (e.g., 29AABCU9603R1ZM)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Navigate to step 3 with all accumulated registration data
  const handleNext = () => {
    if (!validateForm()) return;

    router.push({
      pathname: '/register/documents',
      params: {
        ...params,
        bankAccount: bankAccount.trim(),
        bankIfsc: bankIfsc.trim().toUpperCase(),
        gstin: gstin.trim().toUpperCase() || '',
      },
    });
  };

  // Navigate back to step 1
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Step progress bar */}
        <StepProgress currentStep={2} />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section header */}
          <View className="mb-6 mt-2">
            <Text className="text-xl font-bold text-text-primary">Bank Information</Text>
            <Text className="text-sm text-text-secondary mt-1">
              Your earnings will be settled to this bank account
            </Text>
          </View>

          {/* Commission disclosure banner */}
          <View className="bg-warning-soft border border-yellow-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={22} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-text-primary font-bold text-sm mb-1">
                  18% Platform Commission
                </Text>
                <Text className="text-text-secondary text-xs leading-5">
                  ZapKart charges 18% commission on every order. Your settlement
                  amount will be the order total minus the platform fee. Payouts
                  are processed weekly on Mondays.
                </Text>
              </View>
            </View>
          </View>

          {/* Bank Account Number Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Bank Account Number <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.bankAccount ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., 1234567890123"
              placeholderTextColor="#9CA3AF"
              value={bankAccount}
              onChangeText={(text) => {
                setBankAccount(text.replace(/\D/g, ''));
                if (errors.bankAccount) setErrors((prev) => ({ ...prev, bankAccount: '' }));
              }}
              keyboardType="number-pad"
              maxLength={18}
              secureTextEntry
            />
            {errors.bankAccount ? (
              <Text className="text-error text-xs mt-1">{errors.bankAccount}</Text>
            ) : null}
          </View>

          {/* Confirm Account Number */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Re-enter Account Number <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.confirmAccount ? 'border-error' : 'border-border'
              }`}
              placeholder="Re-enter account number"
              placeholderTextColor="#9CA3AF"
              value={confirmAccount}
              onChangeText={(text) => {
                setConfirmAccount(text.replace(/\D/g, ''));
                if (errors.confirmAccount)
                  setErrors((prev) => ({ ...prev, confirmAccount: '' }));
              }}
              keyboardType="number-pad"
              maxLength={18}
            />
            {errors.confirmAccount ? (
              <Text className="text-error text-xs mt-1">{errors.confirmAccount}</Text>
            ) : null}
            {!!confirmAccount && confirmAccount === bankAccount ? (
              <View className="flex-row items-center mt-1">
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text className="text-success text-xs ml-1">Account numbers match</Text>
              </View>
            ) : null}
          </View>

          {/* IFSC Code Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              IFSC Code <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.bankIfsc ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., SBIN0001234"
              placeholderTextColor="#9CA3AF"
              value={bankIfsc}
              onChangeText={(text) => {
                setBankIfsc(text.toUpperCase());
                if (errors.bankIfsc) setErrors((prev) => ({ ...prev, bankIfsc: '' }));
              }}
              autoCapitalize="characters"
              maxLength={11}
            />
            {errors.bankIfsc ? (
              <Text className="text-error text-xs mt-1">{errors.bankIfsc}</Text>
            ) : null}
          </View>

          {/* GSTIN Input (optional) */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-text-primary mb-2">
              GSTIN <Text className="text-text-secondary text-xs">(Optional)</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.gstin ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., 29AABCU9603R1ZM"
              placeholderTextColor="#9CA3AF"
              value={gstin}
              onChangeText={(text) => {
                setGstin(text.toUpperCase());
                if (errors.gstin) setErrors((prev) => ({ ...prev, gstin: '' }));
              }}
              autoCapitalize="characters"
              maxLength={15}
            />
            {errors.gstin ? (
              <Text className="text-error text-xs mt-1">{errors.gstin}</Text>
            ) : null}
          </View>

          {/* Security notice */}
          <View className="bg-surface border border-border rounded-xl p-4 mb-8">
            <View className="flex-row items-start">
              <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
              <Text className="text-text-secondary text-xs ml-2 flex-1 leading-5">
                Your banking information is encrypted and stored securely. We never
                share your data with third parties.
              </Text>
            </View>
          </View>

          {/* Navigation buttons row */}
          <View className="flex-row gap-3">
            {/* Back button */}
            <TouchableOpacity
              className="flex-1 h-[52px] border border-border rounded-xl items-center justify-center"
              onPress={handleBack}
            >
              <View className="flex-row items-center">
                <Ionicons name="arrow-back" size={18} color="#0D0D0D" />
                <Text className="text-text-primary font-bold text-base ml-2">Back</Text>
              </View>
            </TouchableOpacity>

            {/* Continue button */}
            <TouchableOpacity
              className="flex-[2] h-[52px] bg-brand rounded-xl items-center justify-center active:bg-brand-dark"
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-bold text-base mr-2">Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
