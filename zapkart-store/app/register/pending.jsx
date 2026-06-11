import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { supabase } from '../../src/services/supabase';
import { getStoreByOwnerPhone } from '../../src/services/storeService';

// Checklist items displayed on the pending review screen
const VERIFICATION_STEPS = [
  {
    label: 'Application received',
    icon: 'document-text',
    done: true,
  },
  {
    label: 'Documents under review',
    icon: 'shield-checkmark',
    done: false,
    inProgress: true,
  },
  {
    label: 'Store activation',
    icon: 'storefront',
    done: false,
  },
];

// Application under review screen — shown after registration is submitted
export default function PendingScreen() {
  const router = useRouter();
  const { storeProfile, setStoreProfile, logout, user } = useAuthStore();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isChecking, setIsChecking] = useState(false);

  // Pulsing animation for the progress indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Subscribe to realtime store status changes so user knows when approved
  useEffect(() => {
    if (!storeProfile?.id) return;

    const channel = supabase
      .channel(`store-status-${storeProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stores',
          filter: `id=eq.${storeProfile.id}`,
        },
        (payload) => {
          const updatedStore = payload.new;
          setStoreProfile(updatedStore);

          // Automatically redirect when store is activated
          if (updatedStore.status === 'active') {
            router.replace('/(tabs)');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeProfile?.id]);

  // Set up a 10-second polling interval as a fallback for the status check
  useEffect(() => {
    const phone = storeProfile?.owner_phone || user?.phone;
    if (!phone) return;

    const interval = setInterval(() => {
      getStoreByOwnerPhone(phone)
        .then((freshProfile) => {
          if (freshProfile) {
            setStoreProfile(freshProfile);
            if (freshProfile.status === 'active') {
              router.replace('/(tabs)');
            }
          }
        })
        .catch(() => {
          // Polling errors are ignored to prevent disrupting UI
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [storeProfile?.owner_phone, user?.phone]);

  /**
   * Checks the store status manually from Supabase and redirects if active.
   */
  const handleCheckStatus = async () => {
    const phone = storeProfile?.owner_phone || user?.phone;
    if (!phone) return;
    setIsChecking(true);
    try {
      const freshProfile = await getStoreByOwnerPhone(phone);
      if (freshProfile) {
        setStoreProfile(freshProfile);
        if (freshProfile.status === 'active') {
          router.replace('/(tabs)');
        }
      }
    } catch (err) {
      // Status check errors are caught gracefully
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Handles user sign out from the pending screen.
   */
  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        {/* Pulsing waiting icon */}
        <View className="items-center mb-8">
          <Animated.View
            style={{ transform: [{ scale: pulseAnim }] }}
            className="w-24 h-24 rounded-full bg-warning-soft items-center justify-center mb-6"
          >
            <Ionicons name="hourglass-outline" size={44} color="#F59E0B" />
          </Animated.View>

          <Text className="text-2xl font-bold text-text-primary text-center">
            Application Under Review
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-3 leading-6 px-4">
            Thank you for registering! Our team is reviewing your application
            and documents. This usually takes 24–48 hours.
          </Text>
        </View>

        {/* Verification checklist */}
        <View className="bg-surface border border-border rounded-2xl p-5 mb-8">
          <Text className="text-sm font-bold text-text-primary mb-4">
            Verification Progress
          </Text>

          {VERIFICATION_STEPS.map((step, index) => (
            <View key={step.label} className="flex-row items-center mb-4 last:mb-0">
              {/* Step status icon */}
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step.done
                    ? 'bg-success'
                    : step.inProgress
                    ? 'bg-warning'
                    : 'bg-gray-200'
                }`}
              >
                {step.done ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : step.inProgress ? (
                  <Ionicons name="time" size={16} color="#FFFFFF" />
                ) : (
                  <Ionicons name="ellipse" size={8} color="#9CA3AF" />
                )}
              </View>

              {/* Step label */}
              <Text
                className={`ml-3 text-sm flex-1 ${
                  step.done
                    ? 'text-success font-semibold'
                    : step.inProgress
                    ? 'text-warning font-semibold'
                    : 'text-text-secondary'
                }`}
              >
                {step.label}
              </Text>

              {/* Status badge */}
              {step.done ? (
                <View className="bg-success-soft px-2 py-0.5 rounded-full">
                  <Text className="text-success text-xs font-medium">Done</Text>
                </View>
              ) : null}
              {step.inProgress ? (
                <View className="bg-warning-soft px-2 py-0.5 rounded-full">
                  <Text className="text-warning text-xs font-medium">In Progress</Text>
                </View>
              ) : null}
              {!step.done && !step.inProgress ? (
                <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                  <Text className="text-text-secondary text-xs">Pending</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Store profile summary card */}
        {storeProfile && (
          <View className="bg-brand-soft border border-orange-100 rounded-2xl p-5 mb-8">
            <Text className="text-sm font-bold text-text-primary mb-3">
              Your Store
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="storefront" size={16} color="#FF6B00" />
              <Text className="text-sm text-text-primary ml-2 font-medium">
                {storeProfile.store_name || 'Unnamed Store'}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="person" size={16} color="#FF6B00" />
              <Text className="text-sm text-text-secondary ml-2">
                {storeProfile.owner_name || 'Store Owner'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#FF6B00" />
              <Text className="text-sm text-text-secondary ml-2 flex-1" numberOfLines={2}>
                {storeProfile.address || 'Address pending'}
              </Text>
            </View>
          </View>
        )}

        {/* Help and support section */}
        <View className="bg-info-soft border border-blue-100 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="help-circle" size={20} color="#1D4ED8" />
            <Text className="text-info text-sm ml-2 flex-1 leading-5">
              If your application takes longer than expected, please contact our
              support team at{' '}
              <Text className="font-bold">support@zapkart.in</Text>
            </Text>
          </View>
        </View>

        {/* Check Status button */}
        <TouchableOpacity
          className="w-full h-[48px] bg-brand rounded-xl items-center justify-center mb-3 flex-row"
          onPress={handleCheckStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold text-sm">
                Check Status
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity
          className="w-full h-[48px] border border-border rounded-xl items-center justify-center"
          onPress={handleLogout}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text className="text-error font-medium text-sm ml-2">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
