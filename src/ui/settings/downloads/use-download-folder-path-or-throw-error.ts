import { useDownloadFolderPath } from './use-download-folder-path';

export function useDownloadFolderPathOrThrowError() {
  const downloadFolderPath: string | undefined = useDownloadFolderPath();
  if (downloadFolderPath === undefined) {
    throw new Error('Download folder not setup');
  }

  return downloadFolderPath;
}
