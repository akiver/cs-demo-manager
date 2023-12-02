export const DownloadStatus = {
  NotDownloaded: 'not-downloaded',
  Downloaded: 'downloaded',
  Downloading: 'downloading',
  Error: 'error',
  Expired: 'expired',
} as const;

export type DownloadStatus = (typeof DownloadStatus)[keyof typeof DownloadStatus];
