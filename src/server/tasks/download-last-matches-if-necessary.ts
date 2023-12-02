import { getSettings } from 'csdm/node/settings/get-settings';
import { downloadLastValveMatches } from 'csdm/server/tasks/download-last-valve-matches';
import { isCounterStrikeRunning } from 'csdm/node/counter-strike/is-counter-strike-running';
import { downloadLastFaceitMatches } from 'csdm/node/faceit/download-last-faceit-matches';
import { deleteOldDownloadHistories } from 'csdm/node/database/download-history/delete-old-download-histories';

export async function downloadLastMatchesIfNecessary() {
  const [settings] = await Promise.all([getSettings(), deleteOldDownloadHistories()]);

  if (settings.download.downloadValveDemosAtStartup) {
    const isCsRunning = await isCounterStrikeRunning();
    if (!isCsRunning) {
      await downloadLastValveMatches();
    }
  }

  if (settings.download.downloadFaceitDemosAtStartup) {
    await downloadLastFaceitMatches();
  }
}
