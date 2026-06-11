import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { getStoreDashboard } from '../../src/services/storeService';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOrderStore } from '../../src/stores/useOrderStore';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Home dashboard screen — today's stats, store toggle, quick actions, live orders.
 * PRD Tasks 21–25.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { storeProfile, setStoreProfile } = useAuthStore();
  const { orders } = useOrderStore();

  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);
  const [togglingOpen, setTogglingOpen] = useState(false);

  /** Fetches dashboard metrics from Supabase */
  const fetchDashboard = useCallback(async () => {
    if (!storeProfile?.id) return;
    try {
      const data = await getStoreDashboard(storeProfile.id);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeProfile?.id]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Toggles store open/closed status in Supabase.
   * PRD Task 23: updates stores.is_open field.
   */
  const handleToggleOpen = async (newValue) => {
    if (!storeProfile?.id || togglingOpen) return;
    setTogglingOpen(true);
    try {
      const { data, error: updateError } = await supabase
        .from('stores')
        .update({ is_open: newValue })
        .eq('id', storeProfile.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) setStoreProfile({ ...storeProfile, is_open: newValue });
    } catch (err) {
      Alert.alert('Error', 'Failed to update store status. Please try again.');
    } finally {
      setTogglingOpen(false);
    }
  };

  // Derived order counts from realtime order store
  const pendingOrders = orders?.filter((o) => o.status === 'pending') ?? [];
  const activeOrders  = orders?.filter((o) => o.status === 'preparing' || o.status === 'ready') ?? [];
  const pendingCount  = pendingOrders.length;
  const isOpen        = storeProfile?.is_open ?? false;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading && !stats) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text className="text-text-secondary mt-4 text-sm">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && !stats) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cloud-offline" size={48} color="#EF4444" />
          <Text className="text-lg font-bold text-text-primary mt-4">Something went wrong</Text>
          <Text className="text-sm text-text-secondary text-center mt-2">{error}</Text>
          <TouchableOpacity
            className="mt-6 px-8 py-3 bg-brand rounded-xl"
            onPress={fetchDashboard}
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B00"
            colors={['#FF6B00']}
          />
        }
      >

        {/* ── Store header with open/closed toggle ── */}
        <View className="bg-white border border-border rounded-2xl p-4 mb-4 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-text-primary" numberOfLines={1}>
              {storeProfile?.store_name || 'Your Store'}
            </Text>
            <Text className="text-xs text-text-secondary mt-0.5">
              Welcome back, {storeProfile?.owner_name || 'Store Owner'} 👋
            </Text>
          </View>

          {/* Open / Closed toggle — PRD Task 23 */}
          <View className="flex-row items-center gap-2">
            <Text className={`text-sm font-bold ${isOpen ? 'text-success' : 'text-error'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
            {togglingOpen ? (
              <ActivityIndicator size="small" color="#FF6B00" />
            ) : (
              <Switch
                value={isOpen}
                onValueChange={handleToggleOpen}
                trackColor={{ false: '#FEE2E2', true: '#DCFCE7' }}
                thumbColor={isOpen ? '#16A34A' : '#EF4444'}
                ios_backgroundColor="#FEE2E2"
              />
            )}
          </View>
        </View>

        {/* ── Pending orders alert banner ── */}
        {pendingCount > 0 && (
          <TouchableOpacity
            className="bg-error-soft border border-red-200 rounded-xl p-4 mb-4"
            onPress={() => router.push('/(tabs)/orders')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-error rounded-full items-center justify-center">
                  <Ionicons name="alert" size={20} color="#FFFFFF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-error font-bold text-sm">
                    {pendingCount} Order{pendingCount > 1 ? 's' : ''} Need Action
                  </Text>
                  <Text className="text-text-secondary text-xs mt-0.5">
                    Tap to view and confirm
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </View>
          </TouchableOpacity>
        )}

        {/* ── Stats cards row (3 cards) — PRD Tasks 21–22 ── */}
        <View className="flex-row gap-3 mb-4">
          {/* Today's Revenue */}
          <View className="flex-1 bg-white border border-border rounded-2xl p-4">
            <View className="flex-row items-center mb-1.5">
              <Ionicons name="trending-up" size={16} color="#16A34A" />
              <Text className="text-[11px] text-text-secondary ml-1">Revenue</Text>
            </View>
            <Text className="text-lg font-bold text-text-primary">
              {formatCurrency(stats?.todayRevenue || 0)}
            </Text>
            <Text className="text-[10px] text-text-secondary mt-0.5">Today</Text>
          </View>

          {/* Today's Orders */}
          <View className="flex-1 bg-white border border-border rounded-2xl p-4">
            <View className="flex-row items-center mb-1.5">
              <Ionicons name="receipt" size={16} color="#1D4ED8" />
              <Text className="text-[11px] text-text-secondary ml-1">Orders</Text>
            </View>
            <Text className="text-lg font-bold text-text-primary">
              {stats?.todayOrdersCount || 0}
            </Text>
            <Text className="text-[10px] text-text-secondary mt-0.5">Today</Text>
          </View>

          {/* Pending Items — PRD Task 22 */}
          <View className="flex-1 bg-white border border-border rounded-2xl p-4">
            <View className="flex-row items-center mb-1.5">
              <Ionicons name="time" size={16} color="#F59E0B" />
              <Text className="text-[11px] text-text-secondary ml-1">Pending</Text>
            </View>
            <Text className="text-lg font-bold text-text-primary">
              {pendingCount}
            </Text>
            <Text className="text-[10px] text-text-secondary mt-0.5">Items</Text>
          </View>
        </View>

        {/* ── Rating card ── */}
        <View className="bg-white border border-border rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text className="text-lg font-bold text-text-primary ml-2">
                {(stats?.rating || 5.0).toFixed(1)}
              </Text>
              <Text className="text-sm text-text-secondary ml-2">Store Rating</Text>
            </View>
            <View className="bg-warning-soft px-3 py-1 rounded-full">
              <Text className="text-warning text-xs font-medium">
                {(stats?.rating || 5) >= 4.5 ? 'Excellent' : (stats?.rating || 5) >= 4.0 ? 'Good' : 'Average'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions row — PRD Task 24 ── */}
        <Text className="text-sm font-bold text-text-primary mb-3">Quick Actions</Text>
        <View className="flex-row gap-3 mb-5">
          {/* Add Product */}
          <TouchableOpacity
            className="flex-1 bg-brand rounded-2xl p-4 items-center justify-center"
            onPress={() => router.push('/product/new')}
            activeOpacity={0.85}
          >
            <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-2">
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-white font-bold text-xs text-center">Add Product</Text>
          </TouchableOpacity>

          {/* View Orders */}
          <TouchableOpacity
            className="flex-1 bg-white border border-border rounded-2xl p-4 items-center justify-center"
            onPress={() => router.push('/(tabs)/orders')}
            activeOpacity={0.85}
          >
            <View className="w-10 h-10 bg-surface rounded-xl items-center justify-center mb-2">
              <Ionicons name="receipt" size={22} color="#1D4ED8" />
            </View>
            <Text className="text-text-primary font-bold text-xs text-center">View Orders</Text>
          </TouchableOpacity>

          {/* Earnings */}
          <TouchableOpacity
            className="flex-1 bg-white border border-border rounded-2xl p-4 items-center justify-center"
            onPress={() => router.push('/(tabs)/earnings')}
            activeOpacity={0.85}
          >
            <View className="w-10 h-10 bg-surface rounded-xl items-center justify-center mb-2">
              <Ionicons name="wallet" size={22} color="#16A34A" />
            </View>
            <Text className="text-text-primary font-bold text-xs text-center">Earnings</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active orders section ── */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-text-primary">Active Orders</Text>
            {activeOrders.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/active')}>
                <Text className="text-brand text-sm font-semibold">View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {activeOrders.length > 0 ? (
            activeOrders.slice(0, 3).map((order) => (
              <View
                key={order.id}
                className="bg-white border border-border rounded-xl p-4 mb-2"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-text-primary">
                      Order #{order.id?.slice(-8) || '---'}
                    </Text>
                    <Text className="text-xs text-text-secondary mt-1">
                      {formatCurrency(order.subtotal || 0)} • {order.status}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      order.status === 'preparing' ? 'bg-warning-soft' : 'bg-info-soft'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        order.status === 'preparing' ? 'text-warning' : 'text-info'
                      }`}
                    >
                      {order.status === 'preparing' ? 'Packing' : 'Ready'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white border border-border rounded-xl p-6 items-center">
              <Ionicons name="cube-outline" size={32} color="#D1D5DB" />
              <Text className="text-text-secondary text-sm mt-2">No active orders right now</Text>
            </View>
          )}
        </View>

        {/* ── Recent completed section ── */}
        <View>
          <Text className="text-base font-bold text-text-primary mb-3">Recent Completed</Text>
          {orders?.filter((o) => o.status === 'delivered').length > 0 ? (
            orders
              .filter((o) => o.status === 'delivered')
              .slice(0, 5)
              .map((order) => (
                <View
                  key={order.id}
                  className="bg-white border border-border rounded-xl p-4 mb-2"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary">
                        Order #{order.id?.slice(-8) || '---'}
                      </Text>
                      <Text className="text-xs text-text-secondary mt-1">
                        {formatCurrency(order.subtotal || 0)}
                      </Text>
                    </View>
                    <View className="bg-success-soft px-3 py-1 rounded-full">
                      <Text className="text-success text-xs font-medium">Delivered</Text>
                    </View>
                  </View>
                </View>
              ))
          ) : (
            <View className="bg-white border border-border rounded-xl p-6 items-center">
              <Ionicons name="checkmark-done-outline" size={32} color="#D1D5DB" />
              <Text className="text-text-secondary text-sm mt-2">No completed orders today</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
