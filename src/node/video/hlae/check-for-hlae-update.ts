import { isTimestampExpired } from 'csdm/node/database/timestamps/is-timestamp-expired';
import { TimestampName } from 'csdm/node/database/timestamps/timestamp-name';
import { updateTimestamp } from 'csdm/node/database/timestamps/update-timestamp';
import { fetchLastHlaeRelease } from './fetch-last-hlae-release';

function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const part1 = v1Parts[i] ?? 0;
    const part2 = v2Parts[i] ?? 0;

    if (part1 !== part2) {
      return part1 - part2;
    }
  }

  return 0;
}

export async function checkForHlaeUpdate(currentVersion: string): Promise<boolean> {
  const twoHoursInMilliseconds = 3600 * 2 * 1000;
  const shouldCheck = await isTimestampExpired(TimestampName.HlaeUpdate, twoHoursInMilliseconds);
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
