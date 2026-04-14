import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { getLanguagePair } from '@/lib/db/repositories/settings';
import { analyzeAndPersist, AnalysisProgress } from '@/lib/analysis/analyzeText';

// Share sheet landing screen.
// Receives text/plain from Android share intent, runs the analysis pipeline,
// then navigates to analyze/[sourceId].
export default function ShareScreen() {
  const [status, setStatus] = useState('Receiving content…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleSharedText() {
      try {
        const text = await getSharedText();
        if (cancelled) return;

        if (!text || text.trim().length === 0) {
          setError('No text received. Please share text content.');
          return;
        }

        const { source, target } = await getLanguagePair();

        const onProgress = (p: AnalysisProgress) => {
          if (!cancelled) setStatus(p.message);
        };

        const title = text.slice(0, 40).trim() + (text.length > 40 ? '…' : '');
        const { sourceId } = await analyzeAndPersist(text, source, target, title, onProgress);

        ReceiveSharingIntent.clearReceivedFiles();

        if (!cancelled) {
          router.replace(`/analyze/${sourceId}`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.');
        }
      }
    }

    handleSharedText();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.status}>{status}</Text>
        </>
      )}
    </View>
  );
}

function getSharedText(): Promise<string> {
  return new Promise((resolve, reject) => {
    ReceiveSharingIntent.getReceivedFiles(
      (files: Array<{ text?: string }>) => {
        const text = files[0]?.text ?? '';
        resolve(text);
      },
      (error: Error) => reject(error),
      'contextlearn'
    );
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: '#fff',
  },
  status: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  error: {
    fontSize: 15,
    color: '#c0392b',
    textAlign: 'center',
  },
});
