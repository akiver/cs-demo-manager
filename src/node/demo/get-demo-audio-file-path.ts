import { supportedAudioExtensions } from 'csdm/common/types/audio-extensions';
import { pathExists } from 'fs-extra';
import path from 'node:path';

export async function getDemoAudioFilePath(demoPath: string): Promise<string | null> {
  for (const extension of supportedAudioExtensions) {
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
