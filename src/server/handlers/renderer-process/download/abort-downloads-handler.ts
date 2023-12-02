import { downloadDemoQueue } from 'csdm/server/download-queue';
import { getErrorCodeFromError } from '../../../get-error-code-from-error';

export async function abortDownloadsHandler() {
  try {
    downloadDemoQueue.abortDownloads();
    return Promise.resolve();
  } catch (error) {
    logger.error('Error while aborting downloads');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
