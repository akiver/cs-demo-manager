import { DownloadStatus } from 'csdm/common/types/download-status';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { fetchLastValveMatches } from 'csdm/node/valve-match/fetch-last-valve-matches';
import { buildDownloadFromValveMatch } from 'csdm/common/download/build-download-from-valve-match';
import { fetchDownloadHistories } from 'csdm/node/database/download-history/fetch-download-histories';
import { ErrorCode } from 'csdm/common/error-code';

export async function downloadLastValveMatches() {
  try {
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.FetchLastValveMatchesStart,
    });

    const onSteamIdDetected = (steamId: string) => {
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.FetchLastValveMatchesSteamIdDetected,
        payload: steamId,
      });
    };
    const [lastMatches, downloadHistories] = await Promise.all([
      fetchLastValveMatches(onSteamIdDetected),
      fetchDownloadHistories(),
    ]);
    const downladedMatchIds = downloadHistories.map((history) => history.match_id);
    const matchesToDownload = lastMatches.filter((match) => {
      return match.downloadStatus === DownloadStatus.NotDownloaded && !downladedMatchIds.includes(match.id);
    });
    const downloads = matchesToDownload.map(buildDownloadFromValveMatch);
    const downloadsAdded = await downloadDemoQueue.addDownloads(downloads);

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.FetchLastValveMatchesSuccess,
      payload: lastMatches,
    });

    return downloadsAdded;
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error('Error while adding last Valve matches to download queue');
      logger.error(error);
    }
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.FetchLastValveMatchesError,
      payload: errorCode,
    });

    return [];
  }
}
