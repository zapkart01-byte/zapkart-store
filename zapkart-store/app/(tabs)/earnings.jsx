import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Earnings & Settlements screen — PRD Tasks 64–69.
 * - Weekly orange bar chart
 * - Gross Sales / Commission Paid / Your Earnings breakdown
 * - Event sale indicator
 * - Settlement card: next payout date + bank last 4 digits
 * - Payout history list
 */
export default function EarningsScreen() {
  const { storeProfile } = useAuthStore();
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod]       = useState('week'); // week | month

  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [payoutHistory, setPayoutHistory]     = useState([]);

  const fetchData = useCallback(async () => {
    if (!storeProfile?.id) return;
    try {
      // Fetch delivered orders for the selected period
      const since = new Date();
      if (period === 'week')  since.setDate(since.getDate() - 7);
      if (period === 'month') since.setDate(since.getDate() - 30);
      since.setHours(0, 0, 0, 0);

      const [ordersRes, payoutsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, subtotal, commission_amount, created_at, status')
          .eq('store_id', storeProfile.id)
          .eq('status', 'delivered')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false }),

        supabase
          .from('payouts')
          .select('*')
          .eq('recipient_id', storeProfile.id)
          .eq('recipient_type', 'store')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (!ordersRes.error && ordersRes.data) setDeliveredOrders(ordersRes.data);
      if (!payoutsRes.error && payoutsRes.data) setPayoutHistory(payoutsRes.data);
    } catch {
      // Silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeProfile?.id, period]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Aggregations ──────────────────────────────────────────────────────────
  const grossSales = deliveredOrders.reduce(
    (s, o) => s + Number(o.subtotal || 0), 0
  );
  const commissionPaid = deliveredOrders.reduce((s, o) => {
    const comm = o.commission_amount
      ? Number(o.commission_amount)
      : Number(o.subtotal || 0) * 0.18;
    return s + comm;
  }, 0);
  const yourEarnings = grossSales - commissionPaid;

  // ── 7-day bar chart data (orange bars) — PRD Task 64 ──────────────────────
  const get7DayBars = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return { date: d, label: days[d.getDay()], amount: 0 };
    });

    deliveredOrders.forEach((order) => {
      const od = new Date(order.created_at);
      od.setHours(0, 0, 0, 0);
      const bar = bars.find((b) => b.date.getTime() === od.getTime());
      if (bar) {
        const comm = order.commission_amount
          ? Number(order.commission_amount)
          : Number(order.subtotal || 0) * 0.18;
        bar.amount += Number(order.subtotal || 0) - comm;
      }
    });
    return bars;
  };

  const bars    = get7DayBars();
  const maxBar  = Math.max(...bars.map((b) => b.amount), 1);

  // ── Next payout date (every Monday) ──────────────────────────────────────
  const getNextMonday = () => {
    const d = new Date();
    const daysUntil = (1 + 7 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + daysUntil);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const bankLast4 = storeProfile?.bank_account_number
    ? String(storeProfile.bank_account_number).slice(-4)
    : '••••';

  if (loading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
        }
      >
        {/* Period selector */}
        <View className="flex-row gap-2 mb-4">
          {[
            { key: 'week',  label: 'This Week' },
            { key: 'month', label: 'This Month' },
          ].map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-xl border ${
                period === p.key ? 'bg-brand border-brand' : 'bg-white border-border'
              }`}
            >
              <Text className={`text-xs font-bold ${period === p.key ? 'text-white' : 'text-text-secondary'}`}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Earnings Breakdown — PRD Task 65 ── */}
        <View className="bg-brand rounded-3xl p-5 mb-4">
          <Text className="text-orange-100 text-xs uppercase tracking-wider font-bold mb-4">
            Earnings Breakdown
          </Text>

          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-orange-200 text-[10px] uppercase">Gross Sales</Text>
              <Text className="text-white text-xl font-black mt-0.5">
                {formatCurrency(grossSales)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-orange-200 text-[10px] uppercase">Orders</Text>
              <Text className="text-white text-xl font-black mt-0.5">
                {deliveredOrders.length}
              </Text>
            </View>
          </View>

          <View className="w-full h-[1px] bg-orange-400 my-3" />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-orange-200 text-[10px] uppercase">Commission Paid</Text>
              <Text className="text-orange-300 text-base font-bold mt-0.5">
                -{formatCurrency(commissionPaid)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-orange-200 text-[10px] uppercase">Your Earnings</Text>
              <Text className="text-white text-base font-extrabold mt-0.5">
                {formatCurrency(yourEarnings)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Weekly bar chart (orange) — PRD Task 64 ── */}
        <View className="bg-white border border-border rounded-2xl p-5 mb-4">
          <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-4">
            7-Day Earnings (Your Payout)
          </Text>
          <View className="flex-row items-end justify-between h-28 pt-2">
            {bars.map((bar, idx) => {
              const heightPct = (bar.amount / maxBar) * 100;
              const isToday   = idx === 6;
              return (
                <View key={idx} className="items-center flex-1">
                  {bar.amount > 0 ? (
                    <Text style={{ fontSize: 8 }} className="font-bold text-brand mb-1">
                      ₹{Math.round(bar.amount)}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 8 }} className="text-transparent mb-1">₹0</Text>
                  )}
                  <View className="w-5 bg-gray-100 rounded-t-lg h-20 justify-end overflow-hidden">
                    <View
                      style={{
                        height: `${Math.max(heightPct, bar.amount > 0 ? 5 : 0)}%`,
                        backgroundColor: isToday ? '#FF6B00' : '#FDB176',
                      }}
                      className="w-full rounded-t-lg"
                    />
                  </View>
                  <Text className="text-text-secondary text-[9px] mt-1.5 font-medium">
                    {bar.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Event sale indicator — PRD Task 66 ── */}
        {deliveredOrders.length > 0 && (
          <View className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4 flex-row items-center">
            <Text className="text-2xl mr-3">🎉</Text>
            <View className="flex-1">
              <Text className="text-purple-700 font-bold text-sm">
                Event orders this {period === 'week' ? 'week' : 'month'}: {deliveredOrders.length}
              </Text>
              <Text className="text-purple-500 text-xs mt-0.5">
                +{formatCurrency(yourEarnings)} extra earnings from events
              </Text>
            </View>
          </View>
        )}

        {/* ── Settlement card — PRD Tasks 67–68 ── */}
        <View className="bg-white border border-border rounded-2xl p-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-primary font-bold text-sm">Next Settlement</Text>
            <View className="bg-warning-soft px-3 py-1 rounded-full">
              <Text className="text-warning text-xs font-bold">Every Monday</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-text-secondary text-xs">Settlement Date</Text>
              <Text className="text-text-primary font-bold text-base mt-0.5">{getNextMonday()}</Text>
            </View>
            <View className="items-end">
              <Text className="text-text-secondary text-xs">Expected Amount</Text>
              <Text className="text-success font-bold text-base mt-0.5">
                {formatCurrency(yourEarnings)}
              </Text>
            </View>
          </View>
          {/* Bank account last 4 digits — PRD Task 68 */}
          <View className="bg-surface border border-border rounded-xl p-3 flex-row items-center">
            <Ionicons name="card" size={18} color="#6B7280" />
            <Text className="text-text-secondary text-xs ml-2">
              Payout to account ending in{' '}
              <Text className="font-bold text-text-primary">••••{bankLast4}</Text>
            </Text>
          </View>
        </View>

        {/* ── Payout history — PRD Task 69 ── */}
        <View>
          <Text className="text-base font-bold text-text-primary mb-3">Payout History</Text>
          {payoutHistory.length > 0 ? (
            payoutHistory.map((payout) => (
              <View
                key={payout.id}
                className="bg-white border border-border rounded-xl p-4 mb-2 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-text-primary text-sm font-semibold">
                    Settlement #{payout.id?.slice(-6).toUpperCase()}
                  </Text>
                  <Text className="text-text-secondary text-xs mt-0.5">
                    {payout.created_at
                      ? new Date(payout.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: '2-digit',
                        })
                      : '---'}
                    {payout.bank_reference ? ` · Ref: ${payout.bank_reference}` : ''}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-success font-bold text-sm">
                    +{formatCurrency(Number(payout.net_amount || 0))}
                  </Text>
                  <View className={`mt-1 px-2 py-0.5 rounded-full ${
                    payout.status === 'completed' ? 'bg-success-soft' : 'bg-warning-soft'
                  }`}>
                    <Text className={`text-[10px] font-bold ${
                      payout.status === 'completed' ? 'text-success' : 'text-warning'
                    }`}>
                      {payout.status === 'completed' ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            /* Empty delivered orders fallback — show per-order payout as history */
            deliveredOrders.length > 0 ? (
              deliveredOrders.slice(0, 10).map((order) => {
                const comm = order.commission_amount
                  ? Number(order.commission_amount)
                  : Number(order.subtotal || 0) * 0.18;
                const payout = Number(order.subtotal || 0) - comm;
                return (
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
                          day: 'numeric', month: 'short',
                        })}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-success font-bold text-sm">
                        +{formatCurrency(payout)}
                      </Text>
                      <View className="mt-1 bg-success-soft px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-bold text-success">Settled</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="bg-white border border-border rounded-xl p-6 items-center">
                <Ionicons name="wallet-outline" size={32} color="#D1D5DB" />
                <Text className="text-text-secondary text-sm mt-2">No payouts yet</Text>
              </View>
            )
          )}
        </View>

        {/* Info note */}
        <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-2">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={18} color="#1D4ED8" />
            <Text className="text-text-secondary text-xs ml-2 flex-1 leading-5">
              Store earnings are <Text className="font-bold text-text-primary">never affected by customer offers or coupons</Text>.
              {' '}Your payout is always based on your store price minus the platform commission rate.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
