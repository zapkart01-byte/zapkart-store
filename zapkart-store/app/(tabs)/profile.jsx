import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';

// Store profile settings management page with open/closed switches and sign-out controls
export default function ProfileScreen() {
  const router = useRouter();
  const { storeProfile, setStoreProfile, logout } = useAuthStore();
  const [updatingOpenStatus, setUpdatingOpenStatus] = useState(false);

  // Toggles the store open/closed status in Supabase table
  const toggleStoreOpenStatus = async (currentOpenStatus) => {
    if (!storeProfile?.id || updatingOpenStatus) return;
    setUpdatingOpenStatus(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .update({ is_open: !currentOpenStatus })
        .eq('id', storeProfile.id)
        .select()
        .single();

      if (error) throw error;
      setStoreProfile(data);
      Alert.alert(
        'Status Updated',
        `Your store is now ${!currentOpenStatus ? 'OPEN' : 'CLOSED'} to receive orders.`
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update store status');
    } finally {
      setUpdatingOpenStatus(false);
    }
  };

  // Sign out user and route back to login page
  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!storeProfile) return null;

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}>
      {/* Greeting Header info panel */}
      <View className="bg-white border border-border rounded-3xl p-5 mb-4 items-center shadow-sm">
        <View className="w-16 h-16 bg-brand-soft rounded-full justify-center items-center mb-3">
          <Ionicons name="storefront" size={32} color="#FF6B00" />
        </View>
        <Text className="text-text-primary text-xl font-bold">{storeProfile.store_name}</Text>
        <Text className="text-text-secondary text-sm mt-1">{storeProfile.owner_name} • Partner</Text>
      </View>

      {/* Store Status Toggle Section */}
      <View className="bg-white border border-border rounded-2xl p-4 mb-4 flex-row justify-between items-center shadow-sm">
        <View className="flex-row items-center flex-1 pr-2">
          <View className="w-10 h-10 bg-surface rounded-full justify-center items-center border border-border">
            <Ionicons
              name={storeProfile.is_open ? 'flash' : 'flash-off'}
              size={20}
              color={storeProfile.is_open ? '#16A34A' : '#9CA3AF'}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-text-primary font-bold text-sm">Accepting Orders</Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              {storeProfile.is_open ? 'Store is open and online' : 'Store is offline'}
            </Text>
          </View>
        </View>
        
        {updatingOpenStatus ? (
          <ActivityIndicator color="#FF6B00" style={{ marginRight: 10 }} />
        ) : (
          <Switch
            value={storeProfile.is_open}
            onValueChange={() => toggleStoreOpenStatus(storeProfile.is_open)}
            trackColor={{ false: '#D1D5DB', true: '#DCFCE7' }}
            thumbColor={storeProfile.is_open ? '#16A34A' : '#9CA3AF'}
          />
        )}
      </View>

      {/* Store Info Cards section */}
      <View className="bg-white border border-border rounded-2xl p-5 mb-4 shadow-sm">
        <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Store Details
        </Text>
        <View className="flex-row items-center justify-between py-2.5 border-b border-border">
          <Text className="text-text-secondary text-sm">Store Category</Text>
          <Text className="text-text-primary font-semibold text-sm capitalize">{storeProfile.store_type}</Text>
        </View>
        <View className="flex-row items-center justify-between py-2.5 border-b border-border">
          <Text className="text-text-secondary text-sm">Owner Mobile</Text>
          <Text className="text-text-primary font-semibold text-sm">{storeProfile.owner_phone}</Text>
        </View>
        <View className="flex-row items-center justify-between py-2.5 border-b border-border">
          <Text className="text-text-secondary text-sm">Delivery Radius</Text>
          <Text className="text-text-primary font-semibold text-sm">{storeProfile.delivery_radius_km} km</Text>
        </View>
        <View className="flex-row items-center justify-between py-2.5">
          <Text className="text-text-secondary text-sm">Platform Commission</Text>
          <Text className="text-brand font-semibold text-sm">18%</Text>
        </View>
      </View>

      {/* Location Details card */}
      <View className="bg-white border border-border rounded-2xl p-5 mb-4 shadow-sm">
        <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Location Coordinates
        </Text>
        <View className="flex-row items-start mb-3">
          <Ionicons name="location" size={16} color="#6B7280" style={{ marginTop: 2 }} />
          <Text className="text-text-primary text-sm font-semibold ml-2 flex-1">{storeProfile.address}</Text>
        </View>
        <View className="bg-surface rounded-xl p-3 flex-row gap-4 border border-border">
          <View>
            <Text className="text-[10px] text-text-secondary uppercase">Latitude</Text>
            <Text className="text-text-primary text-sm font-semibold mt-0.5">{storeProfile.lat?.toFixed(6) || '---'}</Text>
          </View>
          <View>
            <Text className="text-[10px] text-text-secondary uppercase">Longitude</Text>
            <Text className="text-text-primary text-sm font-semibold mt-0.5">{storeProfile.lng?.toFixed(6) || '---'}</Text>
          </View>
        </View>
      </View>

      {/* Settlement Bank Details card */}
      <View className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
        <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Settlement Bank
        </Text>
        <View className="flex-row items-center justify-between py-2 border-b border-border">
          <Text className="text-text-secondary text-sm">Account Number</Text>
          <Text className="text-text-primary font-semibold text-sm">
            •••• •••• {storeProfile.bank_account?.slice(-4) || '----'}
          </Text>
        </View>
        <View className="flex-row items-center justify-between py-2 border-b border-border">
          <Text className="text-text-secondary text-sm">IFSC Code</Text>
          <Text className="text-text-primary font-semibold text-sm">{storeProfile.bank_ifsc || '----'}</Text>
        </View>
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-text-secondary text-sm">GSTIN Status</Text>
          <Text className="text-text-primary font-semibold text-sm">{storeProfile.gstin || 'Not Provided'}</Text>
        </View>
      </View>

      {/* Logout button CTA */}
      <TouchableOpacity
        className="w-full h-14 border border-error rounded-2xl justify-center items-center active:bg-red-50 mb-6"
        onPress={handleLogout}
      >
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 6 }} />
          <Text className="text-error font-bold text-base">Sign Out Account</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
