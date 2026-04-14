import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getContentSource } from '@/lib/db/repositories/contentSources';
import { getTranslationForSource } from '@/lib/db/repositories/translations';
import { getVocabularyForSource } from '@/lib/db/repositories/vocabulary';
import { getDeckForSource } from '@/lib/db/repositories/flashcards';
import { LangText } from '@/components/LangText';

type Tab = 'translation' | 'vocabulary' | 'flashcards';

interface ScreenData {
  rawText: string;
  sourceLang: string;
  targetLang: string;
  translation: string;
  vocabulary: Array<{ id: string; word: string; translation: string; contextSentence: string }>;
  deckId: string | null;
}

export default function AnalyzeScreen() {
  const { sourceId } = useLocalSearchParams<{ sourceId: string }>();
  const [tab, setTab] = useState<Tab>('translation');
  const [data, setData] = useState<ScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceId) return;

    async function load() {
      try {
        const [source, translationRow, vocabRows, deck] = await Promise.all([
          getContentSource(sourceId),
          getTranslationForSource(sourceId),
          getVocabularyForSource(sourceId),
          getDeckForSource(sourceId),
        ]);

        if (!source) { setError('Content not found.'); return; }

        setData({
          rawText: source.rawText,
          sourceLang: source.sourceLanguage,
          targetLang: source.targetLanguage,
          translation: translationRow?.translatedText ?? '',
          vocabulary: vocabRows,
          deckId: deck?.id ?? null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load.');
      }
    }

    load();
  }, [sourceId]);

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  if (!data) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.root}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['translation', 'vocabulary', 'flashcards'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabItem, tab === t && styles.tabItemActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'translation' && (
          <TranslationTab
            rawText={data.rawText}
            translation={data.translation}
            sourceLang={data.sourceLang}
            targetLang={data.targetLang}
          />
        )}
        {tab === 'vocabulary' && (
          <VocabularyTab
            items={data.vocabulary}
            sourceLang={data.sourceLang}
            targetLang={data.targetLang}
          />
        )}
        {tab === 'flashcards' && (
          <FlashcardsTab
            count={data.vocabulary.length}
            deckId={data.deckId}
          />
        )}
      </ScrollView>
    </View>
  );
}

function TranslationTab({
  rawText, translation, sourceLang, targetLang,
}: {
  rawText: string; translation: string; sourceLang: string; targetLang: string;
}) {
  return (
    <View style={styles.translationContainer}>
      <View style={styles.textBlock}>
        <Text style={styles.blockLabel}>{LANG_LABEL[sourceLang] ?? sourceLang}</Text>
        <LangText lang={sourceLang} style={styles.bodyText}>{rawText}</LangText>
      </View>
      <View style={styles.divider} />
      <View style={styles.textBlock}>
        <Text style={styles.blockLabel}>{LANG_LABEL[targetLang] ?? targetLang}</Text>
        <LangText lang={targetLang} style={styles.bodyText}>{translation}</LangText>
      </View>
    </View>
  );
}

function VocabularyTab({
  items, sourceLang, targetLang,
}: {
  items: ScreenData['vocabulary']; sourceLang: string; targetLang: string;
}) {
  return (
    <View>
      {items.map((item, idx) => (
        <View key={item.id} style={styles.vocabItem}>
          <Text style={styles.vocabIndex}>{idx + 1}</Text>
          <View style={styles.vocabBody}>
            <View style={styles.vocabRow}>
              <LangText lang={sourceLang} style={styles.vocabWord}>{item.word}</LangText>
              <Text style={styles.vocabArrow}>→</Text>
              <LangText lang={targetLang} style={styles.vocabTranslation}>{item.translation}</LangText>
            </View>
            <LangText lang={sourceLang} style={styles.vocabContext}>{item.contextSentence}</LangText>
          </View>
        </View>
      ))}
    </View>
  );
}

function FlashcardsTab({ count, deckId }: { count: number; deckId: string | null }) {
  return (
    <View style={styles.flashcardsTab}>
      <Text style={styles.flashcardCount}>{count}</Text>
      <Text style={styles.flashcardCountLabel}>flashcards ready to study</Text>
      {deckId ? (
        <Pressable
          style={styles.studyButton}
          onPress={() => router.push(`/study/${deckId}`)}
        >
          <Text style={styles.studyButtonText}>Start Studying →</Text>
        </Pressable>
      ) : (
        <Text style={styles.noDecks}>No deck found.</Text>
      )}
    </View>
  );
}

const TAB_LABELS: Record<Tab, string> = {
  translation: 'Translation',
  vocabulary: 'Vocabulary',
  flashcards: 'Flashcards',
};

const LANG_LABEL: Record<string, string> = {
  he: 'Hebrew',
  en: 'English',
  nl: 'Dutch',
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#c0392b', fontSize: 15, textAlign: 'center', padding: 20 },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  tabItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: '#000' },
  tabLabel: { fontSize: 14, color: '#888' },
  tabLabelActive: { color: '#000', fontWeight: '600' },

  content: { padding: 16, paddingBottom: 40 },

  // Translation tab
  translationContainer: { gap: 16 },
  textBlock: { gap: 6 },
  blockLabel: { fontSize: 12, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { fontSize: 16, lineHeight: 26, color: '#111' },
  divider: { height: 1, backgroundColor: '#e5e5e5', marginVertical: 4 },

  // Vocabulary tab
  vocabItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
    alignItems: 'flex-start',
  },
  vocabIndex: { fontSize: 13, color: '#bbb', width: 20, paddingTop: 2 },
  vocabBody: { flex: 1, gap: 4 },
  vocabRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  vocabWord: { fontSize: 17, fontWeight: '600', color: '#111' },
  vocabArrow: { fontSize: 14, color: '#bbb' },
  vocabTranslation: { fontSize: 17, color: '#444' },
  vocabContext: { fontSize: 13, color: '#888', fontStyle: 'italic' },

  // Flashcards tab
  flashcardsTab: { alignItems: 'center', paddingTop: 40, gap: 8 },
  flashcardCount: { fontSize: 72, fontWeight: '700', color: '#111' },
  flashcardCountLabel: { fontSize: 16, color: '#666', marginBottom: 32 },
  studyButton: {
    backgroundColor: '#111',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  studyButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  noDecks: { color: '#888', fontSize: 14 },
});
