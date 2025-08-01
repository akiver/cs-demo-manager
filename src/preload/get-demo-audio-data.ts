import { pathExists, readFile } from 'fs-extra';
import path from 'node:path';
import { loadAudio } from 'csdm/ui/match/viewer-2d/audio/load-audio';
import { getDemoAudioOffset } from 'csdm/ui/match/viewer-2d/audio/audio-offset';
import { supportedAudioExtensions } from 'csdm/common/types/audio-extensions';

type DemoAudioData = {
  audioFilePath: string;
  audio: HTMLAudioElement;
  audioBytes: Uint8Array<ArrayBuffer>;
  offsetSeconds: number;
};

export async function getDemoAudioData(checksum: string, audioFilePath: string): Promise<DemoAudioData | null> {
  const extension = path.parse(audioFilePath).ext.slice(1).toLowerCase();
  if (!supportedAudioExtensions.includes(extension)) {
    return null;
  }
  const fileExists = await pathExists(audioFilePath);
  if (!fileExists) {
    return null;
  }

  const offsetSeconds = getDemoAudioOffset(checksum);
  const [audio, bytes] = await Promise.all([loadAudio(audioFilePath), readFile(audioFilePath)]);

  return { audioFilePath, audio, audioBytes: bytes, offsetSeconds };
}
