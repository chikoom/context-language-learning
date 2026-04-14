import { AIProvider, Flashcard, LanguageCode, VocabularyItem } from './AIProvider';

// Mock provider — returns realistic-looking data for UI development.
// Used in development/test; replaced by OnDeviceAIProvider (TDBADMS-812) for real inference.
export class MockAIProvider implements AIProvider {
  isReady(): boolean {
    return true;
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string> {
    await delay(800);
    return `[Mock translation of ${text.slice(0, 30)}... from ${from} to ${to}]`;
  }

  async extractVocabulary(
    _text: string,
    from: LanguageCode,
    to: LanguageCode
  ): Promise<VocabularyItem[]> {
    await delay(1200);

    // Realistic Hebrew ↔ Dutch sample data
    const samples: VocabularyItem[] = [
      { word: 'בַּיִת', translation: 'huis', contextSentence: 'הַבַּיִת שֶׁלִּי גָּדוֹל.' },
      { word: 'מִשְׁפָּחָה', translation: 'familie', contextSentence: 'הַמִּשְׁפָּחָה שֶׁלִּי גָּרָה בְּאַמְסְטֶרְדָּם.' },
      { word: 'עֲבוֹדָה', translation: 'werk', contextSentence: 'אֲנִי הוֹלֵךְ לָעֲבוֹדָה בְּכָל יוֹם.' },
      { word: 'חָבֵר', translation: 'vriend', contextSentence: 'הַחָבֵר שֶׁלִּי מְדַבֵּר הוֹלַנְדִּית.' },
      { word: 'עִיר', translation: 'stad', contextSentence: 'הָעִיר יָפָה מְאוֹד.' },
      { word: 'מַיִם', translation: 'water', contextSentence: 'אֲנִי שׁוֹתֶה מַיִם.' },
      { word: 'לֶחֶם', translation: 'brood', contextSentence: 'קָנִיתִי לֶחֶם בַּחֲנוּת.' },
      { word: 'יוֹם', translation: 'dag', contextSentence: 'יוֹם טוֹב לְכֻלָּם.' },
      { word: 'שָׁנָה', translation: 'jaar', contextSentence: 'גַּרְתִּי פֹּה שָׁנָה.' },
      { word: 'שְׁאֵלָה', translation: 'vraag', contextSentence: 'יֵשׁ לִי שְׁאֵלָה.' },
    ];

    return from === 'he' || to === 'he'
      ? samples
      : samples.map((s) => ({ ...s, word: s.translation, translation: s.word }));
  }

  async generateFlashcards(vocabulary: VocabularyItem[]): Promise<Flashcard[]> {
    await delay(300);
    return vocabulary.map((item) => ({
      front: item.word,
      back: `${item.translation}\n\n${item.contextSentence}`,
    }));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
