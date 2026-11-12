import { isTimestampExpired } from 'csdm/node/database/timestamps/is-timestamp-expired';
import { TimestampName } from 'csdm/node/database/timestamps/timestamp-name';
import { updateTimestamp } from 'csdm/node/database/timestamps/update-timestamp';
import { compareVersions } from 'csdm/common/compare-versions';
import { fetchLastHlaeRelease } from './fetch-last-hlae-release';

export async function checkForHlaeUpdate(currentVersion: string): Promise<boolean> {
  const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
  const shouldCheck = await isTimestampExpired(TimestampName.HlaeUpdate, thirtyMinutesInMilliseconds);
  if (!shouldCheck) {
    return false;
  }

  try {
    const lastRelease: GitHubReleaseResponse = await fetchLastHlaeRelease();
    const lastVersion = lastRelease.tag_name.slice(1, lastRelease.tag_name.length);

    await updateTimestamp(TimestampName.HlaeUpdate);

    return compareVersions(lastVersion, currentVersion) > 0;
  } catch (error) {
    logger.error('An error occurred while checking for HLAE update');
    logger.error(error);
    return false;
  }
}
