import { downloadDemoQueue } from 'csdm/server/download-queue';
import { handleError } from '../../handle-error';

export async function abortDownloadHandler(matchId: string) {
  try {
    downloadDemoQueue.abortDownload(matchId);
    return Promise.resolve();
  } catch (error) {
    handleError(error, `Error while aborting download with match id ${matchId}`);
  }
}
