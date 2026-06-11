import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOrderStore } from '../../src/stores/useOrderStore';
import IncomingOrderOverlay from '../../components/order/IncomingOrderOverlay';
// Note: no Firebase auth import — auth is handled by JWT token in authStore

/**
 * Protected tab layout component that redirects unauthenticated or pending users.
 */
export default function TabsLayout() {
  const { token, storeProfile, loading, initialized, setStoreProfile } = useAuthStore();
  const { pendingOrders, setOrders } = useOrderStore();

  // Subscribe to realtime order updates when tabs mount
  useEffect(() => {
    if (!storeProfile?.id) return;

    const channel = supabase
      .channel(`store-orders-${storeProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeProfile.id}`,
        },
        (payload) => {
          // Refresh orders list on any change (insert, update, delete)
          fetchTodayOrders();
        }
      )
      .subscribe();

    // Initial fetch for today's orders
    fetchTodayOrders();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeProfile?.id]);

  /**
   * Fetches today's orders for the active store from Supabase.
   */
  const fetchTodayOrders = async () => {
    if (!storeProfile?.id) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeProfile.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      // Silent failure — realtime will retry
    }
  };

  /**
   * Handles confirming an incoming order.
   * @param orderId - The order ID
   * @param unavailableItemIds - Array of item IDs marked unavailable by store
   */
  const handleConfirmOrder = async (orderId, unavailableItemIds = []) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          store_confirmed_at: new Date().toISOString(),
          unavailable_item_ids: unavailableItemIds,
        })
        .eq('id', orderId);

      if (error) throw error;
      fetchTodayOrders();
    } catch (err) {
      // Gracefully capture error
    }
  };

  /**
   * Handles declining an incoming order.
   * @param orderId - The order ID
   * @param reason - Decline reason string or 'timeout'
   */
  const handleDeclineOrder = async (orderId, reason = 'No reason given') => {
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          decline_reason: reason,
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      if (storeProfile?.id) {
        const currentCount = Number(storeProfile.cancellation_count || 0);
        const { data: updatedStore, error: storeError } = await supabase
          .from('stores')
          .update({ cancellation_count: currentCount + 1 })
          .eq('id', storeProfile.id)
          .select()
          .single();

        if (!storeError && updatedStore) {
          setStoreProfile(updatedStore);
        }
      }

      fetchTodayOrders();
    } catch (err) {
      // Gracefully capture error
    }
  };

  // Show loading spinner until session is resolved
  if (!initialized || loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="text-text-secondary mt-4 text-sm">Loading your store...</Text>
      </View>
    );
  }

  // Guard: redirect to login if no JWT token (not authenticated)
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  // Guard: redirect to registration if no store profile exists yet
  if (!storeProfile) {
    return <Redirect href="/register/store-details" />;
  }

  // Guard: redirect to pending screen if store is not active
  if (storeProfile.status === 'pending' || storeProfile.status === 'suspended') {
    return <Redirect href="/register/pending" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF6B00',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E9ECEF',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E9ECEF',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#0D0D0D',
            fontSize: 18,
          },
        }}
      >
        {/* Home Dashboard Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerTitle: 'ZapKart Store',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        {/* Active/Packing Orders Tab */}
        <Tabs.Screen
          name="active"
          options={{
            title: 'Active',
            headerTitle: 'Active Orders',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size} color={color} />
            ),
          }}
        />

        {/* Orders History Tab */}
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            headerTitle: 'Order Management',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt" size={size} color={color} />
            ),
          }}
        />

        {/* Products Inventory Tab */}
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            headerTitle: 'Product Inventory',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube" size={size} color={color} />
            ),
          }}
        />

        {/* Earnings Tab */}
        <Tabs.Screen
          name="earnings"
          options={{
            title: 'Earnings',
            headerTitle: 'Earnings & Settlements',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerTitle: 'Store Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {pendingOrders && pendingOrders.length > 0 && (
        <IncomingOrderOverlay
          order={pendingOrders[0]}
          onConfirm={handleConfirmOrder}
          onDecline={handleDeclineOrder}
        />
      )}
    </>
  );
}
