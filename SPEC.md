# Context Language Learning — Project Spec

## Overview

A language learning app that uses **the user's own real-life content** as the source material for all learning activities. Instead of generic exercises, the user learns from their actual WhatsApp chats, messages, and documents — translated, analyzed, and turned into flashcards on-device.

**Core insight**: The best vocabulary to learn is the vocabulary you already use. If you shared a message with your Dutch landlord, those are the words you need right now.

### Target User
Expats and immigrants who need to acquire a new language fast for real-life integration — work, family, daily life in a new country. They are motivated, have real conversational need, and already have rich personal content in the languages they're bridging.

### Success Metrics
A user can take a real chat from their life, import it in under 30 seconds, and immediately start a study session derived from that exact conversation.

---

## Language Pairs (Launch)
- Hebrew ↔ English
- Hebrew ↔ Dutch
- English ↔ Dutch

**Note**: Hebrew requires RTL text rendering throughout. This is a first-class concern, not an afterthought.

---

## Platform Strategy

| Phase | Platform | Notes |
|---|---|---|
| MVP | Android (Expo) | Share sheet integration is the key unlock |
| Later | Web app | Study companion, import, dashboard — scope TBD |

**Stack**: Expo (React Native + TypeScript). Chosen for: Android share sheet support, future web reuse via React, fast iteration.

---

## Privacy Architecture

**Principle: All AI processing happens on-device. No personal content ever leaves the phone.**

- No API keys, no cloud AI calls, no backend in MVP
- User's chats, messages, and documents are stored locally only
- The AI model is downloaded once to the device and runs fully offline
- The AI layer is abstracted behind an interface to allow model swapping as better on-device models emerge

### On-Device AI Model
- **Starting point**: Gemma 3 2B (Google, ~2GB download, open weights, decent multilingual support including Hebrew)
- **Alternative to evaluate**: Phi-3 Mini, Llama 3.2 3B
- **Inference runtime**: React Native ONNX Runtime or llama.rn (llama.cpp bindings for React Native)
- Model is downloaded on first launch with a clear progress indicator
- Model selection is developer-configurable for experimentation

---

## MVP — The Core Loop

The MVP validates one complete flow end-to-end:

```
Share chat → On-device analysis → Translated view + vocabulary + flashcards
```

### Step-by-Step User Flow

1. **User is in WhatsApp** (or any app with shareable text)
2. User selects text/exports chat → taps Share → sees **"Context Learn"** in the share sheet
3. App opens to a **processing screen** with a progress indicator
4. On-device AI runs three tasks in sequence:
   - Translate the full content into the target language
   - Extract the top 10 most useful vocabulary words/phrases with translations and example sentences
   - Generate flashcard front/back pairs for the vocabulary
5. App shows the **Analysis Result screen** with three tabs:
   - **Translation**: Original text and translation side-by-side (or interleaved per message for chats)
   - **Vocabulary**: Top 10 words, each with translation + context sentence
   - **Flashcards**: Preview of generated flashcard deck, with a "Save to study" button
6. User saves the content — it's stored in their local library
7. User can return anytime to **study flashcards** or re-read the translated content

---

## Feature Scope

### MVP (Ship This)
- [ ] Android Share Sheet integration (receives text/plain from any app)
- [ ] On-device AI pipeline (translation + vocabulary extraction + flashcard generation)
- [ ] RTL support for Hebrew throughout
- [ ] Analysis Result screen (3 tabs: Translation, Vocabulary, Flashcards)
- [ ] Local content library (list of saved imports)
- [ ] Basic flashcard study screen (show front → flip → mark known/unknown)
- [ ] Onboarding: pick source language + target language
- [ ] Local SQLite storage (no account, no login)
- [ ] Model download screen (first launch)

### Post-MVP (Do Not Build Yet)
- Spaced repetition scheduling (SRS / Anki-style intervals)
- Fill-in-the-blank / cloze exercises
- Mimicry/re-writing exercises
- Photo import (OCR → translate)
- Voice recording + transcription
- Progress tracking and streaks
- Cloud sync + account
- Web app (import, study, dashboard)
- Additional language pairs
- Chat-by-chat import (currently: any shared text)

---

## Data Model

### `content_sources`
Represents one imported piece of content (a chat export, a copied message, a document snippet).

| Field | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| title | TEXT | Auto-generated or user-editable (e.g. "WhatsApp with mom") |
| type | TEXT | `"chat"` \| `"text"` \| `"document"` |
| raw_text | TEXT | Original imported text, stored as-is |
| source_language | TEXT | e.g. `"he"`, `"en"`, `"nl"` |
| target_language | TEXT | e.g. `"nl"`, `"en"`, `"he"` |
| created_at | INTEGER | Unix timestamp |

### `translations`
One-to-one with content_sources for MVP.

| Field | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | |
| source_id | TEXT | FK → content_sources.id |
| translated_text | TEXT | Full translation of raw_text |
| model_used | TEXT | Which on-device model produced this |
| created_at | INTEGER | |

