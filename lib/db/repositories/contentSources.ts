import { getDb } from '../index';

export interface ContentSource {
  id: string;
  title: string;
  type: 'chat' | 'text' | 'document';
  rawText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: number;
}

export async function createContentSource(
  source: Omit<ContentSource, 'createdAt'>
): Promise<ContentSource> {
  const db = await getDb();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO content_sources (id, title, type, raw_text, source_language, target_language, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [source.id, source.title, source.type, source.rawText, source.sourceLanguage, source.targetLanguage, now]
  );

  return { ...source, createdAt: now };
}

export async function listContentSources(): Promise<ContentSource[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    type: string;
    raw_text: string;
    source_language: string;
    target_language: string;
    created_at: number;
  }>('SELECT * FROM content_sources ORDER BY created_at DESC');

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type as ContentSource['type'],
    rawText: r.raw_text,
    sourceLanguage: r.source_language,
    targetLanguage: r.target_language,
    createdAt: r.created_at,
  }));
}

export async function getContentSource(id: string): Promise<ContentSource | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: string;
    title: string;
    type: string;
    raw_text: string;
    source_language: string;
    target_language: string;
    created_at: number;
  }>('SELECT * FROM content_sources WHERE id = ?', [id]);

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    type: row.type as ContentSource['type'],
    rawText: row.raw_text,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    createdAt: row.created_at,
  };
}
