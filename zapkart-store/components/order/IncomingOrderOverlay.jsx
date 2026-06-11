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
 * Full-screen incoming order notification modal with 60-second countdown.
 */
export default function IncomingOrderOverlay({ order, onConfirm, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch the items for the current incoming order from Supabase
  useEffect(() => {
    if (!order?.id) return;

    const fetchOrderItems = async () => {
      setLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        // Fail silently and render empty list or rely on subtotal
      } finally {
        setLoadingItems(false);
      }
    };

    fetchOrderItems();
    setTimeLeft(60);
  }, [order?.id]);

  // Handles the ticking timer down to 0, which triggers auto-decline
  useEffect(() => {
    if (!order?.id) return;
    if (timeLeft <= 0) {
      handleDecline();
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, order?.id]);

  /**
   * Decline action handler to reject the incoming order.
   */
  const handleDecline = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await onDecline(order.id);
    } catch (err) {
      // Handled by parent
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Confirm action handler to accept the incoming order.
   */
  const handleConfirm = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await onConfirm(order.id);
    } catch (err) {
      // Handled by parent
    } finally {
      setActionLoading(false);
    }
  };

  if (!order) return null;

  /**
   * Calculate the color of the progress bar based on time remaining.
   */
  const getTimerColor = () => {
    if (timeLeft > 30) return '#16A34A'; // Green
    if (timeLeft > 10) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Calculations for commission and earnings
  const subtotal = Number(order.subtotal || 0);
  const commission = subtotal * 0.18;
  const earnings = subtotal * 0.82;

  return (
    <Modal visible={!!order} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 p-6 justify-between">
          
          {/* Header Section */}
          <View className="items-center mt-4">
            <View className="flex-row items-center justify-center bg-brand-soft px-4 py-2 rounded-full mb-3">
              <Text className="text-brand font-bold text-xs tracking-widest uppercase animate-pulse">
                ⚡ Live Incoming Order
              </Text>
            </View>
            <Text className="text-gray-400 text-xs font-mono">
              ORDER ID: #{order.id?.slice(-8).toUpperCase() || '---'}
            </Text>
          </View>

          {/* Timer Circle/Progress Section */}
          <View className="items-center my-6">
            <View 
              style={{ borderColor: getTimerColor(), borderWidth: 4 }}
              className="w-24 h-24 rounded-full items-center justify-center shadow-sm"
            >
              <Text 
                style={{ color: getTimerColor() }} 
                className={`text-3xl font-black ${timeLeft <= 10 ? 'animate-ping' : ''}`}
              >
                {timeLeft}s
              </Text>
            </View>
            
            {/* Horizontal progress bar */}
            <View className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
              <View 
                style={{ 
                  width: `${(timeLeft / 60) * 100}%`,
                  backgroundColor: getTimerColor()
                }}
                className="h-full rounded-full transition-all duration-1000"
              />
            </View>
          </View>

          {/* Pricing Summary Panel */}
          <View className="bg-surface border border-border rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-text-secondary text-sm">Customer Order Total</Text>
              <Text className="text-text-primary text-xl font-extrabold">
                {formatCurrency(subtotal)}
              </Text>
            </View>
            <View className="w-full h-[1] bg-border my-2" />
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-secondary text-xs">Platform Fee (18%)</Text>
              <Text className="text-error text-xs font-medium">
                - {formatCurrency(commission)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-success font-bold text-sm">Your Payout</Text>
              <Text className="text-success text-lg font-bold">
                {formatCurrency(earnings)}
              </Text>
            </View>
          </View>

          {/* Order Items List */}
          <View className="flex-1 bg-surface border border-border rounded-2xl p-4 mb-6">
            <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Items List ({items.length})
            </Text>
            {loadingItems ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator color="#FF6B00" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {items.map((item, idx) => (
                  <View key={item.id || idx} className="flex-row justify-between py-2 border-b border-border last:border-b-0">
                    <Text className="text-text-primary text-sm font-semibold flex-1 pr-2">
                      {item.name} <Text className="text-text-secondary font-normal">x {item.quantity}</Text>
                    </Text>
                    <Text className="text-text-primary text-sm font-bold">
                      {formatCurrency(Number(item.total_price || 0))}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Action CTAs */}
          <View className="flex-row gap-3">
            {/* Decline CTA */}
            <TouchableOpacity 
              className="flex-1 h-14 border border-border rounded-xl justify-center items-center active:bg-gray-50"
              onPress={handleDecline}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#6B7280" />
              ) : (
                <Text className="text-text-secondary font-bold text-base">Decline</Text>
              )}
            </TouchableOpacity>

            {/* Confirm CTA */}
            <TouchableOpacity 
              className="flex-[2] h-14 bg-success rounded-xl justify-center items-center active:opacity-90 shadow-sm"
              onPress={handleConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-base">Accept & Pack</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
}
