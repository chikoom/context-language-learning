// AI abstraction layer — all business logic goes through this interface.
// Swap the implementation (mock → on-device model → cloud) without touching app logic.

export type LanguageCode = 'he' | 'en' | 'nl';

export interface VocabularyItem {
  word: string;
  translation: string;
  contextSentence: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface AIProvider {
  /** Translate full text from one language to another */
  translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string>;

  /** Extract the top 10 most useful vocabulary items for a language learner */
  extractVocabulary(
    text: string,
    from: LanguageCode,
    to: LanguageCode
  ): Promise<VocabularyItem[]>;

  /** Generate flashcard front/back pairs from vocabulary items */
  generateFlashcards(vocabulary: VocabularyItem[]): Promise<Flashcard[]>;

  /** Whether the provider is ready to process (model loaded, etc.) */
  isReady(): boolean;
}
