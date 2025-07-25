import { pathExists } from 'fs-extra';
import path from 'node:path';

export const allowedAudioExtensions = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'];

export async function getDemoAudioFilePath(demoPath: string): Promise<string | null> {
  for (const extension of allowedAudioExtensions) {
    const audioFilePath = `${path.join(
      path.dirname(demoPath),
      path.basename(demoPath, path.extname(demoPath)),
    )}.${extension}`;
    const fileExists = await pathExists(audioFilePath);
    if (fileExists) {
      return audioFilePath;
    }
  }

  return null;
}