### `vocabulary_items`
Top vocabulary extracted from a content source.

| Field | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | |
| source_id | TEXT | FK → content_sources.id |
| word | TEXT | Word or phrase in source language |
| translation | TEXT | Translation in target language |
| context_sentence | TEXT | Example sentence from the source content |
| created_at | INTEGER | |

### `flashcard_decks`
A deck is created per import.

| Field | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | |
| source_id | TEXT | FK → content_sources.id |
| name | TEXT | Auto-generated from source title |
| created_at | INTEGER | |

### `flashcards`
Individual flashcard within a deck.

| Field | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | |
| deck_id | TEXT | FK → flashcard_decks.id |
| front | TEXT | Word/phrase in source language |
| back | TEXT | Translation in target language |
| created_at | INTEGER | |

### `flashcard_reviews`
Study history per card (MVP: simple known/unknown, SRS added later).

| Field | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | |
| flashcard_id | TEXT | FK → flashcards.id |
| result | TEXT | `"known"` \| `"unknown"` |
| reviewed_at | INTEGER | Unix timestamp |

### `user_settings` (key-value store)
| Key | Example Value |
|---|---|
| source_language | `"he"` |
| target_language | `"nl"` |
| ai_model | `"gemma3-2b"` |
| onboarding_complete | `"true"` |

---

## AI Pipeline Architecture

The AI layer is abstracted so models can be swapped without touching app logic.

```typescript
interface AIProvider {
  translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string>;
  extractVocabulary(text: string, from: LanguageCode, to: LanguageCode): Promise<VocabularyItem[]>;
  generateFlashcards(vocabulary: VocabularyItem[]): Promise<Flashcard[]>;
}
```

MVP implementation: `OnDeviceAIProvider` using the downloaded model.
Future: `CloudAIProvider` as opt-in.

### Prompt Strategy
- System prompt specifies the task and output format (structured JSON)
- Vocabulary extraction returns: `{ word, translation, context_sentence }[]` — top 10
- Flashcard generation maps vocabulary to `{ front, back }[]`
- Translation returns plain text

---

## Screen Map

```
Onboarding (first launch only)
├── Language Pair Setup → pick source + target language
└── Model Download → download on-device AI model with progress bar

Main App
├── Home / Library
│   ├── List of saved content sources (most recent first)
│   └── Each item shows title, language pair, date, flashcard count
│
├── Analysis Result (arrives here from share sheet or tapping a library item)
│   ├── Tab: Translation (side-by-side or interleaved)
│   ├── Tab: Vocabulary (10 items, word + translation + context)
│   └── Tab: Flashcards (deck preview + "Save" button)
│
└── Study (flashcard review session)
    ├── Show front (source language)
    ├── Tap to flip → show back (target language)
    └── Mark known / unknown → next card
```

---

## Technical Notes

### Android Share Sheet
- Registered via Expo's `intentFilters` in `app.json`
- Receives `text/plain` MIME type
- The app activity handles the incoming intent and passes text to the processing pipeline

### Hebrew RTL
- Set `writingDirection: "rtl"` on all Hebrew text elements
- Use `I18nManager.forceRTL` if the UI should mirror for Hebrew as target
- Flashcard front/back rendering must detect language and apply direction dynamically

### Local Storage
- Expo SQLite (v2 / `expo-sqlite/next`) for structured data
- Model files stored in the app's document directory via `expo-file-system`

### Model Download
- ~2GB download on first launch
- Show clear progress bar with size indicator
- Verify checksum after download
- Store model path in `user_settings`

---

## Open Questions

1. **Which exact on-device model and runtime?** — Needs benchmarking for Hebrew ↔ Dutch quality before committing. Options: Gemma 3 2B via ONNX Runtime Mobile, llama.rn with Llama 3.2 3B.
2. **How to parse WhatsApp chat export format?** — WhatsApp `.txt` exports have a known format (`[DD/MM/YYYY, HH:MM:SS] Name: message`). Should the app parse this into individual messages or treat it as a single text block?
3. **Model download UX** — Should the model download happen on first launch, or be deferred until first import? Deferring reduces upfront friction.
4. **Monetization** — Not decided. Build without monetization hooks for now; design storage/usage in a way that can support limits later.
5. **Web app scope** — Deferred. When the time comes: shared TypeScript types between Expo and web, same data schema, decide on sync strategy.

---

## Guiding Principles

1. **Personal context is sacred** — The app has zero value without the user's own data. Every feature exists to make that data useful.
2. **Privacy first** — On-device AI is non-negotiable for MVP. If quality is bad, improve the model, not the privacy posture.
3. **Simplicity over features** — The MVP does one thing well: share → analyze → study. No feature creep.
4. **Swappable AI** — Abstract the model layer from day one. The on-device model landscape is moving fast.
5. **Real life, not textbook** — The vocabulary the user learns is the vocabulary they actually use. Relevance beats curriculum.
