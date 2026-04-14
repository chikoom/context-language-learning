import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { aiProvider } from '@/lib/ai';
import { LanguageCode } from '@/lib/ai/AIProvider';
import { createContentSource } from '@/lib/db/repositories/contentSources';
import { saveTranslation } from '@/lib/db/repositories/translations';
import { saveVocabularyItems } from '@/lib/db/repositories/vocabulary';
import { createFlashcardDeck, saveFlashcards } from '@/lib/db/repositories/flashcards';

export interface AnalysisProgress {
  stage: 'translating' | 'extracting_vocabulary' | 'generating_flashcards' | 'saving' | 'done';
  message: string;
}

export interface AnalysisIds {
  sourceId: string;
  deckId: string;
}

export async function analyzeAndPersist(
  rawText: string,
  from: LanguageCode,
  to: LanguageCode,
  title: string,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AnalysisIds> {
  if (!aiProvider.isReady()) {
    throw new Error('AI model is not ready. Please wait for the model to load.');
  }

  const sourceId = uuidv4();

  onProgress?.({ stage: 'translating', message: 'Translating…' });
  const translation = await aiProvider.translate(rawText, from, to);

  onProgress?.({ stage: 'extracting_vocabulary', message: 'Extracting vocabulary…' });
  const vocabulary = await aiProvider.extractVocabulary(rawText, from, to);

  onProgress?.({ stage: 'generating_flashcards', message: 'Generating flashcards…' });
  const flashcards = await aiProvider.generateFlashcards(vocabulary);

  onProgress?.({ stage: 'saving', message: 'Saving…' });

  // Persist everything
  await createContentSource({
    id: sourceId,
    title,
    type: 'text',
    rawText,
    sourceLanguage: from,
    targetLanguage: to,
  });

  await saveTranslation({
    id: uuidv4(),
    sourceId,
    translatedText: translation,
    modelUsed: 'mock',
  });

  await saveVocabularyItems(
    vocabulary.map((v) => ({
      id: uuidv4(),
      sourceId,
      word: v.word,
      translation: v.translation,
      contextSentence: v.contextSentence,
    }))
  );

  const deckId = uuidv4();
  await createFlashcardDeck({ id: deckId, sourceId, name: title });
  await saveFlashcards(
    flashcards.map((f) => ({
      id: uuidv4(),
      deckId,
      front: f.front,
      back: f.back,
    }))
  );

  onProgress?.({ stage: 'done', message: 'Done' });

  return { sourceId, deckId };
}
