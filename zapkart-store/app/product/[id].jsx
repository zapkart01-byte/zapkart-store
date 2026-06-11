import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../src/services/supabase';
import {
  getCategories,
  uploadMultipleProductImages,
  upsertProduct,
} from '../../src/services/productService';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { formatCurrency } from '../../src/utils/formatters';

/**
 * Screen component for adding a new product or editing an existing product.
 */
export default function ProductDetailFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { storeProfile } = useAuthStore();

  const isNewProduct = id === 'new';

  // State variables for form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('1 pc');
  const [mrp, setMrp] = useState('');
  const [storePrice, setStorePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrls, setImageUrls] = useState([]);
  const [costPrice, setCostPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Status and data states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState({});

  // Fetch product data if editing, and fetch all categories
  useEffect(() => {
    /**
     * Initializes categories list and loads existing product data if editing.
     */
    const initializeData = async () => {
      try {
        const categoriesList = await getCategories();
        setCategories(categoriesList || []);

        if (!isNewProduct) {
          const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (product) {
            setName(product.name || '');
            setCategoryId(product.category_id || '');
            setUnit(product.unit || '1 pc');
            setMrp(String(product.platform_mrp || ''));
            setStorePrice(String(product.store_price || ''));
            setStock(String(product.stock || '0'));
            setImageUrls(product.image_urls || (product.image_url ? [product.image_url] : []));
            setCostPrice(product.cost_price ? String(product.cost_price) : '');
            setIsActive(product.is_active ?? true);
          }
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load product details. Please try again.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id, isNewProduct]);

  /**
   * Prompts the user to pick an image from their photo library and uploads it.
   */
  const handlePickImage = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow photo library access to upload a product image.'
      );
      return;
    }

    const maxAllowed = 5 - imageUrls.length;
    if (maxAllowed <= 0) {
      Alert.alert('Limit Reached', 'You can upload a maximum of 5 images per product.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxAllowed,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setUploadingImage(true);
      try {
        if (!storeProfile?.id) throw new Error('Store ID is missing');
        const localUris = result.assets.map(asset => asset.uri);
        const uploadedUrls = await uploadMultipleProductImages(storeProfile.id, localUris);
        setImageUrls((prev) => [...prev, ...uploadedUrls].slice(0, 5));
      } catch (err) {
        Alert.alert('Upload Failed', err.message || 'Failed to upload product image.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  /**
   * Validates form inputs and updates the validation errors state.
   */
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    }

    if (!unit.trim()) {
      newErrors.unit = 'Unit (e.g. 1 pc, 500g) is required';
      isValid = false;
    }

    const mrpVal = Number(mrp);
    const priceVal = Number(storePrice);

    if (isNaN(mrpVal) || mrpVal <= 0) {
      newErrors.mrp = 'Platform MRP must be a positive number';
      isValid = false;
    }

    if (isNaN(priceVal) || priceVal <= 0) {
      newErrors.storePrice = 'Store price must be a positive number';
      isValid = false;
    } else if (priceVal > mrpVal) {
      newErrors.storePrice = 'Store price cannot exceed Platform MRP';
      isValid = false;
    }

    const stockVal = Number(stock);
    if (isNaN(stockVal) || stockVal < 0) {
      newErrors.stock = 'Stock must be a non-negative number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Saves the product details (either creating or updating) to Supabase.
   */
  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);

    try {
      if (!storeProfile?.id) throw new Error('Store ID is missing');

      const productPayload = {
        store_id: storeProfile.id,
        name: name.trim(),
        category_id: categoryId || null,
        unit: unit.trim(),
        platform_mrp: Number(mrp),
        store_price: Number(storePrice),
        stock: Math.round(Number(stock)),
        image_url: imageUrls[0] || null,
        image_urls: imageUrls,
        cost_price: Number(costPrice) || 0,
        is_active: isActive,
      };

      if (!isNewProduct) {
        productPayload.id = id;
      }

      await upsertProduct(productPayload);
      Alert.alert('Success', `Product ${isNewProduct ? 'created' : 'updated'} successfully!`);
      router.back();
    } catch (err) {
      Alert.alert('Save Failed', err.message || 'Failed to save product details.');
    } finally {
      setSaving(false);
    }
  };

  // Helper calculations
  const parsedMrp = Number(mrp) || 0;
  const parsedPrice = Number(storePrice) || 0;
  const parsedCost = Number(costPrice) || 0;
  const payoutAmount = parsedPrice * 0.82; // 18% commission
  const profitAmount = parsedCost > 0 ? payoutAmount - parsedCost : null;
  const discountPercent = parsedMrp > 0 && parsedPrice < parsedMrp
    ? Math.round(((parsedMrp - parsedPrice) / parsedMrp) * 100)
    : 0;

  const getCategoryLabel = () => {
    return categories.find((c) => c.id === categoryId)?.name || 'Select Category';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="text-text-secondary mt-3 text-sm">Loading details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="my-6">
            <Text className="text-2xl font-bold text-text-primary">
              {isNewProduct ? 'Add New Product' : 'Edit Product'}
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              {isNewProduct ? 'List a new item in your inventory' : 'Update details for this product'}
            </Text>
          </View>

          {/* Image Upload Gallery */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-text-primary mb-3">
              Product Images (Max 5)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {imageUrls.map((url, index) => (
                <View key={url} className="w-24 h-24 rounded-2xl border border-border relative overflow-hidden mr-3 bg-surface">
                  <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  {index === 0 && (
                    <View className="absolute bottom-0 left-0 right-0 bg-brand py-0.5 items-center">
                      <Text className="text-[10px] text-white font-bold uppercase">Primary</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 items-center justify-center"
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}

              {imageUrls.length < 5 && (
                <TouchableOpacity
                  onPress={handlePickImage}
                  disabled={uploadingImage}
                  className="w-24 h-24 rounded-2xl bg-surface border border-dashed border-border items-center justify-center mr-3"
                >
                  {uploadingImage ? (
                    <ActivityIndicator color="#FF6B00" />
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera" size={24} color="#9CA3AF" />
                      <Text className="text-[10px] text-text-secondary mt-1 font-semibold">Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Product Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Product Name <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.name ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g. Fresh Apples"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              maxLength={100}
            />
            {errors.name ? <Text className="text-error text-xs mt-1">{errors.name}</Text> : null}
          </View>

          {/* Category Dropdown */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-text-primary mb-2">Category</Text>
            <TouchableOpacity
              className="h-[50px] bg-surface border border-border rounded-xl px-4 flex-row items-center justify-between"
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text className="text-text-primary text-base">{getCategoryLabel()}</Text>
              <Ionicons
                name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View className="bg-white border border-border rounded-xl mt-1 overflow-hidden shadow-sm">
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border bg-gray-50"
                  onPress={() => {
                    setCategoryId('');
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text className="text-text-secondary text-base">No Category</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`px-4 py-3 border-b border-border ${
                      categoryId === cat.id ? 'bg-brand-soft' : ''
                    }`}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        categoryId === cat.id ? 'text-brand font-semibold' : 'text-text-primary'
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Unit & Stock Row */}
          <View className="flex-row gap-4 mb-4">
            {/* Unit */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Unit <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                  errors.unit ? 'border-error' : 'border-border'
                }`}
                placeholder="e.g. 500g, 1 pc"
                placeholderTextColor="#9CA3AF"
                value={unit}
                onChangeText={(text) => {
                  setUnit(text);
                  if (errors.unit) setErrors((prev) => ({ ...prev, unit: '' }));
                }}
                maxLength={20}
              />
              {errors.unit ? <Text className="text-error text-xs mt-1">{errors.unit}</Text> : null}
            </View>

            {/* Stock */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Stock Quantity <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                  errors.stock ? 'border-error' : 'border-border'
                }`}
                placeholder="e.g. 15"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={stock}
                onChangeText={(text) => {
                  setStock(text.replace(/\D/g, ''));
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: '' }));
                }}
                maxLength={6}
              />
              {errors.stock ? <Text className="text-error text-xs mt-1">{errors.stock}</Text> : null}
            </View>
          </View>

          {/* MRP & Store Price Row */}
          <View className="flex-row gap-4 mb-4">
            {/* Platform MRP */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Platform MRP <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                  errors.mrp ? 'border-error' : 'border-border'
                }`}
                placeholder="e.g. 150"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={mrp}
                onChangeText={(text) => {
                  setMrp(text);
                  if (errors.mrp) setErrors((prev) => ({ ...prev, mrp: '' }));
                }}
                maxLength={6}
              />
              {errors.mrp ? <Text className="text-error text-xs mt-1">{errors.mrp}</Text> : null}
            </View>

            {/* Store Price */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-text-primary mb-2">
                Store Price <Text className="text-error">*</Text>
              </Text>
              <TextInput
                className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                  errors.storePrice ? 'border-error' : 'border-border'
                }`}
                placeholder="e.g. 120"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={storePrice}
                onChangeText={(text) => {
                  setStorePrice(text);
                  if (errors.storePrice) setErrors((prev) => ({ ...prev, storePrice: '' }));
                }}
                maxLength={6}
              />
              {errors.storePrice ? <Text className="text-error text-xs mt-1">{errors.storePrice}</Text> : null}
            </View>
          </View>

          {/* Cost Price Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Cost Price (₹) <Text className="text-text-secondary font-normal">(Optional — for profit calculation)</Text>
            </Text>
            <TextInput
              className="h-[50px] bg-surface border border-border rounded-xl px-4 text-text-primary text-base"
              placeholder="e.g. 90"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={costPrice}
              onChangeText={(text) => {
                setCostPrice(text);
              }}
              maxLength={6}
            />
          </View>

          {/* Payout & Discount Badges */}
          {parsedPrice > 0 && (
            <View className="bg-success-soft border border-green-200 rounded-2xl p-4 mb-5 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-success font-semibold text-sm">Your payout settlement (₹)</Text>
                <Text className="text-success font-bold text-lg">{formatCurrency(payoutAmount)}</Text>
              </View>
              <Text className="text-text-secondary text-xs">
                Reflects order value minus 18% ZapKart platform commission
              </Text>

              {parsedCost > 0 && (
                <View className="border-t border-green-200 mt-3 pt-3 flex-row justify-between items-center">
                  <View className="flex-1 pr-2">
                    <Text className="text-text-primary font-semibold text-sm">Estimated Net Profit (₹)</Text>
                    <Text className="text-text-secondary text-xs mt-0.5">
                      Payout (₹{payoutAmount.toFixed(2)}) - Cost Price (₹{parsedCost.toFixed(2)})
                    </Text>
                  </View>
                  <Text className={`font-bold text-lg ${profitAmount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {profitAmount >= 0 ? '+' : ''}{formatCurrency(profitAmount)}
                  </Text>
                </View>
              )}

              {discountPercent > 0 ? (
                <View className="bg-success px-2.5 py-1 rounded-full mt-3 self-start">
                  <Text className="text-white text-xs font-bold">{discountPercent}% OFF Platform MRP</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Active Switch Toggle */}
          <View className="flex-row items-center justify-between border border-border bg-surface rounded-2xl p-4 mb-6">
            <View>
              <Text className="text-sm font-bold text-text-primary">Enable Product</Text>
              <Text className="text-xs text-text-secondary mt-0.5">Visible to customers in search</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full p-1 ${isActive ? 'bg-success' : 'bg-gray-300'}`}
            >
              <View
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className={`w-full h-14 bg-brand rounded-xl justify-center items-center active:bg-brand-dark shadow-sm ${
              saving ? 'opacity-85' : ''
            }`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-base">Save Product</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
