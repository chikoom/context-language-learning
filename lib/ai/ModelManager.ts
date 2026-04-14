import * as FileSystem from 'expo-file-system/legacy';
import { getSetting, setSetting } from '@/lib/db/repositories/settings';

// Gemma 3 2B GGUF (Q4_K_M quantization, ~1.5GB)
// Community-maintained GGUF from bartowski on HuggingFace
export const DEFAULT_MODEL_URL =
  'https://huggingface.co/bartowski/google_gemma-3-2b-it-GGUF/resolve/main/google_gemma-3-2b-it-Q4_K_M.gguf';

export const MODEL_FILENAME = 'gemma-3-2b-q4km.gguf';

export interface DownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  percent: number;
}

export async function getModelPath(): Promise<string> {
  return `${FileSystem.documentDirectory}models/${MODEL_FILENAME}`;
}

export async function isModelDownloaded(): Promise<boolean> {
  const path = await getModelPath();
  const info = await FileSystem.getInfoAsync(path);
  return info.exists && (info as FileSystem.FileInfo & { size?: number }).size! > 100_000_000; // > 100MB sanity check
}

export async function downloadModel(
  onProgress: (progress: DownloadProgress) => void,
  modelUrl: string = DEFAULT_MODEL_URL
): Promise<string> {
  const modelDir = `${FileSystem.documentDirectory}models/`;
  await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });

  const modelPath = `${modelDir}${MODEL_FILENAME}`;

  const callback = ({ totalBytesWritten, totalBytesExpectedToWrite }: FileSystem.DownloadProgressData) => {
    onProgress({
      downloadedBytes: totalBytesWritten,
      totalBytes: totalBytesExpectedToWrite,
      percent:
        totalBytesExpectedToWrite > 0
          ? Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100)
          : 0,
    });
  };

  const downloadResumable = FileSystem.createDownloadResumable(
    modelUrl,
    modelPath,
    {},
    callback
  );

  const result = await downloadResumable.downloadAsync();
  if (!result) throw new Error('Model download failed');

  await setSetting('ai_model', 'gemma3-2b');
  return result.uri;
}

export async function deleteModel(): Promise<void> {
  const path = await getModelPath();
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path);
  }
  await setSetting('ai_model', 'mock');
}
