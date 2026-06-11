import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable form input component with label and validation states
 * 
 * @param {Object} props
 * @param {string} props.label - Input field label
 * @param {string} props.value - Input value
 * @param {function} props.onChangeText - Value change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {string} props.type - Input type: 'text', 'tel', 'time', 'textarea', 'select'
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {boolean} props.showLock - Show lock icon for read-only fields
 * @param {boolean} props.multiline - Enable multiline input (textarea)
 * @param {number} props.numberOfLines - Number of lines for textarea
 * @param {string} props.keyboardType - Keyboard type for input
 * @param {Array} props.options - Options array for select type [{label, value}]
 * @param {Object} props.style - Additional container styles
 */
export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder = '',
  error = '',
  type = 'text',
  readOnly = false,
  showLock = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  options = [],
  style = {},
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Determine keyboard type based on input type
  const getKeyboardType = () => {
    if (keyboardType !== 'default') return keyboardType;
    if (type === 'tel') return 'phone-pad';
    return 'default';
  };

  // Base input styles
  const inputBaseClasses = `w-full px-4 rounded-xl font-inter ${
    multiline ? 'py-3 h-20' : 'h-12'
  } text-base text-text-primary`;

  // Border and background styles based on state
  const getInputStateClasses = () => {
    if (error) {
      return 'bg-error-soft border-2 border-error';
    }
    if (readOnly) {
      return 'bg-surface border border-border';
    }
    if (isFocused) {
      return 'bg-white border-2 border-brand';
    }
    return 'bg-white border border-border';
  };

  return (
    <View style={style} className="w-full">
      {/* Label */}
      {label && (
        <Text className="text-xs font-medium text-text-primary mb-2 tracking-wide uppercase">
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View className="relative">
        {/* Lock Icon for Read-Only Fields */}
        {showLock && readOnly && (
          <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
            <Ionicons name="lock-closed" size={18} color="#6B7280" />
          </View>
        )}

        {/* Text Input */}
        {type !== 'select' && (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            editable={!readOnly}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={getKeyboardType()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${inputBaseClasses} ${getInputStateClasses()} ${
              showLock && readOnly ? 'pl-10' : ''
            }`}
            style={{
              textAlignVertical: multiline ? 'top' : 'center',
            }}
            {...props}
          />
        )}

        {/* Select Input (Dropdown) */}
        {type === 'select' && (
          <TouchableOpacity
            onPress={() => {
              // This would trigger a picker/modal in a real implementation
              // For now, it's a placeholder
              console.log('Select dropdown clicked');
            }}
            className={`${inputBaseClasses} ${getInputStateClasses()} flex-row items-center justify-between`}
          >
            <Text
              className={`text-base ${
                value ? 'text-text-primary' : 'text-gray-400'
              }`}
            >
              {value || placeholder}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text className="text-xs text-error ml-1">{error}</Text>
        </View>
      )}
    </View>
  );
}
