# Quick Start Guide - Registration Components

## 🚀 Get Started in 5 Minutes

### Step 1: Import Components
```jsx
import {
  StepProgress,
  DeliveryRadiusPicker,
  ImagePickerCard,
  MapLocationPicker,
} from '@/components/registration';

import { FormInput } from '@/components/ui';
```

### Step 2: Set Up State
```jsx
const [storeName, setStoreName] = useState('');
const [address, setAddress] = useState('');
const [radius, setRadius] = useState(1);
const [showMap, setShowMap] = useState(false);
const [location, setLocation] = useState(null);
```

### Step 3: Use Components
```jsx
<View>
  {/* Progress */}
  <StepProgress currentStep={1} />
  
  {/* Text Input */}
  <FormInput
    label="Store Name"
    value={storeName}
    onChangeText={setStoreName}
    placeholder="Enter store name"
  />
  
  {/* Textarea */}
  <FormInput
    label="Address"
    value={address}
    onChangeText={setAddress}
    multiline
    numberOfLines={3}
  />
  
  {/* Radius Picker */}
  <DeliveryRadiusPicker
    selectedRadius={radius}
    onRadiusChange={setRadius}
  />
  
  {/* Map Button */}
  <Button onPress={() => setShowMap(true)}>
    Pin Location
  </Button>
  
  {/* Map Modal */}
  <MapLocationPicker
    visible={showMap}
    onClose={() => setShowMap(false)}
    onLocationConfirm={(lat, lng, addr) => {
      setLocation({ lat, lng, address: addr });
    }}
  />
</View>
```

## 📋 Complete Example

See `ExampleRegistrationScreen.jsx` for a full working example with:
- All components integrated
- Form validation
- Error handling
- Navigation logic
- Keyboard handling
- Safe area support

## 🎨 Styling Tips

All components use NativeWind v4 (Tailwind classes):

```jsx
// Add spacing
<FormInput style={{ marginTop: 16 }} />

// Responsive layout
<View className="flex-row gap-4">
  <FormInput className="flex-1" />
  <FormInput className="flex-1" />
</View>
```

## 🐛 Common Issues

### Issue: "Cannot find module '@/components/registration'"
**Solution:** Use relative imports or configure path aliases:
```jsx
import { StepProgress } from '../components/registration';
```

### Issue: Camera/Gallery not working
**Solution:** Permissions are requested automatically. Check app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow ZapKart Store to access your photos",
          "cameraPermission": "Allow ZapKart Store to access your camera"
        }
      ]
    ]
  }
}
```

### Issue: Location not working
**Solution:** Check app.json for location permissions:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow ZapKart Store to use your location"
        }
      ]
    ]
  }
}
```

## 📱 Testing

### iOS Simulator
```bash
npm run ios
# or
npx expo run:ios
```

### Android Emulator
```bash
npm run android
# or
npx expo run:android
```

### Physical Device
```bash
npx expo start
# Then scan QR code with Expo Go app
```

## 💡 Pro Tips

1. **Validation:** Add validation in parent component, not in reusable components
2. **Loading States:** Show loading indicators during API calls
3. **Error Handling:** Use FormInput's error prop for field-level errors
4. **Accessibility:** Add accessibilityLabel to all interactive elements
5. **Currency:** Always use ₹ symbol, never $

## 🔗 Resources

- **Full Documentation:** `README.md`
- **Complete Example:** `ExampleRegistrationScreen.jsx`
- **Design Reference:** `../../../zapkart-design/stitch_zapkart_store_app/`

## ✅ Checklist

Before deploying:
- [ ] All forms have validation
- [ ] Error messages are clear
- [ ] Permissions are configured in app.json
- [ ] Tested on iOS and Android
- [ ] Loading states implemented
- [ ] Navigation works correctly
- [ ] Data persists between steps

---

**Need Help?** Check the full README.md or ExampleRegistrationScreen.jsx
