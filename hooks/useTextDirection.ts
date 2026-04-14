// Returns the text direction for a given language code.
// Use this when you know the language at render time.

const RTL_LANGUAGES = new Set(['he', 'ar', 'fa', 'ur']);

export type TextDirection = 'rtl' | 'ltr';

export function useTextDirection(lang: string | undefined): TextDirection {
  return lang && RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
}

export function getTextDirection(lang: string | undefined): TextDirection {
  return lang && RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
}

export function isRTL(lang: string | undefined): boolean {
  return !!(lang && RTL_LANGUAGES.has(lang));
}
