import { LanguageCode } from '@/lib/ai/AIProvider';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  he: 'Hebrew',
  en: 'English',
  nl: 'Dutch',
};

export const LANGUAGE_PAIRS: Array<{ source: LanguageCode; target: LanguageCode; label: string }> = [
  { source: 'he', target: 'nl', label: 'Hebrew → Dutch' },
  { source: 'nl', target: 'he', label: 'Dutch → Hebrew' },
  { source: 'he', target: 'en', label: 'Hebrew → English' },
  { source: 'en', target: 'he', label: 'English → Hebrew' },
  { source: 'en', target: 'nl', label: 'English → Dutch' },
  { source: 'nl', target: 'en', label: 'Dutch → English' },
];
