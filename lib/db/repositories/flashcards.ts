import { getDb } from '../index';

export interface FlashcardDeckRow {
  id: string;
  sourceId: string;
  name: string;
  createdAt: number;
}

export interface FlashcardRow {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: number;
}

export interface FlashcardReviewRow {
  id: string;
  flashcardId: string;
  result: 'known' | 'unknown';
  reviewedAt: number;
}

export async function createFlashcardDeck(
  deck: Omit<FlashcardDeckRow, 'createdAt'>
): Promise<FlashcardDeckRow> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO flashcard_decks (id, source_id, name, created_at) VALUES (?, ?, ?, ?)',
    [deck.id, deck.sourceId, deck.name, now]
  );
  return { ...deck, createdAt: now };
}

export async function saveFlashcards(cards: Omit<FlashcardRow, 'createdAt'>[]): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const card of cards) {
      await db.runAsync(
        'INSERT INTO flashcards (id, deck_id, front, back, created_at) VALUES (?, ?, ?, ?, ?)',
        [card.id, card.deckId, card.front, card.back, now]
      );
    }
  });
}

export async function getFlashcardsForDeck(deckId: string): Promise<FlashcardRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    deck_id: string;
    front: string;
    back: string;
    created_at: number;
  }>('SELECT * FROM flashcards WHERE deck_id = ? ORDER BY created_at ASC', [deckId]);

  return rows.map((r) => ({
    id: r.id,
    deckId: r.deck_id,
    front: r.front,
    back: r.back,
    createdAt: r.created_at,
  }));
}

export async function getDeckForSource(sourceId: string): Promise<FlashcardDeckRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    source_id: string;
    name: string;
    created_at: number;
  }>('SELECT * FROM flashcard_decks WHERE source_id = ? LIMIT 1', [sourceId]);

  if (!row) return null;
  return { id: row.id, sourceId: row.source_id, name: row.name, createdAt: row.created_at };
}

export async function saveReview(review: Omit<FlashcardReviewRow, 'reviewedAt'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO flashcard_reviews (id, flashcard_id, result, reviewed_at) VALUES (?, ?, ?, ?)',
    [review.id, review.flashcardId, review.result, Date.now()]
  );
}

export async function getDeckStats(deckId: string): Promise<{ total: number; known: number }> {
  const db = await getDb();
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM flashcards WHERE deck_id = ?',
    [deckId]
  );
  // Count only the most recent review per card
  const known = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM (
       SELECT flashcard_id, result
       FROM flashcard_reviews
       WHERE flashcard_id IN (SELECT id FROM flashcards WHERE deck_id = ?)
       GROUP BY flashcard_id
       HAVING reviewed_at = MAX(reviewed_at)
     ) WHERE result = 'known'`,
    [deckId]
  );
  return { total: total?.count ?? 0, known: known?.count ?? 0 };
}
