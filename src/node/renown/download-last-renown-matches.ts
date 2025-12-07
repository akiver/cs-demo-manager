import { DownloadStatus } from 'csdm/common/types/download-status';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { DownloadSource } from 'csdm/common/download/download-types';
import { fetchDownloadHistories } from 'csdm/node/database/download-history/fetch-download-histories';
import { fetchCurrentRenownAccount } from '../database/renown-account/fetch-current-renown-account';
import { fetchLastRenownMatches } from './fetch-last-renown-matches';

export async function downloadLastRenownMatches() {
  const currentAccount = await fetchCurrentRenownAccount();
  if (!currentAccount) {
    return [];
  }

  const [matches, downloadHistories] = await Promise.all([
    fetchLastRenownMatches(currentAccount.id),
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
      source: DownloadSource.Renown,
      match,
    };
  });

  const downloadsAdded = await downloadDemoQueue.addDownloads(downloads);

  return downloadsAdded;
}
