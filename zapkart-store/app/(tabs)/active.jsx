import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOrderStore } from '../../src/stores/useOrderStore';
import { formatCurrency } from '../../src/utils/formatters';

// Screen for managing active packing lists, checklist validation, and rider tracking
export default function ActiveOrdersScreen() {
  const { storeProfile } = useAuthStore();
  const { orders, setOrders } = useOrderStore();

  // Selected order state for detail packing view
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [items, setItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);
  const [submittingReady, setSubmittingReady] = useState(false);

  // Filter orders currently in preparing (packing) or ready (waiting for rider) status
  const activeOrdersList = orders?.filter(
    (o) => o.status === 'preparing' || o.status === 'ready'
  ) || [];

  // Automatically select the first active order if none is selected
  useEffect(() => {
    if (activeOrdersList.length > 0 && !selectedOrderId) {
      setSelectedOrderId(activeOrdersList[0].id);
    } else if (activeOrdersList.length === 0 && selectedOrderId) {
      setSelectedOrderId(null);
    }
  }, [activeOrdersList, selectedOrderId]);

  // Fetch items for the currently selected active order
  const fetchOrderItems = useCallback(async (orderId) => {
    if (!orderId) return;
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (!error && data) {
        setItems(data);
        // Reset checkbox state for new order
        const initialCheckState = {};
        data.forEach((item) => {
          initialCheckState[item.id] = false;
        });
        setCheckedItems(initialCheckState);
      }
    } catch (err) {
      // Graceful error logging
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // Fetch items whenever the selected active order changes
  useEffect(() => {
    if (selectedOrderId) {
      fetchOrderItems(selectedOrderId);
    } else {
      setItems([]);
      setCheckedItems({});
    }
  }, [selectedOrderId, fetchOrderItems]);

  // Refreshes the orders list from Supabase
  const refreshOrders = async () => {
    if (!storeProfile?.id) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

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
      // Graceful catch
    }
  };

  // Toggle checklist checkbox state for a specific order item
  const toggleItemCheck = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Check if all items in the checklist are fully checked off
  const isAllItemsChecked = () => {
    if (items.length === 0) return false;
    return items.every((item) => checkedItems[item.id] === true);
  };

  // Transitions the order status from preparing to ready for pickup
  const handleMarkReady = async (orderId) => {
    if (!isAllItemsChecked() || submittingReady) return;
    setSubmittingReady(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'ready',
          ready_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
      Alert.alert('Success', 'Order marked as Ready for Pickup!');
      await refreshOrders();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update order status');
    } finally {
      setSubmittingReady(false);
    }
  };

  // Transitions the order status to picked when handing over to the rider
  const handleHandover = async (orderId) => {
    if (submittingReady) return;
    setSubmittingReady(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'picked',
          picked_up_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
      Alert.alert('Success', 'Order handed over to Rider!');
      await refreshOrders();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update handover status');
    } finally {
      setSubmittingReady(false);
    }
  };

  // Open device dialer to call the assigned rider
  const callRider = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Unable to open dialer');
    });
  };

  // Get active order details object
  const activeOrder = activeOrdersList.find((o) => o.id === selectedOrderId);

  return (
    <View className="flex-1 bg-surface">
      {/* Top horizontally scrolling active orders list tab */}
      {activeOrdersList.length > 0 && (
        <View className="bg-white border-b border-border py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {activeOrdersList.map((order) => {
              const isSelected = order.id === selectedOrderId;
              return (
                <TouchableOpacity
                  key={order.id}
                  className={`mr-3 px-4 py-2.5 rounded-xl border flex-row items-center ${
                    isSelected
                      ? 'bg-brand border-brand'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => setSelectedOrderId(order.id)}
                >
                  <Ionicons
                    name="cube"
                    size={16}
                    color={isSelected ? '#FFFFFF' : '#6B7280'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-text-primary'
                    }`}
                  >
                    #{order.id?.slice(-4).toUpperCase()} •{' '}
                    {order.status === 'preparing' ? 'Packing' : 'Ready'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main active view container */}
      {activeOrder ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View className="bg-white border border-border rounded-2xl p-4 mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-text-secondary text-xs">Active Packing Order</Text>
              <Text className="text-lg font-bold text-text-primary mt-0.5">
                Order #{activeOrder.id?.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${
                activeOrder.status === 'preparing'
                  ? 'bg-warning-soft'
                  : 'bg-success-soft'
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  activeOrder.status === 'preparing'
                    ? 'text-warning'
                    : 'text-success'
                }`}
              >
                {activeOrder.status === 'preparing' ? 'Packing' : 'Ready'}
              </Text>
            </View>
          </View>

          {/* Earnings calculator card */}
          <View className="bg-success-soft border border-green-200 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-2">
                <Text className="text-success font-bold text-sm">Payout Settlement</Text>
                <Text className="text-text-secondary text-xs mt-1">
                  Total order value minus 18% ZapKart platform commission
                </Text>
              </View>
              <Text className="text-success text-2xl font-black">
                {formatCurrency(Number(activeOrder.subtotal || 0) * 0.82)}
              </Text>
            </View>
          </View>

          {/* Rider details card */}
          <View className="bg-white border border-border rounded-2xl p-5 mb-4">
            <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              Rider Assignment
            </Text>
            {activeOrder.rider_id ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-brand-soft rounded-full items-center justify-center">
                    <Ionicons name="bicycle" size={24} color="#FF6B00" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-text-primary font-bold text-base">
                      {activeOrder.riders?.name || 'Assigned Rider'}
                    </Text>
                    <Text className="text-text-secondary text-xs mt-1">
                      📍 1.2 km away • ETA 4 mins
                    </Text>
                  </View>
                </View>
                {activeOrder.riders?.phone && (
                  <TouchableOpacity
                    className="w-10 h-10 border border-border rounded-full items-center justify-center bg-surface active:bg-gray-100"
                    onPress={() => callRider(activeOrder.riders.phone)}
                  >
                    <Ionicons name="call" size={18} color="#FF6B00" />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="items-center py-2">
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#F59E0B" />
                  <Text className="text-warning font-semibold text-sm ml-2">
                    Searching for nearby riders...
                  </Text>
                </View>
                {/* Simulated searching progress */}
                <View className="w-full h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                  <View className="h-full bg-warning rounded-full animate-pulse w-2/3" />
                </View>
              </View>
            )}
          </View>

          {/* Packing checklist card */}
          <View className="bg-white border border-border rounded-2xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Packing Checklist
              </Text>
              <Text className="text-xs font-semibold text-brand">
                {items.filter((item) => checkedItems[item.id]).length}/{items.length} Checked
              </Text>
            </View>

            {loadingItems ? (
              <View className="py-6 justify-center items-center">
                <ActivityIndicator color="#FF6B00" />
              </View>
            ) : items.length > 0 ? (
              <View>
                {items.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      className="flex-row items-center py-3 border-b border-border last:border-b-0"
                      onPress={() => toggleItemCheck(item.id)}
                    >
                      <View
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          isChecked
                            ? 'bg-success border-success'
                            : 'bg-surface border-border'
                        }`}
                      >
                        {isChecked && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          className={`text-sm ${
                            isChecked
                              ? 'text-gray-400 line-through'
                              : 'text-text-primary font-medium'
                          }`}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-xs text-text-secondary mt-0.5">
                          Qty: {item.quantity}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text className="text-text-secondary text-sm py-4 text-center">
                No items found for this order.
              </Text>
            )}
          </View>

          {/* Confirm/Transition CTAs */}
          {activeOrder.status === 'preparing' ? (
            <TouchableOpacity
              className={`w-full h-14 rounded-xl items-center justify-center shadow-sm ${
                isAllItemsChecked() && !submittingReady
                  ? 'bg-brand active:bg-brand-dark'
                  : 'bg-gray-300'
              }`}
              disabled={!isAllItemsChecked() || submittingReady}
              onPress={() => handleMarkReady(activeOrder.id)}
            >
              {submittingReady ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-base">
                    {isAllItemsChecked() ? 'Mark Ready for Pickup' : 'Check all items to finish'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className={`w-full h-14 rounded-xl items-center justify-center shadow-sm bg-success active:opacity-90`}
              disabled={submittingReady}
              onPress={() => handleHandover(activeOrder.id)}
            >
              {submittingReady ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="bicycle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-base">
                    Hand over to Rider
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-4">
            <Ionicons name="flash-off" size={36} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-text-primary text-center">
            No Active Packing Orders
          </Text>
          <Text className="text-text-secondary text-sm text-center mt-2 px-6">
            Accept incoming orders to pack and track rider collections from here.
          </Text>
        </View>
      )}
    </View>
  );
}
