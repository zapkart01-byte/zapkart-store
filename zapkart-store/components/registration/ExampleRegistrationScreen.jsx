/**
 * Example: Complete Store Registration Step 1 Screen
 * 
 * This is a complete example showing how to use all registration components together.
 * Copy and adapt this to your actual registration screen in app/registration/
 * 
 * @example
 * import ExampleRegistrationScreen from '@/components/registration/ExampleRegistrationScreen';
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import registration components
import StepProgress from './StepProgress';
import DeliveryRadiusPicker from './DeliveryRadiusPicker';
import ImagePickerCard from './ImagePickerCard';
import MapLocationPicker from './MapLocationPicker';
import FormInput from '../ui/FormInput';

export default function ExampleRegistrationScreen() {
  // Form state
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [address, setAddress] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [radius, setRadius] = useState(1);
  const [storePhoto, setStorePhoto] = useState(null);
  
  // Map state
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  
  // Validation errors
  const [errors, setErrors] = useState({});

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {};

    if (!storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    
    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    
    if (!storeType) {
      newErrors.storeType = 'Please select store type';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!location) {
      newErrors.location = 'Please pin your store location on map';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle location confirmation from map
   */
  const handleLocationConfirm = (lat, lng, addr) => {
    setLocation({ latitude: lat, longitude: lng, address: addr });
    setAddress(addr); // Auto-fill address
    setShowMap(false);
    
    // Clear location error if exists
    if (errors.location) {
      setErrors({ ...errors, location: undefined });
    }
  };

  /**
   * Handle next button press
   */
  const handleNext = () => {
    if (validateForm()) {
      // Form is valid, proceed to next step
      const formData = {
        storeName,
        ownerName,
        storeType,
        address,
        location,
        openingTime,
        closingTime,
        deliveryRadius: radius,
        storePhoto,
      };

      console.log('Form Data:', formData);
      Alert.alert('Success', 'Proceeding to Step 2: Bank Details');
      
      // Navigate to next screen
      // navigation.navigate('RegistrationStep2', { data: formData });
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-border px-5 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              // navigation.goBack();
              console.log('Back pressed');
            }}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#0D0D0D" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-text-primary">
            Register Store
          </Text>
        </View>

        {/* Progress Indicator */}
        <StepProgress currentStep={1} />

        {/* Form Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-text-primary mb-1">
              Tell us about your store
            </Text>
            <Text className="text-sm text-text-secondary">
              Step 1 of 3 — Store Information
            </Text>
          </View>

          {/* Form Inputs */}
          <View className="space-y-4">
            <FormInput
              label="Store Name"
              value={storeName}
              onChangeText={(text) => {
                setStoreName(text);
                if (errors.storeName) setErrors({ ...errors, storeName: undefined });
              }}
              placeholder="e.g. Sharma General Store"
              error={errors.storeName}
            />

            <FormInput
              label="Owner Full Name"
              value={ownerName}
              onChangeText={(text) => {
                setOwnerName(text);
                if (errors.ownerName) setErrors({ ...errors, ownerName: undefined });
              }}
              placeholder="e.g. Rahul Sharma"
              error={errors.ownerName}
              style={{ marginTop: 16 }}
            />

            <FormInput
              label="Phone Number"
              value="+91 98765 43210"
              type="tel"
              readOnly
              showLock
              style={{ marginTop: 16 }}
            />

            <FormInput
              label="Store Type"
              value={storeType}
              onChangeText={setStoreType}
              placeholder="Select category"
              type="select"
              error={errors.storeType}
              style={{ marginTop: 16 }}
            />

            <FormInput
              label="Full Address"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) setErrors({ ...errors, address: undefined });
              }}
              multiline
              numberOfLines={3}
              placeholder="Shop No, Building, Street, Area..."
              error={errors.address}
              style={{ marginTop: 16 }}
            />

            {/* Pin Location Button */}
            <TouchableOpacity
              onPress={() => setShowMap(true)}
              className="mt-4 mb-2 bg-white border-2 border-brand rounded-xl p-4 flex-row items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={20} color="#FF6B00" />
              <Text className="text-brand font-semibold text-base ml-2">
                Pin Your Store on Map
              </Text>
            </TouchableOpacity>

            {/* Location Preview */}
            {location && (
              <View className="bg-success-soft border border-success/20 rounded-xl p-3 flex-row items-start">
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                <View className="flex-1 ml-2">
                  <Text className="text-success font-medium text-sm mb-1">
                    Location Pinned
                  </Text>
                  <Text className="text-text-secondary text-xs" numberOfLines={2}>
                    {location.address}
                  </Text>
                </View>
              </View>
            )}

            {errors.location && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text className="text-xs text-error ml-1">{errors.location}</Text>
              </View>
            )}

            {/* Opening/Closing Time */}
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1">
                <FormInput
                  label="Opening Time"
                  value={openingTime}
                  onChangeText={setOpeningTime}
                  type="time"
                />
              </View>
              <View className="flex-1">
                <FormInput
                  label="Closing Time"
                  value={closingTime}
                  onChangeText={setClosingTime}
                  type="time"
                />
              </View>
            </View>

            {/* Delivery Radius Picker */}
            <View className="mt-4">
              <DeliveryRadiusPicker
                selectedRadius={radius}
                onRadiusChange={setRadius}
              />
            </View>

            {/* Store Photo Upload (Optional) */}
            <View className="mt-6">
              <ImagePickerCard
                label="Store Front Photo"
                documentType="store_photo"
                onImageSelected={(uri, type) => setStorePhoto(uri)}
                existingImage={storePhoto}
                required={false}
              />
            </View>
          </View>

          {/* Bottom Spacing */}
          <View className="h-8" />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View className="bg-white border-t border-border px-5 py-4">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-brand h-14 rounded-2xl flex-row items-center justify-center"
            activeOpacity={0.8}
            style={{
              shadowColor: '#FF6B00',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white font-semibold text-base mr-2">
              Next: Bank Details
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="flex-row items-center justify-center mt-3">
            <Ionicons name="shield-checkmark" size={14} color="#6B7280" />
            <Text className="text-text-secondary text-xs ml-1">
              Your information is secure and encrypted
            </Text>
          </View>
        </View>

        {/* Map Location Picker Modal */}
        <MapLocationPicker
          visible={showMap}
          onClose={() => setShowMap(false)}
          onLocationConfirm={handleLocationConfirm}
          initialLocation={location}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
