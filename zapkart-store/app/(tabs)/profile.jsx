import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';

/**
 * Profile & Settings screen — PRD Tasks 70–75.
 * - Store open/closed toggle
 * - KYC documents view
 * - Notification settings toggles
 * - Help & Support links
 * - Sign out
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { storeProfile, setStoreProfile, logout } = useAuthStore();

  const [updatingOpen, setUpdatingOpen]         = useState(false);
  const [notifOrders, setNotifOrders]           = useState(true);
  const [notifSettlements, setNotifSettlements] = useState(true);
  const [notifPromotions, setNotifPromotions]   = useState(false);

  // ── Store open/closed toggle ─────────────────────────────────────────────
  const toggleStoreOpen = async (newVal) => {
    if (!storeProfile?.id || updatingOpen) return;
    setUpdatingOpen(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .update({ is_open: newVal })
        .eq('id', storeProfile.id)
        .select()
        .single();

      if (error) throw error;
      if (data) setStoreProfile({ ...storeProfile, is_open: newVal });
    } catch (err) {
      Alert.alert('Error', 'Failed to update store status. Please try again.');
    } finally {
      setUpdatingOpen(false);
    }
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
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

  const kycStatus = storeProfile.kyc_status || storeProfile.status || 'pending';
  const kycDocs = [
    { label: 'Aadhaar Card',       key: 'aadhaar_url',         icon: 'id-card'   },
    { label: 'PAN Card',           key: 'pan_url',             icon: 'card'      },
    { label: 'GST Certificate',    key: 'gst_url',             icon: 'document'  },
    { label: 'Shop Licence / FSSAI', key: 'fssai_url',         icon: 'ribbon'    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Store identity header ── */}
      <View className="bg-white border border-border rounded-3xl p-5 mb-4 items-center">
        <View className="w-20 h-20 bg-brand-soft rounded-full justify-center items-center mb-3">
          <Ionicons name="storefront" size={38} color="#FF6B00" />
        </View>
        <Text className="text-text-primary text-xl font-bold">{storeProfile.store_name}</Text>
        <Text className="text-text-secondary text-sm mt-1">
          {storeProfile.owner_name} · Partner
        </Text>
        <View className={`mt-2 px-3 py-1 rounded-full ${
          storeProfile.status === 'active' ? 'bg-success-soft' : 'bg-warning-soft'
        }`}>
          <Text className={`text-xs font-bold capitalize ${
            storeProfile.status === 'active' ? 'text-success' : 'text-warning'
          }`}>
            {storeProfile.status === 'active' ? '✓ Verified Partner' : storeProfile.status}
          </Text>
        </View>
      </View>

      {/* ── Store open/closed toggle — PRD Task 70 ── */}
      <View className="bg-white border border-border rounded-2xl p-4 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-3">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${
            storeProfile.is_open ? 'bg-success-soft' : 'bg-gray-100'
          }`}>
            <Ionicons
              name={storeProfile.is_open ? 'flash' : 'flash-off'}
              size={20}
              color={storeProfile.is_open ? '#16A34A' : '#9CA3AF'}
            />
          </View>
          <View className="ml-3">
            <Text className="text-text-primary font-bold text-sm">Accepting Orders</Text>
            <Text className={`text-xs mt-0.5 ${storeProfile.is_open ? 'text-success' : 'text-text-secondary'}`}>
              {storeProfile.is_open ? 'Store is open and online' : 'Store is offline — not accepting orders'}
            </Text>
          </View>
        </View>
        {updatingOpen ? (
          <ActivityIndicator color="#FF6B00" />
        ) : (
          <Switch
            value={!!storeProfile.is_open}
            onValueChange={toggleStoreOpen}
            trackColor={{ false: '#D1D5DB', true: '#DCFCE7' }}
            thumbColor={storeProfile.is_open ? '#16A34A' : '#9CA3AF'}
            ios_backgroundColor="#D1D5DB"
          />
        )}
      </View>

      {/* ── Store details ── */}
      <SectionCard title="Store Details">
        <InfoRow label="Phone"             value={storeProfile.owner_phone || '---'} />
        <InfoRow label="Store Type"        value={storeProfile.store_type || '---'} />
        <InfoRow label="Delivery Radius"   value={storeProfile.delivery_radius_km ? `${storeProfile.delivery_radius_km} km` : '---'} />
        <InfoRow label="Address"           value={storeProfile.address || '---'} last />
      </SectionCard>

      {/* ── KYC Documents — PRD Task 71 ── */}
      <SectionCard title="KYC Documents">
        <View className={`flex-row items-center mb-3 px-1 py-1.5 rounded-lg ${
          kycStatus === 'active' ? 'bg-success-soft' : 'bg-warning-soft'
        }`}>
          <Ionicons
            name={kycStatus === 'active' ? 'shield-checkmark' : 'time'}
            size={16}
            color={kycStatus === 'active' ? '#16A34A' : '#F59E0B'}
          />
          <Text className={`text-xs font-bold ml-2 ${
            kycStatus === 'active' ? 'text-success' : 'text-warning'
          }`}>
            KYC {kycStatus === 'active' ? 'Verified' : 'Under Review'}
          </Text>
        </View>

        {kycDocs.map((doc, idx) => {
          const hasDoc = !!storeProfile[doc.key];
          return (
            <TouchableOpacity
              key={doc.key}
              className={`flex-row items-center justify-between py-3 ${
                idx < kycDocs.length - 1 ? 'border-b border-border' : ''
              }`}
              onPress={() => {
                if (hasDoc) Linking.openURL(storeProfile[doc.key]);
              }}
              disabled={!hasDoc}
            >
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-lg items-center justify-center ${
                  hasDoc ? 'bg-success-soft' : 'bg-gray-100'
                }`}>
                  <Ionicons name={doc.icon} size={16} color={hasDoc ? '#16A34A' : '#9CA3AF'} />
                </View>
                <Text className="text-text-primary text-sm font-medium ml-3">{doc.label}</Text>
              </View>
              {hasDoc ? (
                <View className="flex-row items-center">
                  <Text className="text-brand text-xs font-semibold mr-1">View</Text>
                  <Ionicons name="open-outline" size={14} color="#FF6B00" />
                </View>
              ) : (
                <Text className="text-text-secondary text-xs">Not uploaded</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      {/* ── Bank / Settlement ── */}
      <SectionCard title="Settlement Bank">
        <InfoRow
          label="Account"
          value={`•••• •••• ${storeProfile.bank_account_number?.toString().slice(-4) || '----'}`}
        />
        <InfoRow label="IFSC"  value={storeProfile.bank_ifsc   || '----'} />
        <InfoRow label="GSTIN" value={storeProfile.gstin        || 'Not Provided'} last />
      </SectionCard>

      {/* ── Location ── */}
      <SectionCard title="Location">
        <InfoRow label="Address"   value={storeProfile.address || '---'} />
        <InfoRow label="Latitude"  value={storeProfile.lat?.toFixed(6)?.toString() || '---'} />
        <InfoRow label="Longitude" value={storeProfile.lng?.toFixed(6)?.toString() || '---'} last />
      </SectionCard>

      {/* ── Notification settings — PRD Task 72 ── */}
      <SectionCard title="Notifications">
        <NotifRow
          label="New Orders"
          sub="Alert when a new order arrives"
          icon="notifications"
          value={notifOrders}
          onChange={setNotifOrders}
        />
        <NotifRow
          label="Settlements"
          sub="Weekly payout notifications"
          icon="wallet"
          value={notifSettlements}
          onChange={setNotifSettlements}
        />
        <NotifRow
          label="Promotions & Events"
          sub="ZapKart sale events and campaigns"
          icon="megaphone"
          value={notifPromotions}
          onChange={setNotifPromotions}
          last
        />
      </SectionCard>

      {/* ── Help & Support — PRD Task 73 ── */}
      <SectionCard title="Help & Support">
        <LinkRow
          icon="chatbubble-ellipses"
          label="Chat with ZapKart Support"
          onPress={() => Linking.openURL('https://wa.me/919876543210?text=Hi, I need help with my ZapKart store.')}
        />
        <LinkRow
          icon="call"
          label="Call Support Helpline"
          onPress={() => Linking.openURL('tel:+919876543210')}
        />
        <LinkRow
          icon="document-text"
          label="Partner Terms & Conditions"
          onPress={() => Linking.openURL('https://zapkart.in/partner-terms')}
        />
        <LinkRow
          icon="shield-checkmark"
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://zapkart.in/privacy')}
          last
        />
      </SectionCard>

      {/* ── App version ── */}
      <Text className="text-center text-xs text-text-secondary mb-4">
        ZapKart Store v1.0.0 · Partner Portal
      </Text>

      {/* ── Sign Out ── */}
      <TouchableOpacity
        className="w-full h-14 border border-error rounded-2xl justify-center items-center mb-4"
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 6 }} />
          <Text className="text-error font-bold text-base">Sign Out</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <View className="bg-white border border-border rounded-2xl p-5 mb-4">
      <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View className={`flex-row items-center justify-between py-2.5 ${last ? '' : 'border-b border-border'}`}>
      <Text className="text-text-secondary text-sm">{label}</Text>
      <Text className="text-text-primary font-semibold text-sm flex-1 text-right ml-4" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function NotifRow({ label, sub, icon, value, onChange, last }) {
  return (
    <View className={`flex-row items-center justify-between py-3 ${last ? '' : 'border-b border-border'}`}>
      <View className="flex-row items-center flex-1 pr-3">
        <View className="w-8 h-8 bg-surface border border-border rounded-lg items-center justify-center">
          <Ionicons name={icon} size={16} color="#6B7280" />
        </View>
        <View className="ml-3">
          <Text className="text-text-primary text-sm font-medium">{label}</Text>
          <Text className="text-text-secondary text-xs mt-0.5">{sub}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D1D5DB', true: '#DCFCE7' }}
        thumbColor={value ? '#16A34A' : '#9CA3AF'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}

function LinkRow({ icon, label, onPress, last }) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between py-3 ${last ? '' : 'border-b border-border'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 bg-surface border border-border rounded-lg items-center justify-center">
          <Ionicons name={icon} size={16} color="#FF6B00" />
        </View>
        <Text className="text-text-primary text-sm font-medium ml-3 flex-1">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
