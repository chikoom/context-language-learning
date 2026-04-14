import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="language-setup" />
      <Stack.Screen name="model-download" />
    </Stack>
  );
}
