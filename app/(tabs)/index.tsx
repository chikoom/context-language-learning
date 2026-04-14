import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ContentSource, listContentSources } from '@/lib/db/repositories/contentSources';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

export default function LibraryScreen() {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listContentSources().then((rows) => {
      setSources(rows);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <View style={styles.center} />;

  if (sources.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No content yet</Text>
        <Text style={styles.emptyBody}>
          Share text from WhatsApp or any app.{'\n'}
          Tap Share → Context Learn.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sources}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.item}
          onPress={() => router.push(`/analyze/${item.id}`)}
        >
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemMeta}>
            {SUPPORTED_LANGUAGES[item.sourceLanguage as keyof typeof SUPPORTED_LANGUAGES] ?? item.sourceLanguage}
            {' → '}
            {SUPPORTED_LANGUAGES[item.targetLanguage as keyof typeof SUPPORTED_LANGUAGES] ?? item.targetLanguage}
            {'  ·  '}
            {formatDate(item.createdAt)}
          </Text>
        </Pressable>
      )}
    />
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#fff' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    gap: 12,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  emptyBody: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 24 },

  list: { padding: 16, gap: 2 },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 4,
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  itemMeta: { fontSize: 13, color: '#888' },
});
