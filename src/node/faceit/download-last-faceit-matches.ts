import { DownloadStatus } from 'csdm/common/types/download-status';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { DownloadSource } from 'csdm/common/download/download-types';
import { fetchCurrentFaceitAccount } from 'csdm/node/database/faceit-account/fetch-current-faceit-account';
import { fetchLastFaceitMatches } from 'csdm/node/faceit/fetch-last-faceit-matches';
import { fetchDownloadHistories } from 'csdm/node/database/download-history/fetch-download-histories';

export async function downloadLastFaceitMatches() {
  const currentAccount = await fetchCurrentFaceitAccount();
  if (!currentAccount) {
    return [];
  }

  const [matches, downloadHistories] = await Promise.all([
    fetchLastFaceitMatches(currentAccount.id),
    fetchDownloadHistories(),
  ]);

  const downloadedMatchIds = downloadHistories.map((history) => history.match_id);
  const matchesToDownload = matches.filter((match) => {
    return match.downloadStatus === DownloadStatus.NotDownloaded && !downloadedMatchIds.includes(match.id);
  });
  const downloads = matchesToDownload.map((match) => {
    return {
      matchId: match.id,
      game: match.game,
      demoUrl: match.demoUrl,
      fileName: match.id,
      source: DownloadSource.Faceit,
      match,
    };
  });

  const downloadsAdded = await downloadDemoQueue.addDownloads(downloads);

  return downloadsAdded;
}
