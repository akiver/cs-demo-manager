import fs from 'fs-extra';
import { InvalidFfmpegExecutable } from 'csdm/node/video/errors/invalid-ffmpeg-executable';
import { getFfmpegExecutablePath } from './ffmpeg-location';
import { getFfmpegVersionFromExecutable } from './get-ffmpeg-version-from-executable';

export async function getInstalledFfmpegVersion(): Promise<string | undefined> {
  const ffmpegExecutablePath = await getFfmpegExecutablePath();
  const ffmpegExecutableExists = await fs.pathExists(ffmpegExecutablePath);
  if (!ffmpegExecutableExists) {
    return undefined;
  }

  try {
    const version = await getFfmpegVersionFromExecutable(ffmpegExecutablePath);

    return version;
  } catch (error) {
    if (error instanceof InvalidFfmpegExecutable) {
      return undefined;
    }
    throw error;
  }
}
