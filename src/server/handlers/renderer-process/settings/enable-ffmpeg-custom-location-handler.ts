import fs from 'fs-extra';
import { getFfmpegVersionFromExecutable } from 'csdm/node/video/ffmpeg/get-ffmpeg-version-from-executable';
import { updateSettingsAndNotifyRendererProcess } from 'csdm/server/update-settings-and-notify-renderer-process';
import { FileNotFound } from 'csdm/node/filesystem/errors/file-not-found';
import type { FfmpegSettings } from 'csdm/node/settings/settings';
import type { FfmpegVersionChangedPayload } from './ffmpeg-version-changed-payload';
import { handleError } from '../../handle-error';
import { InvalidFfmpegExecutable } from 'csdm/node/video/errors/invalid-ffmpeg-executable';

export async function enableFfmpegCustomLocationHandler(customExecutablePath: string) {
  try {
    const executableExists = await fs.pathExists(customExecutablePath);
    if (!executableExists) {
      throw new FileNotFound(customExecutablePath);
    }

    const version = await getFfmpegVersionFromExecutable(customExecutablePath);
    if (version === '?') {
      throw new InvalidFfmpegExecutable();
    }

    const ffmpegSettings: Partial<FfmpegSettings> = {
      customLocationEnabled: true,
      customExecutableLocation: customExecutablePath,
    };
    await updateSettingsAndNotifyRendererProcess({
      video: {
        ffmpegSettings,
      },
    });

    const payload: FfmpegVersionChangedPayload = {
      version,
      isUpdateAvailable: false,
      errorCode: undefined,
    };

    return payload;
  } catch (error) {
    handleError(error, 'Error while enabling FFmpeg custom location');
  }
}
