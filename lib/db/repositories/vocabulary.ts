import { getDb } from '../index';

export interface VocabularyItemRow {
  id: string;
  sourceId: string;
  word: string;
  translation: string;
  contextSentence: string;
  createdAt: number;
}

export async function saveVocabularyItems(
  items: Omit<VocabularyItemRow, 'createdAt'>[]
): Promise<void> {
  const db = await getDb();
  const now = Date.now();

  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT INTO vocabulary_items (id, source_id, word, translation, context_sentence, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item.id, item.sourceId, item.word, item.translation, item.contextSentence, now]
      );
    }
  });
}

export async function getVocabularyForSource(sourceId: string): Promise<VocabularyItemRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    source_id: string;
    word: string;
    translation: string;
    context_sentence: string;
    created_at: number;
  }>('SELECT * FROM vocabulary_items WHERE source_id = ? ORDER BY created_at ASC', [sourceId]);

  return rows.map((r) => ({
    id: r.id,
    sourceId: r.source_id,
    word: r.word,
    translation: r.translation,
    contextSentence: r.context_sentence,
    createdAt: r.created_at,
  }));
}
