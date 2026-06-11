import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

/**
 * Delivery radius picker with 3 pill buttons (1km, 2km, 3km)
 * Single selection only
 * 
 * @param {Object} props
 * @param {number} props.selectedRadius - Currently selected radius (1, 2, or 3)
 * @param {function} props.onRadiusChange - Callback when radius is selected
 * @param {Array<number>} props.options - Array of radius options (default: [1, 2, 3])
 */
export default function DeliveryRadiusPicker({
  selectedRadius = 1,
  onRadiusChange,
  options = [1, 2, 3],
}) {
  /**
   * Handle radius selection
   */
  const handleSelect = (radius) => {
    if (onRadiusChange) {
      onRadiusChange(radius);
    }
  };

  return (
    <View className="w-full">
      {/* Label */}
      <Text className="text-xs font-medium text-text-primary mb-2 tracking-wide uppercase">
        Delivery Radius
      </Text>

      {/* Pill Buttons */}
      <View className="flex-row gap-2">
        {options.map((radius) => {
          const isSelected = selectedRadius === radius;

          return (
            <TouchableOpacity
              key={radius}
              onPress={() => handleSelect(radius)}
              activeOpacity={0.7}
              className={`flex-1 h-12 rounded-full items-center justify-center ${
                isSelected
                  ? 'bg-brand'
                  : 'bg-white border border-border'
              }`}
              style={{
                shadowColor: isSelected ? '#FF6B00' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSelected ? 0.15 : 0.05,
                shadowRadius: 4,
                elevation: isSelected ? 3 : 1,
              }}
            >
              <Text
                className={`font-semibold text-sm ${
                  isSelected ? 'text-white' : 'text-text-primary'
                }`}
              >
                {radius} km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Helper Text */}
      <Text className="text-text-secondary text-xs mt-2">
        Customers within this radius can order from your store
      </Text>
    </View>
  );
}
