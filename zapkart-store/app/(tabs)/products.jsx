import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import { deleteProduct } from '../../src/services/productService';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Screen component for managing the store product inventory.
 */
export default function ProductsScreen() {
  const router = useRouter();
  const { storeProfile } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, in_stock, low_stock, inactive

  /**
   * Fetches all products for the active store from Supabase.
   */
  const fetchProducts = useCallback(async () => {
    if (!storeProfile?.id) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeProfile.id)
        .order('name', { ascending: true });

      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      // Gracefully catch fetch errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeProfile?.id]);

  // Re-fetch products every time this screen gains focus (fixes visibility after add/edit)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  /**
   * Handles the pull-to-refresh action.
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  /**
   * Toggles the active status of a product.
   */
  const toggleProductActive = async (productId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !currentStatus } : p))
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle product status.');
    }
  };

  /**
   * Prompts the user to confirm deletion and removes the product.
   */
  const handleDeleteProduct = (productId, productName) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting product:', productId);
              await deleteProduct(productId);
              setProducts((prev) => prev.filter((p) => p.id !== productId));
              Alert.alert('Success', `${productName} deleted successfully`);
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Error', err.message || 'Failed to delete product. Check Supabase RLS policies.');
            }
          },
        },
      ]
    );
  };

  // Filter products client-side for rapid responses
  const filteredProducts = products.filter((p) => {
    // Search filter
    if (searchQuery.trim() && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status tier filter
    if (filter === 'in_stock') {
      return p.stock > 0 && p.is_active;
    }
    if (filter === 'low_stock') {
      return p.stock > 0 && p.stock <= 5 && p.is_active;
    }
    if (filter === 'inactive') {
      return !p.is_active;
    }

    return true;
  });

  /**
   * Returns visual status details (color, label) based on stock levels and activation status.
   */
  const getStockTier = (item) => {
    if (!item.is_active) {
      return { label: 'Disabled', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    }
    if (item.stock === 0) {
      return { label: 'Out of Stock', color: 'bg-error-soft text-error border-red-200' };
    }
    if (item.stock <= 5) {
      return { label: `Low Stock (${item.stock})`, color: 'bg-warning-soft text-warning border-yellow-200' };
    }
    return { label: 'In Stock', color: 'bg-success-soft text-success border-green-200' };
  };

  /**
   * Renders a product card item row.
   */
  const renderProductItem = ({ item }) => {
    const stockTier = getStockTier(item);
    const payout = Number(item.store_price || 0) * 0.82;
    const costPrice = Number(item.cost_price || 0);
    const profit = costPrice > 0 ? payout - costPrice : null;
    const thumbnailUrl = item.image_url || (item.image_urls && item.image_urls[0]) || null;

    return (
      <View className="bg-white border border-border rounded-2xl p-4 mb-3 shadow-sm flex-row items-center">
        {/* Product Image Thumbnail */}
        <View className="w-16 h-16 rounded-xl bg-surface border border-border items-center justify-center overflow-hidden mr-4">
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1 pr-2">
          <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-text-secondary text-xs mt-0.5">{item.unit}</Text>

          <View className="flex-row items-center mt-2 gap-2">
            <Text className="text-brand font-bold text-sm">
              {formatCurrency(Number(item.store_price || 0))}
            </Text>
            {item.platform_mrp > item.store_price ? (
              <Text className="text-xs text-text-secondary line-through">
                {formatCurrency(Number(item.platform_mrp || 0))}
              </Text>
            ) : null}
          </View>

          {/* Payout & Profit badges */}
          <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
            {/* Stock badge */}
            <View className={`px-2 py-0.5 rounded-full border ${stockTier.color}`}>
              <Text className="text-[10px] font-bold uppercase tracking-wider">{stockTier.label}</Text>
            </View>
            {/* Payout badge */}
            <View className="px-2 py-0.5 rounded-full border bg-green-50 border-green-200">
              <Text className="text-[10px] font-bold text-green-700">
                Payout: {formatCurrency(payout)}
              </Text>
            </View>
            {/* Profit badge (only if cost_price is set) */}
            {profit !== null ? (
              <View className={`px-2 py-0.5 rounded-full border ${profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <Text className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {profit >= 0 ? 'Profit' : 'Loss'}: {formatCurrency(Math.abs(profit))}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Action Controls */}
        <View className="items-end gap-3 ml-2">
          <Switch
            value={item.is_active}
            onValueChange={() => toggleProductActive(item.id, item.is_active)}
            trackColor={{ false: '#D1D5DB', true: '#DCFCE7' }}
            thumbColor={item.is_active ? '#16A34A' : '#9CA3AF'}
          />

          <View className="flex-row gap-2">
            {/* Edit button */}
            <TouchableOpacity
              onPress={() => router.push(`/product/${item.id}`)}
              className="w-8 h-8 rounded-full border border-border bg-surface items-center justify-center active:bg-gray-100"
            >
              <Ionicons name="pencil" size={14} color="#6B7280" />
            </TouchableOpacity>

            {/* Delete button */}
            <TouchableOpacity
              onPress={() => handleDeleteProduct(item.id, item.name)}
              className="w-8 h-8 rounded-full border border-red-100 bg-red-50 items-center justify-center active:bg-red-100"
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Search and Filters Container */}
      <View className="bg-white border-b border-border p-4">
        {/* Search Input */}
        <View className="flex-row items-center border border-border bg-surface rounded-xl px-3 h-10 mb-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-text-primary text-sm font-medium h-full"
            placeholder="Search products in inventory..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'in_stock', label: 'In Stock' },
            { key: 'low_stock', label: 'Low Stock' },
            { key: 'inactive', label: 'Inactive' },
          ].map((pill) => (
            <TouchableOpacity
              key={pill.key}
              className={`px-4 py-1.5 rounded-full border mr-2 ${
                filter === pill.key ? 'bg-brand border-brand' : 'bg-surface border-border'
              }`}
              onPress={() => setFilter(pill.key)}
            >
              <Text
                className={`text-xs font-semibold ${
                  filter === pill.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products list */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />
          }
          ListEmptyComponent={
            <View className="py-20 justify-center items-center px-6">
              <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center mb-4">
                <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-bold text-text-primary text-center">No Products Found</Text>
              <Text className="text-text-secondary text-sm text-center mt-2">
                Try changing your search query or status filter.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) for adding product */}
      <TouchableOpacity
        onPress={() => router.push('/product/new')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-brand rounded-full items-center justify-center shadow-lg active:bg-brand-dark"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
