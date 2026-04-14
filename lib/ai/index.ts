import { AIProvider } from './AIProvider';
import { MockAIProvider } from './MockAIProvider';

// Active provider. Switch to LlamaAIProvider once TDBADMS-812 model is downloaded.
// Usage: set USE_REAL_MODEL=true in your environment, or swap here for testing.
const USE_REAL_MODEL = false; // flip to true after model is downloaded

function createProvider(): AIProvider {
  if (USE_REAL_MODEL) {
    // Dynamic require so the import only resolves at runtime on Android
    const { LlamaAIProvider } = require('./LlamaAIProvider') as {
      LlamaAIProvider: new () => AIProvider & { initialize(): Promise<void> };
    };
    const provider = new LlamaAIProvider();
    provider.initialize().catch(console.error);
    return provider;
  }
  return new MockAIProvider();
}

export const aiProvider: AIProvider = createProvider();

export type { AIProvider, Flashcard, LanguageCode, VocabularyItem } from './AIProvider';
