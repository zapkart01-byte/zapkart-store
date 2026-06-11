import { View, Text } from 'react-native';

const STEPS = [
  { label: 'Store Details', step: 1 },
  { label: 'Bank Info', step: 2 },
  { label: 'Documents', step: 3 },
];

/**
 * Renders the 3-step registration progress bar with active/completed indicators.
 */
export default function StepProgress({ currentStep = 1 }) {
  return (
    <View className="px-6 pt-6 pb-4 bg-white">
      {/* Step circles and connecting lines */}
      <View className="flex-row items-center justify-between mb-2">
        {STEPS.map((item, index) => {
          /** Determines the visual state of each step circle */
          const isCompleted = currentStep > item.step;
          const isActive = currentStep === item.step;
          const isUpcoming = currentStep < item.step;

          return (
            <View key={item.step} className="flex-row items-center flex-1">
              {/* Step circle indicator */}
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isCompleted
                    ? 'bg-success'
                    : isActive
                    ? 'bg-brand'
                    : 'bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <Text className="text-white font-bold text-sm">✓</Text>
                ) : (
                  <Text
                    className={`font-bold text-sm ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {item.step}
                  </Text>
                )}
              </View>

              {/* Connecting line between steps (not shown after last step) */}
              {index < STEPS.length - 1 && (
                <View
                  className={`flex-1 h-[2px] mx-2 ${
                    currentStep > item.step ? 'bg-success' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Step labels row */}
      <View className="flex-row justify-between">
        {STEPS.map((item) => {
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;
          return (
            <Text
              key={item.step}
              className={`text-xs flex-1 text-center ${
                isActive
                  ? 'text-brand font-bold'
                  : isCompleted
                  ? 'text-success font-medium'
                  : 'text-text-secondary'
              }`}
            >
              {item.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
