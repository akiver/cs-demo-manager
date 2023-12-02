import { useDownloadFolderPath } from 'csdm/ui/settings/downloads/use-download-folder-path';

export function useGetDownloadedDemoPath(demoFileName: string) {
  const downloadFolderPath = useDownloadFolderPath();

  if (downloadFolderPath === undefined || downloadFolderPath === '') {
    return undefined;
  }

  return `${downloadFolderPath}/${demoFileName}.dem`;
}
