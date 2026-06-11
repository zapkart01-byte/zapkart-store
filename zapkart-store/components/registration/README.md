# Registration UI Components

This directory contains reusable UI components for the 3-step store registration flow in the ZapKart Store App.

## Components

### 1. StepProgress
**Location:** `components/registration/StepProgress.jsx`

A horizontal 3-step progress indicator with active/completed states.

**Features:**
- 3 steps: Store Details → Bank Details → Documents
- Active step: orange circle (#FF6B00)
- Completed steps: green checkmark
- Animated progress bar
- Step labels below circles

**Props:**
```javascript
{
  currentStep: number // 1, 2, or 3 (default: 1)
}
```

**Usage:**
```jsx
import { StepProgress } from '@/components/registration';

<StepProgress currentStep={1} />
```

---

### 2. FormInput
**Location:** `components/ui/FormInput.jsx`

Reusable form input component with validation states and multiple input types.

**Features:**
- Support for text, tel, time, textarea, select
- Validation states (default, focus, error)
- Lock icon for read-only fields
- Border color transitions
- 12px border radius
- Orange (#FF6B00) focus ring

**Props:**
```javascript
{
  label: string,              // Field label
  value: string,              // Input value
  onChangeText: function,     // Change handler
  placeholder: string,        // Placeholder text
  error: string,              // Error message
  type: string,               // 'text' | 'tel' | 'time' | 'textarea' | 'select'
  readOnly: boolean,          // Read-only state
  showLock: boolean,          // Show lock icon
  multiline: boolean,         // Enable multiline
  numberOfLines: number,      // Lines for textarea
  keyboardType: string,       // Keyboard type
  options: array,             // Options for select
  style: object               // Additional styles
}
```

**Usage:**
```jsx
import { FormInput } from '@/components/ui';

// Text input
<FormInput
  label="Store Name"
  value={storeName}
  onChangeText={setStoreName}
  placeholder="e.g. Sharma General Store"
/>

// Phone input (read-only with lock)
<FormInput
  label="Phone Number"
  value="+91 98765 43210"
  type="tel"
  readOnly
  showLock
/>

// Textarea
<FormInput
  label="Full Address"
  value={address}
  onChangeText={setAddress}
  multiline
  numberOfLines={3}
  placeholder="Shop No, Building, Street..."
/>

// With error
<FormInput
  label="Store Name"
  value={storeName}
  onChangeText={setStoreName}
  error="Store name is required"
/>
```

---

### 3. DeliveryRadiusPicker
**Location:** `components/registration/DeliveryRadiusPicker.jsx`

3 pill-style radio buttons for selecting delivery radius (1km, 2km, 3km).

**Features:**
- Single selection only
- Active: orange background (#FF6B00), white text
- Inactive: white background, grey border
- Rounded pill shape
- Subtle shadow effects

**Props:**
```javascript
{
  selectedRadius: number,     // Currently selected (1, 2, or 3)
  onRadiusChange: function,   // Callback(radius)
  options: array              // Custom radius options (default: [1, 2, 3])
}
```

**Usage:**
```jsx
import { DeliveryRadiusPicker } from '@/components/registration';

const [radius, setRadius] = useState(1);

<DeliveryRadiusPicker
  selectedRadius={radius}
  onRadiusChange={setRadius}
/>
```

---

### 4. ImagePickerCard
**Location:** `components/registration/ImagePickerCard.jsx`

Document upload card with camera/gallery selection and preview.

**Features:**
- Camera and gallery picker integration
- Upload progress indicator
- Thumbnail preview after upload
- Dashed border when empty, solid when uploaded
- Permission handling
- Loading states

**Props:**
```javascript
{
  label: string,              // Document label
  documentType: string,       // Type identifier
  onImageSelected: function,  // Callback(uri, type)
  existingImage: string,      // Existing image URI
  required: boolean           // Show required asterisk
}
```

**Usage:**
```jsx
import { ImagePickerCard } from '@/components/registration';

const [storePhoto, setStorePhoto] = useState(null);

<ImagePickerCard
  label="Store Front Photo"
  documentType="store_photo"
  onImageSelected={(uri, type) => setStorePhoto(uri)}
  existingImage={storePhoto}
  required
/>
```

---

### 5. MapLocationPicker
**Location:** `components/registration/MapLocationPicker.jsx`

Full-screen modal for pinning store location on a map.

**Features:**
- Full-screen modal presentation
- Location permission handling
- Current location detection
- Reverse geocoding (coordinates → address)
- Pin indicator at center
- Recenter button
- Confirm location button

**Props:**
```javascript
{
  visible: boolean,              // Modal visibility
  onClose: function,             // Close callback
  onLocationConfirm: function,   // Callback(lat, lng, address)
  initialLocation: object        // { latitude, longitude }
}
```

**Usage:**
```jsx
import { MapLocationPicker } from '@/components/registration';

const [showMap, setShowMap] = useState(false);
const [location, setLocation] = useState(null);

<MapLocationPicker
  visible={showMap}
  onClose={() => setShowMap(false)}
  onLocationConfirm={(lat, lng, address) => {
    setLocation({ lat, lng, address });
    setShowMap(false);
  }}
  initialLocation={location}
/>
```

**Note:** Currently uses expo-location with a placeholder map view. For production, integrate with:
- `@rnmapbox/maps` (Mapbox)
- `react-native-maps` (Google/Apple Maps)
- `@maplibre/maplibre-react-native` (MapLibre)

---

## Design System

### Colors
```javascript
{
  brand: '#FF6B00',          // Primary orange
  brandSoft: '#FFF0E6',      // Soft orange tint
  brandDark: '#CC5500',      // Pressed/hover states
  surface: '#F8F9FA',        // Surface backgrounds
  border: '#E9ECEF',         // Borders
  textPrimary: '#0D0D0D',    // Main text
  textSecondary: '#6B7280',  // Labels/helper text
  success: '#16A34A',        // Success states
  error: '#EF4444',          // Error states
}
```

### Typography
- Font family: Inter
- Input text: 16px (base)
- Labels: 12px (xs) uppercase with tracking
- Helper text: 12px (xs)

### Spacing
- Border radius: 12px (rounded-xl)
- Input height: 48px (h-12)
- Padding: 16px (p-4)
- Gap between elements: 8px (gap-2) or 16px (gap-4)

### Shadows
```javascript
// Card/Input shadow
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 1, // Android
}

// Button shadow
{
  shadowColor: '#FF6B00',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4, // Android
}
```

---

## Dependencies

These components use the following dependencies (already in package.json):

```json
{
  "@expo/vector-icons": "^15.0.2",
  "expo-image-picker": "~56.0.15",
  "expo-location": "~56.0.15",
  "nativewind": "^4.2.4",
  "react-native": "0.85.3"
}
```

---

## Integration Example

Complete registration screen example:

```jsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import {
  StepProgress,
  DeliveryRadiusPicker,
  ImagePickerCard,
  MapLocationPicker,
} from '@/components/registration';
import { FormInput } from '@/components/ui';

export default function StoreRegistrationStep1() {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);

  const handleNext = () => {
    // Validation and navigation logic
  };

  return (
    <View className="flex-1 bg-surface">
      <StepProgress currentStep={1} />
      
      <ScrollView className="flex-1 px-5 py-6">
        <Text className="text-2xl font-bold text-text-primary mb-2">
          Tell us about your store
        </Text>
        <Text className="text-sm text-text-secondary mb-6">
          Step 1 of 3 — Store Information
        </Text>

        <FormInput
          label="Store Name"
          value={storeName}
          onChangeText={setStoreName}
          placeholder="e.g. Sharma General Store"
        />

        <FormInput
          label="Owner Full Name"
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="e.g. Rahul Sharma"
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
          label="Full Address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          placeholder="Shop No, Building, Street, Area..."
          style={{ marginTop: 16 }}
        />

        <TouchableOpacity
          onPress={() => setShowMap(true)}
          className="mt-4 mb-4"
        >
          <Text className="text-brand font-semibold">
            📍 Pin Store on Map
          </Text>
        </TouchableOpacity>

        <DeliveryRadiusPicker
          selectedRadius={radius}
          onRadiusChange={setRadius}
        />
      </ScrollView>

      <View className="p-5 bg-white border-t border-border">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-brand h-14 rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-semibold text-base">
            Next: Bank Details →
          </Text>
        </TouchableOpacity>
      </View>

      <MapLocationPicker
        visible={showMap}
        onClose={() => setShowMap(false)}
        onLocationConfirm={(lat, lng, addr) => {
          setLocation({ lat, lng, address: addr });
          setShowMap(false);
        }}
      />
    </View>
  );
}
```

---

## Notes

1. **Currency Symbol**: Always use ₹ (Indian Rupee) instead of $.

2. **Validation**: Add validation logic in parent components. FormInput already displays error messages.

3. **Permissions**: ImagePickerCard and MapLocationPicker handle their own permission requests.

4. **Map Integration**: MapLocationPicker is currently a placeholder. Integrate with a real map library for production.

5. **Styling**: All components use NativeWind v4 (Tailwind classes) for styling consistency.

6. **Accessibility**: Consider adding accessibility props (accessibilityLabel, accessibilityHint) for better screen reader support.

---

## Design Reference

All components follow the design system from:
`zapkart-design/stitch_zapkart_store_app/store_registration_step_1/code.html`
