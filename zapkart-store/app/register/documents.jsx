import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import StepProgress from '../../components/registration/StepProgress';
import { supabase } from '../../src/services/supabase';
import { registerStore } from '../../src/services/storeService';
import { useAuthStore } from '../../src/stores/useAuthStore';

// Document type definitions for KYC uploads
const REQUIRED_DOCUMENTS = [
  {
    key: 'aadhaar_front',
    label: 'Aadhaar Card (Front)',
    description: 'Front side of your Aadhaar card',
    icon: 'card-outline',
  },
  {
    key: 'aadhaar_back',
    label: 'Aadhaar Card (Back)',
    description: 'Back side of your Aadhaar card',
    icon: 'card-outline',
  },
  {
    key: 'pan_card',
    label: 'PAN Card',
    description: 'Clear photo of your PAN card',
    icon: 'document-text-outline',
  },
  {
    key: 'store_photo',
    label: 'Store Front Photo',
    description: 'Photo of your physical store',
    icon: 'storefront-outline',
  },
];

// Step 3: Document upload screen — uploads KYC images to Supabase storage
export default function DocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, setStoreProfile } = useAuthStore();

  // Tracks uploaded document URIs keyed by document type
  const [documents, setDocuments] = useState({});
  // Tracks which document is currently uploading
  const [uploadingKey, setUploadingKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Opens the device image picker for the specified document type
  const pickImage = async (docKey) => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow camera roll access to upload documents.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadDocument(docKey, result.assets[0]);
    }
  };

  // Opens the device camera for capturing a document photo
  const takePhoto = async (docKey) => {
    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to capture documents.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadDocument(docKey, result.assets[0]);
    }
  };

  // Uploads the selected image to Supabase storage bucket
  const uploadDocument = async (docKey, asset) => {
    setUploadingKey(docKey);
    setError(null);

    try {
      const fileExtension = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${docKey}.${fileExtension}`;
      const filePath = `store-documents/${user?.uid || 'unknown'}/${fileName}`;

      // Read the image file as a blob for upload
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: `image/${fileExtension}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          uri: asset.uri,
          publicUrl: urlData?.publicUrl || '',
          path: filePath,
        },
      }));
    } catch (err) {
      setError(`Failed to upload ${docKey}: ${err.message}`);
    } finally {
      setUploadingKey(null);
    }
  };

  // Removes a previously uploaded document
  const removeDocument = (docKey) => {
    setDocuments((prev) => {
      const updated = { ...prev };
      delete updated[docKey];
      return updated;
    });
  };

  // Checks if all required documents have been uploaded
  const allDocumentsUploaded = REQUIRED_DOCUMENTS.every(
    (doc) => documents[doc.key]
  );

  // Submits the complete registration to the backend API
  const handleSubmit = async () => {
    if (!allDocumentsUploaded) {
      setError('Please upload all required documents before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Build the registration payload with all 3 steps' data
      const storePayload = {
        store_name: params.storeName,
        owner_name: params.ownerName,
        owner_phone: params.phone || user?.phoneNumber || '',
        address: params.address,
        store_type: params.storeType || 'grocery',
        delivery_radius_km: Number(params.deliveryRadius) || 2,
        bank_account: params.bankAccount,
        bank_ifsc: params.bankIfsc,
        gstin: params.gstin || null,
        lat: Number(params.lat) || 12.9716,
        lng: Number(params.lng) || 77.5946,
        status: 'pending',
        commission_rate: 0.18,
        is_open: false,
        rating: 5.0,
        total_orders: 0,
        cancellation_count: 0,
        firebase_uid: user?.uid || '',
        documents: REQUIRED_DOCUMENTS.map((doc) => ({
          type: doc.key,
          url: documents[doc.key]?.publicUrl || '',
          path: documents[doc.key]?.path || '',
        })),
      };

      const result = await registerStore(storePayload);
      setStoreProfile(result);

      // Navigate to the pending review screen
      router.replace('/register/pending');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate back to step 2
  const handleBack = () => {
    router.back();
  };

  // Presents an action sheet to choose between camera and gallery
  const showImageOptions = (docKey) => {
    if (Platform.OS === 'web') {
      pickImage(docKey);
    } else {
      Alert.alert('Upload Document', 'Choose how to upload your document', [
        { text: 'Take Photo', onPress: () => takePhoto(docKey) },
        { text: 'Choose from Gallery', onPress: () => pickImage(docKey) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Step progress bar */}
        <StepProgress currentStep={3} />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section header */}
          <View className="mb-6 mt-2">
            <Text className="text-xl font-bold text-text-primary">
              Upload Documents
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              Upload clear photos of your KYC documents for verification
            </Text>
          </View>

          {/* Document upload cards */}
          {REQUIRED_DOCUMENTS.map((doc) => {
            const isUploaded = !!documents[doc.key];
            const isUploading = uploadingKey === doc.key;

            return (
              <View
                key={doc.key}
                className={`mb-4 border rounded-xl overflow-hidden ${
                  isUploaded
                    ? 'border-success bg-success-soft'
                    : 'border-border bg-surface'
                }`}
              >
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      {/* Document icon or checkmark */}
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          isUploaded ? 'bg-success' : 'bg-white border border-border'
                        }`}
                      >
                        {isUploaded ? (
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        ) : (
                          <Ionicons
                            name={doc.icon}
                            size={20}
                            color="#6B7280"
                          />
                        )}
                      </View>

                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold text-text-primary">
                          {doc.label}
                        </Text>
                        <Text className="text-xs text-text-secondary mt-0.5">
                          {doc.description}
                        </Text>
                      </View>
                    </View>

                    {/* Upload / uploading / remove controls */}
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FF6B00" />
                    ) : isUploaded ? (
                      <TouchableOpacity
                        className="px-3 py-1.5 bg-white border border-error rounded-lg"
                        onPress={() => removeDocument(doc.key)}
                      >
                        <Text className="text-error text-xs font-medium">
                          Remove
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className="px-4 py-2 bg-brand rounded-lg active:bg-brand-dark"
                        onPress={() => showImageOptions(doc.key)}
                      >
                        <Text className="text-white text-xs font-bold">
                          Upload
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Preview the uploaded image thumbnail */}
                  {isUploaded && !!documents[doc.key]?.uri ? (
                    <View className="mt-3 rounded-lg overflow-hidden border border-green-200">
                      <Image
                        source={{ uri: documents[doc.key].uri }}
                        style={{ width: '100%', height: 120 }}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}

          {/* Upload progress summary */}
          <View className="bg-surface border border-border rounded-xl p-4 mt-2 mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-text-secondary">Documents uploaded</Text>
              <Text className="text-sm font-bold text-text-primary">
                {Object.keys(documents).length}/{REQUIRED_DOCUMENTS.length}
              </Text>
            </View>
            {/* Progress bar */}
            <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <View
                className="h-full bg-brand rounded-full"
                style={{
                  width: `${
                    (Object.keys(documents).length / REQUIRED_DOCUMENTS.length) * 100
                  }%`,
                }}
              />
            </View>
          </View>

          {/* Error display */}
          {error ? (
            <View className="bg-error-soft border border-red-100 rounded-xl p-3 mb-6">
              <Text className="text-error text-sm text-center font-medium">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Navigation buttons row */}
          <View className="flex-row gap-3">
            {/* Back button */}
            <TouchableOpacity
              className="flex-1 h-[52px] border border-border rounded-xl items-center justify-center"
              onPress={handleBack}
              disabled={submitting}
            >
              <View className="flex-row items-center">
                <Ionicons name="arrow-back" size={18} color="#0D0D0D" />
                <Text className="text-text-primary font-bold text-base ml-2">
                  Back
                </Text>
              </View>
            </TouchableOpacity>

            {/* Submit registration button */}
            <TouchableOpacity
              className={`flex-[2] h-[52px] rounded-xl items-center justify-center ${
                allDocumentsUploaded && !submitting
                  ? 'bg-success active:opacity-90'
                  : 'bg-gray-300'
              }`}
              onPress={handleSubmit}
              disabled={!allDocumentsUploaded || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2">
                    Submit Application
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
