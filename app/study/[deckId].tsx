import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Flashcard study session screen
// TODO (TDBADMS-815): load deck from SQLite, implement flip animation and review flow
export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study</Text>
      <Text style={styles.id}>Deck: {deckId}</Text>
      <Text style={styles.note}>Flashcard study flow coming in TDBADMS-815</Text>
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
