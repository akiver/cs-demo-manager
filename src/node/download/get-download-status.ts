import path from 'node:path';
import fs from 'fs-extra';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { isDownloadLinkExpired } from 'csdm/node/download/is-download-link-expired';

export async function getDownloadStatus(downloadFolderPath: string | undefined, matchId: string, demoUrl: string) {
  if (downloadFolderPath !== undefined) {
    const demoPath = path.join(downloadFolderPath, `${matchId}.dem`);
    const demoExists = await fs.pathExists(demoPath);
    if (demoExists) {
      return DownloadStatus.Downloaded;
    }
  }

  const downloadLinkExpired = await isDownloadLinkExpired(demoUrl);
  if (downloadLinkExpired) {
    return DownloadStatus.Expired;
  }

  return DownloadStatus.NotDownloaded;
}
