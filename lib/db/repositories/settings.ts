import { getDb } from '../index';
import { LanguageCode } from '@/lib/ai/AIProvider';

export type SettingKey = 'source_language' | 'target_language' | 'ai_model' | 'onboarding_complete';

export async function getSetting(key: SettingKey): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getLanguagePair(): Promise<{ source: LanguageCode; target: LanguageCode }> {
  const [source, target] = await Promise.all([
    getSetting('source_language'),
    getSetting('target_language'),
  ]);
  return {
    source: (source ?? 'he') as LanguageCode,
    target: (target ?? 'nl') as LanguageCode,
  };
}
