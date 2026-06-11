import { Stack } from 'expo-router';

// Layout for authentication flow screens
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' }
      }}
    />
  );
}
