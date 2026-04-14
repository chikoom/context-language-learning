import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Analysis Result screen — 3 tabs: Translation, Vocabulary, Flashcards
// TODO (TDBADMS-814): load session from SQLite, show results, wire tabs
export default function AnalyzeScreen() {
  const { sourceId } = useLocalSearchParams<{ sourceId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis</Text>
      <Text style={styles.id}>Source: {sourceId}</Text>
      <Text style={styles.note}>Translation · Vocabulary · Flashcards tabs coming in TDBADMS-814</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  id: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  note: {
    fontSize: 14,
    color: '#aaa',
  },
});
