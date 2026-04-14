import { getDb } from '../index';

export interface TranslationRow {
  id: string;
  sourceId: string;
  translatedText: string;
  modelUsed: string;
  createdAt: number;
}

export async function saveTranslation(
  translation: Omit<TranslationRow, 'createdAt'>
): Promise<TranslationRow> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO translations (id, source_id, translated_text, model_used, created_at) VALUES (?, ?, ?, ?, ?)',
    [translation.id, translation.sourceId, translation.translatedText, translation.modelUsed, now]
  );
  return { ...translation, createdAt: now };
}

export async function getTranslationForSource(sourceId: string): Promise<TranslationRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    source_id: string;
    translated_text: string;
    model_used: string;
    created_at: number;
  }>('SELECT * FROM translations WHERE source_id = ? LIMIT 1', [sourceId]);

  if (!row) return null;
  return {
    id: row.id,
    sourceId: row.source_id,
    translatedText: row.translated_text,
    modelUsed: row.model_used,
    createdAt: row.created_at,
  };
}
