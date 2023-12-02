import { isTimestampExpired } from 'csdm/node/database/timestamps/is-timestamp-expired';
import { TimestampName } from 'csdm/node/database/timestamps/timestamp-name';
import { updateTimestamp } from 'csdm/node/database/timestamps/update-timestamp';
import { fetchLastHlaeRelease } from './fetch-last-hlae-release';

export async function checkForHlaeUpdate(currentVersion: string): Promise<boolean> {
  const shouldCheck = await isTimestampExpired(TimestampName.HlaeUpdate);
  if (!shouldCheck) {
    return false;
  }

  try {
    const lastRelease: GitHubReleaseResponse = await fetchLastHlaeRelease();
    const lastVersion = lastRelease.tag_name.slice(1, lastRelease.tag_name.length);

    await updateTimestamp(TimestampName.HlaeUpdate);

    return lastVersion > currentVersion;
  } catch (error) {
    logger.error('An error occurred while checking for HLAE update');
    logger.error(error);
    return false;
  }
}
