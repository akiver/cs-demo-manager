import { downloadDemoQueue } from 'csdm/server/download-queue';
import { getErrorCodeFromError } from '../../../get-error-code-from-error';

export async function abortDownloadHandler(matchId: string) {
  try {
    downloadDemoQueue.abortDownload(matchId);
    return Promise.resolve();
  } catch (error) {
    logger.error(`Error while aborting download with match id ${matchId}`);
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
