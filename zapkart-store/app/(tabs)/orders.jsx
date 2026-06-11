import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatCurrency } from '../../src/utils/formatters';

// Past order management list screen for history tracking and status summaries
export default function OrdersScreen() {
  const { storeProfile } = useAuthStore();
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, delivered, cancelled

  // Fetches historical orders from Supabase for this store
  const fetchOrdersHistory = useCallback(async () => {
    if (!storeProfile?.id) return;
    try {
      let query = supabase
        .from('orders')
        .select('*, customers:customer_id(name, phone)')
        .eq('store_id', storeProfile.id);

      if (filter === 'delivered') {
        query = query.eq('status', 'delivered');
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setOrdersHistory(data);
      }
    } catch (err) {
      // Graceful catch block
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeProfile?.id, filter]);

  // Initial fetch and dependency trigger
  useEffect(() => {
    fetchOrdersHistory();
  }, [fetchOrdersHistory]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrdersHistory();
  };

  // Helper to format date strings for readability
  const formatDate = (isoString) => {
    if (!isoString) return '---';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Top Filter Buttons bar */}
      <View className="bg-white border-b border-border py-3 px-4 flex-row gap-2">
        {['all', 'delivered', 'cancelled'].map((f) => (
          <TouchableOpacity
            key={f}
            className={`px-4 py-2 rounded-xl border ${
              filter === f
                ? 'bg-brand border-brand'
                : 'bg-surface border-border'
            }`}
            onPress={() => {
              setFilter(f);
              setLoading(true);
            }}
          >
            <Text
              className={`text-xs font-bold capitalize ${
                filter === f ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {f === 'all' ? 'All Orders' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main content area */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : ordersHistory.length > 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
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
          {ordersHistory.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            return (
              <View
                key={order.id}
                className="bg-white border border-border rounded-2xl p-4 mb-3 shadow-sm"
              >
                {/* Top header row */}
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-text-primary font-bold text-sm">
                      Order #{order.id?.slice(-8).toUpperCase()}
                    </Text>
                    <Text className="text-text-secondary text-xs mt-0.5">
                      {formatDate(order.created_at)}
                    </Text>
                  </View>
                  <View
                    className={`px-2.5 py-1 rounded-full ${
                      isDelivered
                        ? 'bg-success-soft'
                        : isCancelled
                        ? 'bg-error-soft'
                        : 'bg-info-soft'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDelivered
                          ? 'text-success'
                          : isCancelled
                          ? 'text-error'
                          : 'text-info'
                      }`}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Customer card details */}
                <View className="bg-surface rounded-xl p-3 mb-3 border border-border">
                  <View className="flex-row items-center mb-1.5">
                    <Ionicons name="person" size={14} color="#6B7280" />
                    <Text className="text-text-primary text-xs font-semibold ml-2">
                      {order.customers?.name || 'Customer Profile'}
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="location" size={14} color="#6B7280" style={{ marginTop: 2 }} />
                    <Text className="text-text-secondary text-xs ml-2 flex-1" numberOfLines={2}>
                      {order.delivery_address || 'Address pending'}
                    </Text>
                  </View>
                </View>

                {/* Settlement totals row */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary text-xs">Settlement Amount</Text>
                  <Text className="text-text-primary font-bold text-base">
                    {formatCurrency(Number(order.subtotal || 0) * 0.82)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center mb-4">
            <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-text-primary text-center">
            No Orders Found
          </Text>
          <Text className="text-text-secondary text-sm text-center mt-2">
            There are no past orders matching this filter.
          </Text>
        </View>
      )}
    </View>
  );
}
