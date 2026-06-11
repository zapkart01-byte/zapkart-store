import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Orders management tab — 4 sections per PRD Tasks 58–63:
 * 1. Pending — orange pulsing border + Confirm button
 * 2. Active  — packing stage with timer
 * 3. Today   — completed, shows store payout (not total)
 * 4. History — date filter + search
 */

const TABS = ['Pending', 'Active', 'Today', 'History'];

export default function OrdersScreen() {
  const { storeProfile } = useAuthStore();

  const [activeTab, setActiveTab]     = useState('Pending');
  const [allOrders, setAllOrders]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  // Fetch all of today's orders + recent history
  const fetchOrders = useCallback(async () => {
    if (!storeProfile?.id) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers:customer_id(name, phone)')
        .eq('store_id', storeProfile.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data) setAllOrders(data);
    } catch {
      // Silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeProfile?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Realtime subscription for new orders
  useEffect(() => {
    if (!storeProfile?.id) return;
    const channel = supabase
      .channel(`orders-tab-${storeProfile.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `store_id=eq.${storeProfile.id}`,
      }, () => fetchOrders())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [storeProfile?.id]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  // ── Confirm order inline ──────────────────────────────────────────────────
  const handleConfirm = async (orderId) => {
    setConfirmingId(orderId);
    try {
      await supabase.from('orders').update({
        status: 'confirmed',
        store_confirmed_at: new Date().toISOString(),
      }).eq('id', orderId);
      fetchOrders();
    } catch {
      // Silently handled
    } finally {
      setConfirmingId(null);
    }
  };

  // ── Derived lists ─────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const pendingOrders  = allOrders.filter((o) => o.status === 'pending');
  const activeOrders   = allOrders.filter((o) =>
    ['confirmed', 'preparing', 'ready'].includes(o.status)
  );
  const todayCompleted = allOrders.filter((o) =>
    o.status === 'delivered' && new Date(o.created_at) >= today
  );
  const historyOrders  = allOrders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.customers?.name?.toLowerCase().includes(q)
    );
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStorePayout = (order) => {
    // Use stored commission_amount if available, else 18% fallback
    const subtotal = Number(order.subtotal || 0);
    const commission = order.commission_amount
      ? Number(order.commission_amount)
      : subtotal * 0.18;
    return subtotal - commission;
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Pending' },
      confirmed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Confirmed' },
      preparing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Packing' },
      ready:     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Ready' },
      delivered: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Delivered' },
      cancelled: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled' },
    };
    return map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
  };

  // ── Render order card ─────────────────────────────────────────────────────
  const renderOrderCard = (order, options = {}) => {
    const { showConfirmBtn, showPayout, pulseBorder } = options;
    const badge = getStatusBadge(order.status);

    return (
      <View
        key={order.id}
        style={pulseBorder ? { borderWidth: 2, borderColor: '#FF6B00' } : {}}
        className={`bg-white rounded-2xl p-4 mb-3 shadow-sm ${
          pulseBorder ? '' : 'border border-border'
        }`}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-text-primary font-bold text-sm">
              #{order.id?.slice(-8).toUpperCase()}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5">
              {formatTime(order.created_at)}
              {order.customers?.name ? ` · ${order.customers.name}` : ''}
            </Text>
          </View>
          <View className={`px-2.5 py-1 rounded-full ${badge.bg}`}>
            <Text className={`text-xs font-bold ${badge.text}`}>{badge.label}</Text>
          </View>
        </View>

        {/* Amount row */}
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-text-secondary text-xs">Order Value</Text>
          <Text className="text-text-primary font-bold text-sm">
            {formatCurrency(Number(order.subtotal || 0))}
          </Text>
        </View>

        {/* Store payout row — PRD Task 61: show store payout not total */}
        {showPayout && (
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-text-secondary text-xs">Your Payout</Text>
            <Text className="text-success font-bold text-sm">
              {formatCurrency(getStorePayout(order))}
            </Text>
          </View>
        )}

        {/* Confirm button — PRD Task 59 */}
        {showConfirmBtn && (
          <TouchableOpacity
            className="mt-3 h-[44px] bg-success rounded-xl items-center justify-center"
            onPress={() => handleConfirm(order.id)}
            disabled={confirmingId === order.id}
          >
            {confirmingId === order.id ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold text-sm">✓ Confirm Order</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Section renderers ─────────────────────────────────────────────────────
  const renderPending = () => (
    pendingOrders.length > 0
      ? pendingOrders.map((o) => renderOrderCard(o, { showConfirmBtn: true, pulseBorder: true }))
      : <EmptyState icon="time-outline" text="No pending orders" sub="New orders will appear here" />
  );

  const renderActive = () => (
    activeOrders.length > 0
      ? activeOrders.map((o) => renderOrderCard(o, {}))
      : <EmptyState icon="flash-outline" text="No active orders" sub="Confirmed orders being packed" />
  );

  const renderToday = () => (
    todayCompleted.length > 0
      ? todayCompleted.map((o) => renderOrderCard(o, { showPayout: true }))
      : <EmptyState icon="checkmark-done-outline" text="No completions yet today" sub="Delivered orders will show here" />
  );

  const renderHistory = () => (
    historyOrders.length > 0
      ? historyOrders.slice(0, 50).map((o) => renderOrderCard(o, {}))
      : <EmptyState icon="receipt-outline" text="No orders found" sub="Try a different search query" />
  );

  const tabCounts = {
    Pending: pendingOrders.length,
    Active:  activeOrders.length,
    Today:   todayCompleted.length,
    History: allOrders.length,
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-border"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 6 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              activeTab === tab ? 'bg-brand border-brand' : 'bg-surface border-border'
            }`}
          >
            <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-text-secondary'}`}>
              {tab}
            </Text>
            {tabCounts[tab] > 0 && (
              <View className={`ml-1.5 w-5 h-5 rounded-full items-center justify-center ${
                activeTab === tab ? 'bg-white/30' : 'bg-brand-soft'
              }`}>
                <Text className={`text-[10px] font-bold ${activeTab === tab ? 'text-white' : 'text-brand'}`}>
                  {tabCounts[tab]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* History search */}
      {activeTab === 'History' && (
        <View className="bg-white px-4 py-2 border-b border-border">
          <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 h-9">
            <Ionicons name="search" size={16} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-text-primary text-sm"
              placeholder="Search by order ID or customer name..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
          }
        >
          {activeTab === 'Pending' && renderPending()}
          {activeTab === 'Active'  && renderActive()}
          {activeTab === 'Today'   && renderToday()}
          {activeTab === 'History' && renderHistory()}
        </ScrollView>
      )}
    </View>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center mb-4">
        <Ionicons name={icon} size={32} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-bold text-text-primary text-center">{text}</Text>
      <Text className="text-text-secondary text-sm text-center mt-2">{sub}</Text>
    </View>
  );
}
