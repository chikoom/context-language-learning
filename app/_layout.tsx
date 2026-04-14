import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="analyze/[sourceId]" options={{ title: 'Analysis' }} />
        <Stack.Screen name="study/[deckId]" options={{ title: 'Study' }} />
        <Stack.Screen name="share" options={{ title: 'Processing...' }} />
      </Stack>
    </>
  );
}
