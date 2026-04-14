import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FlashcardRow, getFlashcardsForDeck, saveReview } from '@/lib/db/repositories/flashcards';
import { LangText } from '@/components/LangText';

type Phase = 'loading' | 'studying' | 'summary';

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const [phase, setPhase] = useState<Phase>('loading');
  const [cards, setCards] = useState<FlashcardRow[]>([]);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!deckId) return;
    getFlashcardsForDeck(deckId).then((rows) => {
      setCards(rows);
      setPhase('studying');
    });
  }, [deckId]);

  function flipCard() {
    if (flipped) return;
    Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    setFlipped(true);
  }

  async function grade(result: 'known' | 'unknown') {
    const card = cards[index];
    await saveReview({ id: uuidv4(), flashcardId: card.id, result });

    const nextKnown = result === 'known' ? known + 1 : known;
    const nextIndex = index + 1;

    if (nextIndex >= cards.length) {
      setKnown(nextKnown);
      setPhase('summary');
    } else {
      setKnown(nextKnown);
      setIndex(nextIndex);
      setFlipped(false);
      flipAnim.setValue(0);
    }
  }

  if (phase === 'loading') {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (phase === 'summary') {
    return <SummaryScreen known={known} total={cards.length} deckId={deckId} />;
  }

  const card = cards[index];
  const progress = index / cards.length;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <View style={styles.root}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <Text style={styles.progressText}>{index + 1} / {cards.length}</Text>

      {/* Card */}
      <Pressable onPress={flipCard} style={styles.cardWrapper}>
        {/* Front */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { transform: [{ rotateY: frontRotate }] },
            flipped && styles.cardHidden,
          ]}
        >
          <Text style={styles.tapHint}>Tap to reveal</Text>
          <LangText style={styles.cardFrontText}>{card.front}</LangText>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backRotate }] },
            !flipped && styles.cardHidden,
          ]}
        >
          <Text style={styles.cardBackText}>{card.back}</Text>
        </Animated.View>
      </Pressable>

      {/* Grade buttons — only shown after flip */}
      {flipped && (
        <View style={styles.gradeRow}>
          <TouchableOpacity style={[styles.gradeBtn, styles.gradeBtnUnknown]} onPress={() => grade('unknown')}>
            <Text style={styles.gradeBtnText}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gradeBtn, styles.gradeBtnKnown]} onPress={() => grade('known')}>
            <Text style={styles.gradeBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SummaryScreen({
  known, total, deckId,
}: {
  known: number; total: number; deckId: string;
}) {
  const percent = total > 0 ? Math.round((known / total) * 100) : 0;
  return (
    <View style={styles.summaryRoot}>
      <Text style={styles.summaryEmoji}>{percent >= 70 ? '🎉' : '💪'}</Text>
      <Text style={styles.summaryScore}>{known} / {total}</Text>
      <Text style={styles.summaryLabel}>cards known ({percent}%)</Text>
      <TouchableOpacity style={styles.studyAgainBtn} onPress={() => router.replace(`/study/${deckId}`)}>
        <Text style={styles.studyAgainText}>Study Again</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  progressBar: { height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: '#111', borderRadius: 2 },
  progressText: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 24 },

  cardWrapper: { flex: 1, marginBottom: 24 },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardFront: { backgroundColor: '#f8f8f8' },
  cardBack: { backgroundColor: '#111' },
  cardHidden: { opacity: 0 },
  tapHint: { position: 'absolute', top: 16, fontSize: 12, color: '#ccc' },
  cardFrontText: { fontSize: 36, fontWeight: '700', color: '#111', textAlign: 'center' },
  cardBackText: { fontSize: 20, color: '#fff', textAlign: 'center', lineHeight: 30 },

  gradeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gradeBtn: { flex: 1, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  gradeBtnUnknown: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  gradeBtnKnown: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  gradeBtnText: { fontSize: 17, fontWeight: '600' },

  summaryRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  summaryEmoji: { fontSize: 56 },
  summaryScore: { fontSize: 56, fontWeight: '700', color: '#111', marginTop: 16 },
  summaryLabel: { fontSize: 18, color: '#666', marginBottom: 40 },
  studyAgainBtn: { backgroundColor: '#111', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  studyAgainText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  doneBtn: { marginTop: 16 },
  doneBtnText: { fontSize: 16, color: '#888' },
});
