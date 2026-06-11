import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import StepProgress from '../../components/registration/StepProgress';
import { useAuthStore } from '../../src/stores/useAuthStore';
import * as Location from 'expo-location';

// Dropdown options for store type selection
const STORE_TYPES = [
  { label: 'Grocery', value: 'grocery' },
  { label: 'Fruits & Vegetables', value: 'fruits_vegetables' },
  { label: 'Bakery & Sweets', value: 'bakery' },
  { label: 'Dairy & Milk', value: 'dairy' },
  { label: 'Pharmacy', value: 'pharmacy' },
  { label: 'General Store', value: 'general' },
  { label: 'Meat & Fish', value: 'meat_fish' },
  { label: 'Pet Supplies', value: 'pet_supplies' },
  { label: 'Other', value: 'other' },
];

// Delivery radius options in kilometres
const RADIUS_OPTIONS = [1, 2, 3, 4, 5, 7, 10];

// Step 1: Store details form — name, owner, address, category, and location
export default function StoreDetailsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Form field state
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [storeType, setStoreType] = useState('grocery');
  const [deliveryRadius, setDeliveryRadius] = useState(2);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Coordinates field state
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Error state for individual fields
  const [errors, setErrors] = useState({
    storeName: '',
    ownerName: '',
    address: '',
    coordinates: '',
  });

  // Requests location permission and gets current coordinates
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setErrors((prev) => ({ ...prev, coordinates: '' }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Permission to access location was denied. Please enter your coordinates manually.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (location?.coords) {
        setLatitude(String(location.coords.latitude.toFixed(6)));
        setLongitude(String(location.coords.longitude.toFixed(6)));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to detect location. Please enter coordinates manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  // Validates all required fields before proceeding to step 2
  const validateForm = () => {
    const newErrors = { storeName: '', ownerName: '', address: '', coordinates: '' };
    let isValid = true;

    if (!storeName.trim()) {
      newErrors.storeName = 'Store name is required';
      isValid = false;
    } else if (storeName.trim().length < 3) {
      newErrors.storeName = 'Store name must be at least 3 characters';
      isValid = false;
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
      isValid = false;
    } else if (ownerName.trim().length < 2) {
      newErrors.ownerName = 'Owner name must be at least 2 characters';
      isValid = false;
    }

    if (!address.trim()) {
      newErrors.address = 'Store address is required';
      isValid = false;
    } else if (address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address (at least 10 characters)';
      isValid = false;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (!latitude.trim() || !longitude.trim()) {
      newErrors.coordinates = 'Coordinates (Latitude and Longitude) are required';
      isValid = false;
    } else if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.coordinates = 'Latitude must be a valid number between -90 and 90';
      isValid = false;
    } else if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      newErrors.coordinates = 'Longitude must be a valid number between -180 and 180';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Navigates to step 2 with current form data serialized as params
  const handleNext = () => {
    if (!validateForm()) return;

    router.push({
      pathname: '/register/bank-details',
      params: {
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        address: address.trim(),
        storeType,
        deliveryRadius: String(deliveryRadius),
        phone: user?.phoneNumber || '',
        lat: latitude.trim(),
        lng: longitude.trim(),
      },
    });
  };

  // Returns the human-readable label for the selected store type
  const getStoreTypeLabel = () => {
    return STORE_TYPES.find((t) => t.value === storeType)?.label || 'Select Type';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Step progress bar */}
        <StepProgress currentStep={1} />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section header */}
          <View className="mb-6 mt-2">
            <Text className="text-xl font-bold text-text-primary">Store Details</Text>
            <Text className="text-sm text-text-secondary mt-1">
              Tell us about your store so customers can find you
            </Text>
          </View>

          {/* Store Name Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Store Name <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.storeName ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., Sharma General Store"
              placeholderTextColor="#9CA3AF"
              value={storeName}
              onChangeText={(text) => {
                setStoreName(text);
                if (errors.storeName) setErrors((prev) => ({ ...prev, storeName: '' }));
              }}
              maxLength={60}
            />
            {errors.storeName ? (
              <Text className="text-error text-xs mt-1">{errors.storeName}</Text>
            ) : null}
          </View>

          {/* Owner Name Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Owner Name <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`h-[50px] bg-surface border rounded-xl px-4 text-text-primary text-base ${
                errors.ownerName ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., Rajesh Sharma"
              placeholderTextColor="#9CA3AF"
              value={ownerName}
              onChangeText={(text) => {
                setOwnerName(text);
                if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: '' }));
              }}
              maxLength={50}
            />
            {errors.ownerName ? (
              <Text className="text-error text-xs mt-1">{errors.ownerName}</Text>
            ) : null}
          </View>

          {/* Store Address Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Store Address <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className={`bg-surface border rounded-xl px-4 pt-3 pb-3 text-text-primary text-base ${
                errors.address ? 'border-error' : 'border-border'
              }`}
              placeholder="e.g., 45, MG Road, Koramangala, Bengaluru 560034"
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
              style={{ minHeight: 80 }}
            />
            {errors.address ? (
              <Text className="text-error text-xs mt-1">{errors.address}</Text>
            ) : null}
          </View>

          {/* Store Coordinates Input */}
          <View className="mb-5 border border-border bg-surface rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-text-primary">
                Store Location Coordinates <Text className="text-error">*</Text>
              </Text>
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                className="bg-brand-soft px-3 py-1.5 rounded-lg flex-row items-center active:opacity-80"
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#FF6B00" />
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={14} color="#FF6B00" style={{ marginRight: 4 }} />
                    <Text className="text-brand text-xs font-bold">Detect Location</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              {/* Latitude Input */}
              <View className="flex-1">
                <Text className="text-xs text-text-secondary mb-1">Latitude</Text>
                <TextInput
                  className="h-10 bg-white border border-border rounded-lg px-3 text-text-primary text-sm font-medium"
                  placeholder="e.g. 12.9716"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={latitude}
                  onChangeText={(val) => {
                    setLatitude(val);
                    if (errors.coordinates) setErrors((prev) => ({ ...prev, coordinates: '' }));
                  }}
                />
              </View>

              {/* Longitude Input */}
              <View className="flex-1">
                <Text className="text-xs text-text-secondary mb-1">Longitude</Text>
                <TextInput
                  className="h-10 bg-white border border-border rounded-lg px-3 text-text-primary text-sm font-medium"
                  placeholder="e.g. 77.5946"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={longitude}
                  onChangeText={(val) => {
                    setLongitude(val);
                    if (errors.coordinates) setErrors((prev) => ({ ...prev, coordinates: '' }));
                  }}
                />
              </View>
            </View>
            {errors.coordinates ? (
              <Text className="text-error text-xs mt-2">{errors.coordinates}</Text>
            ) : null}
          </View>

          {/* Store Type Selector */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-text-primary mb-2">Store Category</Text>
            <TouchableOpacity
              className="h-[50px] bg-surface border border-border rounded-xl px-4 flex-row items-center justify-between"
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text className="text-text-primary text-base">{getStoreTypeLabel()}</Text>
              <Ionicons
                name={showTypeDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {/* Dropdown options list */}
            {showTypeDropdown && (
              <View className="bg-white border border-border rounded-xl mt-1 overflow-hidden shadow-sm">
                {STORE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    className={`px-4 py-3 border-b border-border ${
                      storeType === type.value ? 'bg-brand-soft' : ''
                    }`}
                    onPress={() => {
                      setStoreType(type.value);
                      setShowTypeDropdown(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        storeType === type.value
                          ? 'text-brand font-semibold'
                          : 'text-text-primary'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Delivery Radius Selector */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-text-primary mb-2">
              Delivery Radius
            </Text>
            <Text className="text-xs text-text-secondary mb-3">
              How far can you deliver orders? Choose the distance in kilometres.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {RADIUS_OPTIONS.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  className={`px-4 py-2 rounded-full border ${
                    deliveryRadius === radius
                      ? 'bg-brand border-brand'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => setDeliveryRadius(radius)}
                >
                  <Text
                    className={`text-sm font-medium ${
                      deliveryRadius === radius ? 'text-white' : 'text-text-primary'
                    }`}
                  >
                    {radius} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info card about location */}
          <View className="bg-info-soft border border-blue-100 rounded-xl p-4 mb-8">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#1D4ED8" />
              <Text className="text-info text-sm ml-2 flex-1">
                Your store location will be set to the address you entered.
                Customers within your delivery radius will see your store.
              </Text>
            </View>
          </View>

          {/* Continue CTA Button */}
          <TouchableOpacity
            className="w-full h-[52px] bg-brand rounded-xl items-center justify-center active:bg-brand-dark"
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-base mr-2">Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
