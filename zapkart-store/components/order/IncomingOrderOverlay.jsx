import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Full-screen incoming order overlay with 60-second countdown.
 * PRD Tasks 26–35:
 *  - 60s countdown timer, red + pulsing under 10s
 *  - Order value in large orange text
 *  - Items list with per-item unavailability toggle
 *  - GREEN confirm button (not orange — green means GO)
 *  - Small grey Decline text (not a prominent button)
 *  - Decline requires reason selection (bottom sheet)
 *  - On confirm → update order status to confirmed
 *  - On timeout → order auto-cancels (backend handles)
 */
const DECLINE_REASONS = [
  'Item(s) out of stock',
  'Store temporarily closed',
  'Too many orders right now',
  'Item not available today',
  'Other reason',
];

export default function IncomingOrderOverlay({ order, onConfirm, onDecline }) {
  const [timeLeft, setTimeLeft]             = useState(60);
  const [items, setItems]                   = useState([]);
  const [unavailableItems, setUnavailableItems] = useState(new Set()); // item ids
  const [loadingItems, setLoadingItems]     = useState(true);
  const [actionLoading, setActionLoading]   = useState(false);
  const [showDeclineSheet, setShowDeclineSheet] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  // Fetch order items from Supabase
  useEffect(() => {
    if (!order?.id) return;

    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        if (!error && data) setItems(data);
      } catch {
        // Silent — rely on subtotal
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
    setTimeLeft(60);
    setUnavailableItems(new Set());
    setSelectedReason('');
  }, [order?.id]);

  // Countdown timer — auto-cancel at 0
  useEffect(() => {
    if (!order?.id) return;
    if (timeLeft <= 0) {
      // Timeout — backend will auto-cancel; just close overlay
      onDecline(order.id, 'timeout');
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, order?.id]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Returns timer color: green > 30, amber 10–30, red < 10 */
  const getTimerColor = () => {
    if (timeLeft > 30) return '#16A34A';
    if (timeLeft > 10) return '#F59E0B';
    return '#EF4444';
  };

  /** Toggles an item's unavailability flag */
  const toggleItemUnavailable = (itemId) => {
    setUnavailableItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await onConfirm(order.id, Array.from(unavailableItems));
    } catch {
      // Handled by parent
    } finally {
      setActionLoading(false);
    }
  };

  // ── Decline flow ──────────────────────────────────────────────────────────
  const openDeclineSheet = () => setShowDeclineSheet(true);

  const confirmDecline = async () => {
    if (!selectedReason) return;
    setShowDeclineSheet(false);
    setActionLoading(true);
    try {
      await onDecline(order.id, selectedReason);
    } catch {
      // Handled by parent
    } finally {
      setActionLoading(false);
    }
  };

  if (!order) return null;

  // Finance calculations (uses commission_amount from order if available, else 18%)
  const subtotal   = Number(order.subtotal || 0);
  const commission = order.commission_amount
    ? Number(order.commission_amount)
    : subtotal * 0.18;
  const earnings   = subtotal - commission;

  return (
    <>
      <Modal visible={!!order} animationType="slide" transparent={false} statusBarTranslucent>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 px-5 pt-4 pb-6 justify-between">

            {/* ── Header ── */}
            <View className="items-center">
              <View className="flex-row items-center bg-brand-soft px-4 py-1.5 rounded-full mb-2">
                <Text className="text-brand font-bold text-xs tracking-widest uppercase">
                  ⚡ New Incoming Order
                </Text>
              </View>
              <Text className="text-gray-400 text-[11px] font-mono">
                #{order.id?.slice(-8).toUpperCase() || '---'}
              </Text>
            </View>

            {/* ── Countdown timer ── */}
            <View className="items-center my-4">
              <View
                style={{
                  borderColor: getTimerColor(),
                  borderWidth: 4,
                  opacity: timeLeft <= 10 ? (timeLeft % 2 === 0 ? 1 : 0.5) : 1,
                }}
                className="w-24 h-24 rounded-full items-center justify-center"
              >
                <Text style={{ color: getTimerColor() }} className="text-3xl font-black">
                  {timeLeft}s
                </Text>
              </View>
              {/* Progress bar */}
              <View className="w-full h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                <View
                  style={{
                    width: `${(timeLeft / 60) * 100}%`,
                    backgroundColor: getTimerColor(),
                  }}
                  className="h-full rounded-full"
                />
              </View>
              {timeLeft <= 10 && (
                <Text className="text-error text-xs font-bold mt-2">
                  ⚠️ Auto-declining soon!
                </Text>
              )}
            </View>

            {/* ── Order value — large ORANGE text (PRD Task 28) ── */}
            <View className="bg-surface border border-border rounded-2xl p-5 mb-3">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-text-secondary text-sm">Order Value</Text>
                {/* Orange — PRD explicitly says "order value in large orange text" */}
                <Text style={{ color: '#FF6B00' }} className="text-3xl font-extrabold">
                  {formatCurrency(subtotal)}
                </Text>
              </View>
              <View className="w-full h-[1px] bg-border my-2" />
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-text-secondary text-xs">
                  Platform Commission ({order.commission_rate
                    ? `${Math.round(Number(order.commission_rate) * 100)}%`
                    : '~18%'})
                </Text>
                <Text className="text-error text-xs font-medium">
                  -{formatCurrency(commission)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-success font-bold text-sm">Your Payout</Text>
                <Text className="text-success text-lg font-bold">
                  {formatCurrency(earnings)}
                </Text>
              </View>
            </View>

            {/* ── Items list with unavailability toggle (PRD Task 29) ── */}
            <View className="flex-1 bg-surface border border-border rounded-2xl p-4 mb-4 min-h-[100px]">
              <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Items ({items.length})
              </Text>
              {loadingItems ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator color="#FF6B00" />
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {items.map((item, idx) => {
                    const isUnavailable = unavailableItems.has(item.id || idx);
                    return (
                      <View
                        key={item.id || idx}
                        className={`flex-row items-center justify-between py-2.5 border-b border-border ${
                          isUnavailable ? 'opacity-50' : ''
                        }`}
                      >
                        <View className="flex-1 pr-3">
                          <Text
                            className={`text-sm font-semibold ${
                              isUnavailable ? 'line-through text-text-secondary' : 'text-text-primary'
                            }`}
                          >
                            {item.name} × {item.quantity}
                          </Text>
                          <Text className="text-xs text-text-secondary mt-0.5">
                            {formatCurrency(Number(item.total_price || 0))}
                          </Text>
                        </View>
                        {/* Unavailability toggle */}
                        <TouchableOpacity
                          onPress={() => toggleItemUnavailable(item.id || idx)}
                          className={`px-2.5 py-1 rounded-full border ${
                            isUnavailable
                              ? 'bg-error-soft border-red-200'
                              : 'bg-gray-100 border-gray-200'
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-bold ${
                              isUnavailable ? 'text-error' : 'text-text-secondary'
                            }`}
                          >
                            {isUnavailable ? 'Unavailable' : 'Available'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* ── Action buttons ── */}
            {/* GREEN confirm button (PRD Task 30 — "green means GO") */}
            <TouchableOpacity
              className="w-full h-[56px] bg-success rounded-2xl justify-center items-center shadow-sm mb-3"
              onPress={handleConfirm}
              disabled={actionLoading}
              activeOpacity={0.9}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base">Confirm Order</Text>
                  {unavailableItems.size > 0 && (
                    <View className="bg-white/30 px-2 py-0.5 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        {unavailableItems.size} unavailable
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Small grey Decline text — PRD Task 31: "not a prominent button" */}
            <TouchableOpacity
              className="items-center py-2"
              onPress={openDeclineSheet}
              disabled={actionLoading}
            >
              <Text className="text-text-secondary text-sm font-medium">
                Decline this order
              </Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Decline Reason Bottom Sheet — PRD Task 32 ── */}
      <Modal
        visible={showDeclineSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDeclineSheet(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setShowDeclineSheet(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-10">
            <Text className="text-lg font-bold text-text-primary mb-1">Why are you declining?</Text>
            <Text className="text-sm text-text-secondary mb-5">
              Please select a reason — this helps us improve.
            </Text>

            {DECLINE_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                  selectedReason === reason
                    ? 'border-error bg-error-soft'
                    : 'border-border bg-surface'
                }`}
                onPress={() => setSelectedReason(reason)}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    selectedReason === reason ? 'border-error' : 'border-gray-300'
                  }`}
                >
                  {selectedReason === reason && (
                    <View className="w-2.5 h-2.5 rounded-full bg-error" />
                  )}
                </View>
                <Text
                  className={`text-sm font-medium ${
                    selectedReason === reason ? 'text-error' : 'text-text-primary'
                  }`}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className={`w-full h-[52px] rounded-xl justify-center items-center mt-4 ${
                selectedReason ? 'bg-error' : 'bg-gray-300'
              }`}
              onPress={confirmDecline}
              disabled={!selectedReason}
            >
              <Text className="text-white font-bold text-base">Decline Order</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
