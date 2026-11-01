import fs from 'fs-extra';
import { fetchMatchTimeline } from 'csdm/node/database/match/fetch-match-timeline';
import { fetchMatchHighlights } from 'csdm/node/database/match/fetch-match-highlights';
import { getSettings } from 'csdm/node/settings/get-settings';
import { WatchType } from 'csdm/common/types/watch-type';

export function getTimelineFilePath(demoPath: string) {
  return `${demoPath}.timeline.json`;
}

export async function writeTimelineFile(demoPath: string, checksum: string) {
  // The timeline is optional, a failure here must not stop the demo from starting.
  try {
    const {
      playback: { highlights: highlightsSettings, lowlights: lowlightsSettings },
    } = await getSettings();
    const [timeline, highlights, lowlights] = await Promise.all([
      fetchMatchTimeline(checksum),
      fetchMatchHighlights({
        checksum,
        type: WatchType.Highlights,
        includeDamages: highlightsSettings.includeDamages,
        beforeDelaySeconds: highlightsSettings.beforeKillDelayInSeconds,
        afterDelaySeconds: highlightsSettings.afterKillDelayInSeconds,
      }),
      fetchMatchHighlights({
        checksum,
        type: WatchType.Lowlights,
        includeDamages: lowlightsSettings.includeDamages,
        beforeDelaySeconds: lowlightsSettings.beforeKillDelayInSeconds,
        afterDelaySeconds: lowlightsSettings.afterKillDelayInSeconds,
      }),
    ]);
    if (timeline.rounds.length === 0 && timeline.kills.length === 0) {
      return;
    }

    await fs.writeFile(getTimelineFilePath(demoPath), JSON.stringify({ checksum, ...timeline, highlights, lowlights }));
  } catch (error) {
    logger.warn(`Failed to write timeline file for demo ${demoPath}`);
    logger.warn(error);
  }
}
