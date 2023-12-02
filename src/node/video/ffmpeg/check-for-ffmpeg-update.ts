import { isTimestampExpired } from 'csdm/node/database/timestamps/is-timestamp-expired';
import { TimestampName } from 'csdm/node/database/timestamps/timestamp-name';
import { updateTimestamp } from 'csdm/node/database/timestamps/update-timestamp';
import { getSettings } from 'csdm/node/settings/get-settings';
import { fetchLastFfmpegVersion } from './fetch-last-ffmpeg-version';

export async function checkForFfmpegUpdate(currentVersion: string): Promise<boolean> {
  try {
    const { video } = await getSettings();
    const { ffmpegSettings } = video;
    // We don't check for update if the user is using a custom FFmpeg version because the custom build may have been
    // built with special flags, the user has to update it manually.
    if (ffmpegSettings.customLocationEnabled) {
      return false;
    }

    const shouldCheck = await isTimestampExpired(TimestampName.FfmpegUpdate);
    if (!shouldCheck) {
      return false;
    }

    const lastVersion = await fetchLastFfmpegVersion();

    await updateTimestamp(TimestampName.FfmpegUpdate);

    return lastVersion > currentVersion;
  } catch (error) {
    logger.error('Error while checking for FFMpeg update');
    logger.error(error);
    return false;
  }
}
