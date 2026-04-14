import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Share sheet entry point — receives text/plain from Android share intent.
// TODO (TDBADMS-809): read incoming text via expo-linking, persist session, navigate to analyze/[sourceId]
export default function ShareScreen() {
  useEffect(() => {
    // Placeholder: real intent handling wired in TDBADMS-809
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.text}>Receiving content…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#444',
  },
});
