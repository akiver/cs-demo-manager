import { useDownloadStatus } from './use-download-status';
import { DownloadStatus } from 'csdm/common/types/download-status';

export function usePendingDownloadCount() {
  const statuses: { [matchId: string]: DownloadStatus } = useDownloadStatus();
  const pendingDownloads = Object.values(statuses).filter((status) => {
    return status === DownloadStatus.NotDownloaded || status === DownloadStatus.Downloading;
  });

  return pendingDownloads.length;
}
