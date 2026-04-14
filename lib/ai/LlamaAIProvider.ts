// On-device LLM provider using llama.rn (llama.cpp React Native bindings).
// Requires a native Android build and a downloaded GGUF model file.
// Install note: `npm install llama.rn --ignore-scripts`
//   The iOS xcframework is not needed for Android builds.

import type { LlamaContext } from 'llama.rn';
import { AIProvider, Flashcard, LanguageCode, VocabularyItem } from './AIProvider';
import { getModelPath, isModelDownloaded } from './ModelManager';

export class LlamaAIProvider implements AIProvider {
  private context: LlamaContext | null = null;
  private modelPath: string | null = null;

  async initialize(): Promise<void> {
    if (this.context) return;

    const downloaded = await isModelDownloaded();
    if (!downloaded) throw new Error('Model not downloaded. Run model download first.');

    const { initLlama } = require('llama.rn') as typeof import('llama.rn');
    const path = await getModelPath();

    this.context = await initLlama({
      model: path,
      n_ctx: 2048,
      n_threads: 4,
    });
    this.modelPath = path;
  }

  isReady(): boolean {
    return this.context !== null;
  }

  async translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string> {
    const prompt = buildTranslatePrompt(text, from, to);
    const raw = await this.complete(prompt, 512);
    return raw.trim();
  }

  async extractVocabulary(
    text: string,
    from: LanguageCode,
    to: LanguageCode
  ): Promise<VocabularyItem[]> {
    const prompt = buildVocabPrompt(text, from, to);
    const raw = await this.complete(prompt, 800);
    return parseJsonResponse<VocabularyItem[]>(raw, []);
  }

  async generateFlashcards(vocabulary: VocabularyItem[]): Promise<Flashcard[]> {
    return vocabulary.map((item) => ({
      front: item.word,
      back: `${item.translation}\n\n${item.contextSentence}`,
    }));
  }

  async release(): Promise<void> {
    await this.context?.release();
    this.context = null;
  }

  private async complete(prompt: string, nPredict: number): Promise<string> {
    if (!this.context) throw new Error('LlamaAIProvider not initialized');
    const result = await this.context.completion({
      prompt,
      n_predict: nPredict,
      temperature: 0.2,
      top_p: 0.9,
      stop: ['</s>', '<|end|>', '<end_of_turn>'],
    });
    return result.text;
  }
}

function buildTranslatePrompt(text: string, from: LanguageCode, to: LanguageCode): string {
  return `<start_of_turn>user
Translate the following ${LANG_NAMES[from]} text to ${LANG_NAMES[to]}. Return only the translation, no explanation.

Text: ${text}
<end_of_turn>
<start_of_turn>model
`;
}

function buildVocabPrompt(text: string, from: LanguageCode, to: LanguageCode): string {
  return `<start_of_turn>user
You are a language learning assistant. Extract the 10 most useful vocabulary words from the following ${LANG_NAMES[from]} text for someone learning ${LANG_NAMES[to]}.

Return a JSON array only, with no other text. Format:
[{"word": "...", "translation": "...", "contextSentence": "..."}]

Text: ${text}
<end_of_turn>
<start_of_turn>model
`;
}

function parseJsonResponse<T>(raw: string, fallback: T): T {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return fallback;
  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return fallback;
  }
}

const LANG_NAMES: Record<LanguageCode, string> = {
  he: 'Hebrew',
  en: 'English',
  nl: 'Dutch',
};
