import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Screen component for store payouts tracking, platform commission deductions, and settlements list.
 */
export default function EarningsScreen() {
  const { storeProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Earnings aggregate statistics state
  const [stats, setStats] = useState({
    lifetimeSales: 0,
    lifetimePayout: 0,
    pendingPayout: 0,
    deliveredCount: 0,
  });

  const [completedOrders, setCompletedOrders] = useState([]);

  /**
   * Fetch delivered order history to aggregate settlements calculations.
   */
  const fetchFinanceData = useCallback(async () => {
    if (!storeProfile?.id) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeProfile.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCompletedOrders(data);

        // Sum up customer subtotal sums
        const salesTotal = data.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
        const payoutTotal = salesTotal * 0.82; // 82% after 18% commission

        // Mock pending calculations based on orders from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const pendingOrders = data.filter((o) => new Date(o.created_at) >= sevenDaysAgo);
        const pendingTotal = pendingOrders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0) * 0.82;

        setStats({
          lifetimeSales: salesTotal,
          lifetimePayout: payoutTotal,
          pendingPayout: pendingTotal,
          deliveredCount: data.length,
        });
      }
    } catch (err) {
      // Graceful error logging
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeProfile?.id]);

  // Initial and refresh dependencies hooks
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  /**
   * Pull-to-refresh handler.
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchFinanceData();
  };

  /**
   * Calculates next Monday's date string.
   */
  const getNextPayoutDate = () => {
    const today = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
    return nextMonday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  /**
   * Aggregates completed orders over the last 7 days for the trend bar chart.
   */
  const get7DayTrend = () => {
    const trend = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      trend.push({
        date: d,
        dayLabel: days[d.getDay()],
        amount: 0,
      });
    }

    completedOrders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      const match = trend.find((t) => t.date.getTime() === orderDate.getTime());
      if (match) {
        match.amount += Number(order.subtotal || 0) * 0.82;
      }
    });

    return trend;
  };

  const trendData = get7DayTrend();
  const maxAmount = Math.max(...trendData.map((t) => t.amount), 1);

  return (
    <View className="flex-1 bg-surface">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
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
          {/* Main Earnings Panel card */}
          <View className="bg-brand rounded-3xl p-6 mb-4 shadow-md">
            <Text className="text-orange-100 text-xs uppercase tracking-wider font-bold">
              Lifetime Earnings (Settled)
            </Text>
            <Text className="text-white text-3xl font-black mt-1">
              {formatCurrency(stats.lifetimePayout)}
            </Text>
            <View className="w-full h-[1] bg-orange-400 my-4" />
            <View className="flex-row justify-between">
              <View>
                <Text className="text-orange-100 text-[10px] uppercase">Lifetime Sales</Text>
                <Text className="text-white text-sm font-bold mt-0.5">
                  {formatCurrency(stats.lifetimeSales)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-orange-100 text-[10px] uppercase">Orders Delivered</Text>
                <Text className="text-white text-sm font-bold mt-0.5">
                  {stats.deliveredCount} orders
                </Text>
              </View>
            </View>
          </View>

          {/* Pending Payout / Next Settlement status info card */}
          <View className="bg-white border border-border rounded-2xl p-5 mb-4 flex-row justify-between items-center shadow-sm">
            <View className="flex-1 pr-2">
              <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">
                Pending Settlement
              </Text>
              <Text className="text-text-primary text-xl font-black mt-1">
                {formatCurrency(stats.pendingPayout)}
              </Text>
              <Text className="text-text-secondary text-[11px] mt-1">
                Settles automatically on{' '}
                <Text className="font-semibold text-text-primary">{getNextPayoutDate()}</Text>
              </Text>
            </View>
            <View className="w-12 h-12 bg-warning-soft rounded-full items-center justify-center">
              <Ionicons name="time" size={24} color="#F59E0B" />
            </View>
          </View>

          {/* 7-Day Revenue Trend Bar Chart */}
          <View className="bg-white border border-border rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-4">
              7-Day Payout Trend
            </Text>
            <View className="flex-row items-end justify-between h-36 pt-2 px-1">
              {trendData.map((day, idx) => {
                const barHeightPct = (day.amount / maxAmount) * 100;
                return (
                  <View key={idx} className="items-center flex-1">
                    {day.amount > 0 ? (
                      <Text className="text-[9px] font-bold text-brand mb-1">
                        ₹{Math.round(day.amount)}
                      </Text>
                    ) : (
                      <Text className="text-[9px] font-bold text-transparent mb-1">₹0</Text>
                    )}
                    <View className="w-6 bg-gray-100 rounded-t-lg justify-end h-20 overflow-hidden">
                      <View
                        style={{ height: `${barHeightPct}%` }}
                        className="w-full bg-brand rounded-t-lg"
                      />
                    </View>
                    <Text className="text-text-secondary text-[10px] mt-2 font-medium">
                      {day.dayLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Platform commission rules disclosure info banner */}
          <View className="bg-info-soft border border-blue-100 rounded-2xl p-4 mb-5 flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#1D4ED8" />
            <View className="ml-3 flex-1">
              <Text className="text-text-primary font-bold text-xs">Weekly Settlements</Text>
              <Text className="text-text-secondary text-[11px] mt-0.5 leading-4">
                ZapKart settlements are processed every Monday. The platform fee of 18% is deducted
                automatically. Funds take 1-2 business days to clear into your bank account.
              </Text>
            </View>
          </View>

          {/* Recent settlements list section */}
          <View className="mb-4">
            <Text className="text-base font-bold text-text-primary mb-3">Recent Transactions</Text>
            {completedOrders.length > 0 ? (
              completedOrders.slice(0, 8).map((order) => (
                <View
                  key={order.id}
                  className="bg-white border border-border rounded-xl p-4 mb-2 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-text-primary text-sm font-semibold">
                      Order #{order.id?.slice(-6).toUpperCase()}
                    </Text>
                    <Text className="text-text-secondary text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-success font-bold text-sm">
                      + {formatCurrency(Number(order.subtotal || 0) * 0.82)}
                    </Text>
                    <Text className="text-gray-400 text-[10px]">Settled</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white border border-border rounded-xl p-6 items-center">
                <Ionicons name="wallet-outline" size={32} color="#D1D5DB" />
                <Text className="text-text-secondary text-sm mt-2">No settlements completed yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

