import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import {
  DEFAULT_MODEL_URL,
  DownloadProgress,
  downloadModel,
  isModelDownloaded,
} from '@/lib/ai/ModelManager';
import { setSetting } from '@/lib/db/repositories/settings';

type Phase = 'idle' | 'downloading' | 'done' | 'error';

export default function ModelDownloadScreen() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    isModelDownloaded().then((already) => {
      if (already) completeOnboarding();
    });
  }, []);

  useEffect(() => {
    if (progress) {
      Animated.timing(barWidth, {
        toValue: progress.percent,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [progress]);

  async function startDownload() {
    setPhase('downloading');
    try {
      await downloadModel((p) => setProgress(p), DEFAULT_MODEL_URL);
      setPhase('done');
    } catch (err) {
      setPhase('error');
      setErrorMsg(err instanceof Error ? err.message : 'Download failed.');
    }
  }

  async function completeOnboarding() {
    await setSetting('onboarding_complete', 'true');
    router.replace('/(tabs)');
  }

  const MB = (bytes: number) => (bytes / 1_000_000).toFixed(0);

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Download AI Model</Text>
      <Text style={styles.body}>
        The AI that analyzes your chats runs entirely on your device.{'\n'}
        One-time download of ~1.5 GB. No data ever leaves your phone.
      </Text>
      <Text style={styles.modelName}>Gemma 3 2B · Q4_K_M</Text>

      {phase === 'idle' && (
        <TouchableOpacity style={styles.downloadBtn} onPress={startDownload}>
          <Text style={styles.downloadBtnText}>Download (~1.5 GB)</Text>
        </TouchableOpacity>
      )}

      {phase === 'downloading' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: barWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress
              ? `${MB(progress.downloadedBytes)} / ${MB(progress.totalBytes)} MB  (${progress.percent}%)`
              : 'Starting…'}
          </Text>
        </View>
      )}

      {phase === 'done' && (
        <View style={styles.doneContainer}>
          <Text style={styles.doneText}>Model downloaded ✓</Text>
          <TouchableOpacity style={styles.downloadBtn} onPress={completeOnboarding}>
            <Text style={styles.downloadBtnText}>Get Started →</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.downloadBtn} onPress={startDownload}>
            <Text style={styles.downloadBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip for now (use mock AI)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 32, paddingTop: 72, backgroundColor: '#fff', gap: 16 },
  heading: { fontSize: 30, fontWeight: '700', color: '#111' },
  body: { fontSize: 16, color: '#555', lineHeight: 26 },
  modelName: { fontSize: 13, color: '#aaa', marginTop: -8 },

  downloadBtn: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  downloadBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  progressContainer: { marginTop: 16, gap: 10 },
  progressTrack: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#111', borderRadius: 4 },
  progressText: { fontSize: 14, color: '#666', textAlign: 'center' },

  doneContainer: { gap: 12, marginTop: 8 },
  doneText: { fontSize: 18, fontWeight: '600', color: '#16a34a', textAlign: 'center' },

  errorContainer: { gap: 12 },
  errorText: { fontSize: 14, color: '#c0392b', textAlign: 'center' },

  skipBtn: { marginTop: 8, alignItems: 'center' },
  skipText: { fontSize: 14, color: '#aaa' },
});
