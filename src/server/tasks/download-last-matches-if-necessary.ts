import { getSettings } from 'csdm/node/settings/get-settings';
import { downloadLastValveMatches } from 'csdm/server/tasks/download-last-valve-matches';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { downloadLastFaceitMatches } from 'csdm/node/faceit/download-last-faceit-matches';
import { deleteOldDownloadHistories } from 'csdm/node/database/download-history/delete-old-download-histories';
import { downloadLast5EPlayMatches } from 'csdm/node/5eplay/download-last-5eplay-matches';
import type { Download } from 'csdm/common/download/download-types';

export async function downloadLastMatchesIfNecessary() {
  const [settings] = await Promise.all([getSettings(), deleteOldDownloadHistories()]);

  if (settings.download.downloadValveDemosAtStartup) {
    const isCsRunning = await isCounterStrikeRunning();
    if (!isCsRunning) {
      await downloadLastValveMatches();
    }
  }

  const promises: Promise<Download[]>[] = [];
  if (settings.download.downloadFaceitDemosAtStartup) {
    promises.push(downloadLastFaceitMatches());
  }

  if (settings.download.download5EPlayDemosAtStartup) {
    promises.push(downloadLast5EPlayMatches());
  }

  await Promise.all(promises);
}
