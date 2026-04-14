import { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { setSetting } from '@/lib/db/repositories/settings';
import { LANGUAGE_PAIRS } from '@/constants/languages';

export default function LanguageSetupScreen() {
  const [selected, setSelected] = useState(0);

  async function handleContinue() {
    const pair = LANGUAGE_PAIRS[selected];
    await setSetting('source_language', pair.source);
    await setSetting('target_language', pair.target);
    router.replace('/onboarding/model-download');
  }

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>What are you learning?</Text>
      <Text style={styles.subheading}>
        Pick your language pair. You can change this later.
      </Text>

      <View style={styles.options}>
        {LANGUAGE_PAIRS.map((pair, idx) => (
          <Pressable
            key={idx}
            style={[styles.option, selected === idx && styles.optionSelected]}
            onPress={() => setSelected(idx)}
          >
            <Text style={[styles.optionText, selected === idx && styles.optionTextSelected]}>
              {pair.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
        <Text style={styles.continueBtnText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 32, paddingTop: 72, backgroundColor: '#fff' },
  heading: { fontSize: 30, fontWeight: '700', color: '#111', marginBottom: 8 },
  subheading: { fontSize: 16, color: '#888', marginBottom: 40, lineHeight: 24 },

  options: { gap: 10, marginBottom: 40 },
  option: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    backgroundColor: '#fafafa',
  },
  optionSelected: { borderColor: '#111', backgroundColor: '#f0f0f0' },
  optionText: { fontSize: 17, color: '#555' },
  optionTextSelected: { color: '#111', fontWeight: '600' },

  continueBtn: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
