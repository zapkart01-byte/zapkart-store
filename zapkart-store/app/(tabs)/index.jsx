import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getStoreDashboard } from '../../src/services/storeService';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOrderStore } from '../../src/stores/useOrderStore';
import { formatCurrency } from '../../src/utils/formatters';

// Home dashboard screen — shows today's stats and recent order activity
export default function HomeScreen() {
  const router = useRouter();
  const { storeProfile } = useAuthStore();
  const { orders } = useOrderStore();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetches dashboard metrics from Supabase
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

  // Initial data fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  // Count pending orders that need attention
  const pendingOrders = orders?.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed'
  );

  // Count orders currently being prepared
  const activeOrders = orders?.filter(
    (o) => o.status === 'preparing' || o.status === 'ready'
  );

  // Loading skeleton state
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

  // Error state
  if (error && !stats) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cloud-offline" size={48} color="#EF4444" />
          <Text className="text-lg font-bold text-text-primary mt-4">
            Something went wrong
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 px-6 py-3 bg-brand rounded-xl"
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
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 24 }}
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
        {/* Store greeting header */}
        <View className="mb-5">
          <Text className="text-lg font-bold text-text-primary">
            Welcome, {storeProfile?.owner_name || 'Store Owner'} 👋
          </Text>
          <Text className="text-sm text-text-secondary mt-1">
            {storeProfile?.store_name || 'Your Store'} •{' '}
            {storeProfile?.is_open ? (
              <Text className="text-success font-semibold">Open</Text>
            ) : (
              <Text className="text-error font-semibold">Closed</Text>
            )}
          </Text>
        </View>

        {/* Pending orders alert banner */}
        {pendingOrders?.length > 0 && (
          <TouchableOpacity
            className="bg-error-soft border border-red-200 rounded-xl p-4 mb-4"
            onPress={() => router.push('/(tabs)/orders')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-error rounded-full items-center justify-center">
                  <Ionicons name="alert" size={20} color="#FFFFFF" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-error font-bold text-sm">
                    {pendingOrders.length} Order{pendingOrders.length > 1 ? 's' : ''} Need Action
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

        {/* Today's stat cards row */}
        <View className="flex-row gap-3 mb-4">
          {/* Revenue card */}
          <View className="flex-1 bg-white border border-border rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="trending-up" size={18} color="#16A34A" />
              <Text className="text-xs text-text-secondary ml-1.5">Today Revenue</Text>
            </View>
            <Text className="text-xl font-bold text-text-primary">
              {formatCurrency(stats?.todayRevenue || 0)}
            </Text>
          </View>

          {/* Orders count card */}
          <View className="flex-1 bg-white border border-border rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="receipt" size={18} color="#1D4ED8" />
              <Text className="text-xs text-text-secondary ml-1.5">Today Orders</Text>
            </View>
            <Text className="text-xl font-bold text-text-primary">
              {stats?.todayOrdersCount || 0}
            </Text>
          </View>
        </View>

        {/* Rating card */}
        <View className="bg-white border border-border rounded-2xl p-4 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="star" size={22} color="#F59E0B" />
              <Text className="text-lg font-bold text-text-primary ml-2">
                {(stats?.rating || 5.0).toFixed(1)}
              </Text>
              <Text className="text-sm text-text-secondary ml-2">Store Rating</Text>
            </View>
            <View className="bg-warning-soft px-3 py-1 rounded-full">
              <Text className="text-warning text-xs font-medium">
                {stats?.rating >= 4.5 ? 'Excellent' : stats?.rating >= 4.0 ? 'Good' : 'Average'}
              </Text>
            </View>
          </View>
        </View>

        {/* Active orders section */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-text-primary">Active Orders</Text>
            {activeOrders?.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/active')}>
                <Text className="text-brand text-sm font-semibold">View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {activeOrders?.length > 0 ? (
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
                      order.status === 'preparing'
                        ? 'bg-warning-soft'
                        : 'bg-info-soft'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        order.status === 'preparing'
                          ? 'text-warning'
                          : 'text-info'
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
              <Text className="text-text-secondary text-sm mt-2">
                No active orders right now
              </Text>
            </View>
          )}
        </View>

        {/* Recent completed orders section */}
        <View>
          <Text className="text-base font-bold text-text-primary mb-3">
            Recent Completed
          </Text>
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
              <Text className="text-text-secondary text-sm mt-2">
                No completed orders today
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
