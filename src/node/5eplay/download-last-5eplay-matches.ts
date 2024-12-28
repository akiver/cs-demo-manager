import { DownloadStatus } from 'csdm/common/types/download-status';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { DownloadSource, type FiveEPlayDownload } from 'csdm/common/download/download-types';
import { fetchDownloadHistories } from 'csdm/node/database/download-history/fetch-download-histories';
import { fetchCurrent5EPlayAccount } from '../database/5play-account/fetch-current-5eplay-account';
import { fetchLast5EPlayMatches } from './fetch-last-5eplay-matches';

export async function downloadLast5EPlayMatches() {
  const currentAccount = await fetchCurrent5EPlayAccount();
  if (!currentAccount) {
    return [];
  }

  const [matches, downloadHistories] = await Promise.all([
    fetchLast5EPlayMatches(currentAccount.id),
    fetchDownloadHistories(),
  ]);

  const downloadedMatchIds = downloadHistories.map((history) => history.match_id);
  const matchesToDownload = matches.filter((match) => {
    return match.downloadStatus === DownloadStatus.NotDownloaded && !downloadedMatchIds.includes(match.id);
  });
  const downloads = matchesToDownload.map<FiveEPlayDownload>((match) => {
    return {
      matchId: match.id,
      game: match.game,
      demoUrl: match.demoUrl,
      fileName: match.id,
      source: DownloadSource['5EPlay'],
      match,
    };
  });

  const downloadsAdded = await downloadDemoQueue.addDownloads(downloads);

  return downloadsAdded;
}
