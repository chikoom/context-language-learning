import { AIProvider } from './AIProvider';
import { MockAIProvider } from './MockAIProvider';

// Switch between providers via this module.
// Replace MockAIProvider with OnDeviceAIProvider once TDBADMS-812 is done.
export const aiProvider: AIProvider = new MockAIProvider();

export type { AIProvider, Flashcard, LanguageCode, VocabularyItem } from './AIProvider';
