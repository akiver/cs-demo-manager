import fs from 'fs-extra';
import type { FfmpegSettings } from 'csdm/node/settings/settings';
import { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { checkForFfmpegUpdate } from 'csdm/node/video/ffmpeg/check-for-ffmpeg-update';
import { getFfmpegVersionFromExecutable } from 'csdm/node/video/ffmpeg/get-ffmpeg-version-from-executable';
import { updateSettingsAndNotifyRendererProcess } from 'csdm/server/update-settings-and-notify-renderer-process';
import { getDefaultFfmpegExecutablePath } from 'csdm/node/video/ffmpeg/ffmpeg-location';
import type { FfmpegVersionChangedPayload } from './ffmpeg-version-changed-payload';

export async function disableFfmpegCustomLocationHandler(clearCustomLocation?: boolean) {
  const payload: FfmpegVersionChangedPayload = {
    errorCode: undefined,
    version: undefined,
    isUpdateAvailable: false,
  };

  try {
    const ffmpegSettings: Partial<FfmpegSettings> = {
      customLocationEnabled: false,
    };

    if (clearCustomLocation) {
      ffmpegSettings.customExecutableLocation = '';
    }

    await updateSettingsAndNotifyRendererProcess({
      video: {
        ffmpegSettings,
      },
    });

    const defaultFfmpegExecutablePath = getDefaultFfmpegExecutablePath();
    const executableExists = await fs.pathExists(defaultFfmpegExecutablePath);
    if (!executableExists) {
      return payload;
    }

    const version = await getFfmpegVersionFromExecutable(defaultFfmpegExecutablePath);
    let isUpdateAvailable = false;
    if (version !== undefined) {
      isUpdateAvailable = await checkForFfmpegUpdate(version);
    }

    return {
      ...payload,
      version,
      isUpdateAvailable,
    };
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error('Error while disabling FFmpeg custom location');
      logger.error(error);
    }

    return {
      ...payload,
      errorCode,
    };
  }
}
