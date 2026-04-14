import { aiProvider } from '@/lib/ai';
import { LanguageCode } from '@/lib/ai/AIProvider';

// Analysis pipeline — orchestrates translate + extractVocabulary + generateFlashcards.
// Results are returned to the caller; persistence is handled by the screen (TDBADMS-813).

export interface AnalysisProgress {
  stage: 'translating' | 'extracting_vocabulary' | 'generating_flashcards' | 'done';
  message: string;
}

export interface AnalysisResult {
  translation: string;
  vocabulary: Array<{ word: string; translation: string; contextSentence: string }>;
  flashcards: Array<{ front: string; back: string }>;
  modelUsed: string;
}

export async function analyzeText(
  text: string,
  from: LanguageCode,
  to: LanguageCode,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AnalysisResult> {
  if (!aiProvider.isReady()) {
    throw new Error('AI model is not ready. Please wait for the model to load.');
  }

  onProgress?.({ stage: 'translating', message: 'Translating…' });
  const translation = await aiProvider.translate(text, from, to);

  onProgress?.({ stage: 'extracting_vocabulary', message: 'Extracting vocabulary…' });
  const vocabulary = await aiProvider.extractVocabulary(text, from, to);

  onProgress?.({ stage: 'generating_flashcards', message: 'Generating flashcards…' });
  const flashcards = await aiProvider.generateFlashcards(vocabulary);

  onProgress?.({ stage: 'done', message: 'Done' });

  return {
    translation,
    vocabulary,
    flashcards,
    modelUsed: 'mock', // TODO (TDBADMS-812): read model name from OnDeviceAIProvider
  };
}
