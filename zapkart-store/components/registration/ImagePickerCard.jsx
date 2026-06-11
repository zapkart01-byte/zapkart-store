import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

/**
 * Document upload card component with camera/gallery selection
 * 
 * @param {Object} props
 * @param {string} props.label - Document type label (e.g., "Store Photo", "GSTIN Certificate")
 * @param {string} props.documentType - Type identifier for the document
 * @param {function} props.onImageSelected - Callback when image is selected (uri, type)
 * @param {string} props.existingImage - URI of existing uploaded image
 * @param {boolean} props.required - Whether this document is required
 */
export default function ImagePickerCard({
  label,
  documentType,
  onImageSelected,
  existingImage = null,
  required = false,
}) {
  const [imageUri, setImageUri] = useState(existingImage);
  const [uploading, setUploading] = useState(false);

  /**
   * Request camera permissions and open camera
   */
  const openCamera = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  /**
   * Request media library permissions and open gallery
   */
  const openGallery = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Gallery permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  /**
   * Handle image selection and simulate upload
   */
  const handleImageSelected = async (uri) => {
    setUploading(true);
    setImageUri(uri);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setUploading(false);

    // Notify parent component
    if (onImageSelected) {
      onImageSelected(uri, documentType);
    }
  };

  /**
   * Show action sheet to choose between camera and gallery
   */
  const showImageOptions = () => {
    Alert.alert(
      'Upload Document',
      'Choose an option to upload your document',
      [
        {
          text: 'Take Photo',
          onPress: openCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="w-full mb-4">
      {/* Label */}
      <View className="flex-row items-center mb-2">
        <Text className="text-xs font-medium text-text-primary tracking-wide uppercase">
          {label}
        </Text>
        {required && (
          <Text className="text-error text-xs ml-1">*</Text>
        )}
      </View>

      {/* Upload Card */}
      <TouchableOpacity
        onPress={showImageOptions}
        disabled={uploading}
        className={`rounded-xl overflow-hidden ${
          imageUri
            ? 'border-2 border-brand bg-white'
            : 'border-2 border-dashed border-border bg-surface'
        }`}
        style={{ height: 160 }}
      >
        {uploading ? (
          // Loading State
          <View className="flex-1 items-center justify-center bg-surface">
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text className="text-text-secondary text-sm mt-2">Uploading...</Text>
          </View>
        ) : imageUri ? (
          // Image Preview
          <View className="flex-1">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Overlay with edit icon */}
            <View className="absolute inset-0 bg-black/20 items-center justify-center">
              <View className="bg-white/90 rounded-full p-2">
                <Ionicons name="camera" size={24} color="#FF6B00" />
              </View>
              <Text className="text-white text-xs font-medium mt-2 bg-black/60 px-3 py-1 rounded-full">
                Tap to change
              </Text>
            </View>
          </View>
        ) : (
          // Empty State
          <View className="flex-1 items-center justify-center">
            <View className="bg-brand-soft rounded-full p-4 mb-3">
              <Ionicons name="camera-outline" size={32} color="#FF6B00" />
            </View>
            <Text className="text-text-primary font-medium text-sm">Upload Document</Text>
            <Text className="text-text-secondary text-xs mt-1">
              Take photo or choose from gallery
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Upload Instructions */}
      {!imageUri && (
        <Text className="text-text-secondary text-xs mt-2">
          Supported formats: JPG, PNG • Max size: 5MB
        </Text>
      )}
    </View>
  );
}
