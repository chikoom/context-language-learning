import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getDb } from '@/lib/db';
import { getSetting } from '@/lib/db/repositories/settings';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    async function init() {
      // Initialize DB (runs migrations on first launch)
      await getDb();
      const complete = await getSetting('onboarding_complete');
      setOnboarded(complete === 'true');
      setReady(true);
    }
    init();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
          redirect={!onboarded}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
          redirect={onboarded}
        />
        <Stack.Screen
          name="analyze/[sourceId]"
          options={{ title: 'Analysis', headerBackTitle: 'Library' }}
        />
        <Stack.Screen
          name="study/[deckId]"
          options={{ title: 'Study', headerBackTitle: 'Analysis' }}
        />
        <Stack.Screen name="share" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
