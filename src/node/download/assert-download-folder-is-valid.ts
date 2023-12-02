import fs from 'fs-extra';
import { getSettings } from 'csdm/node/settings/get-settings';
import { DownloadFolderNotDefined } from './errors/download-folder-not-defined';
import { DownloadFolderNotExists } from './errors/download-folder-not-exists';

export async function assertDownloadFolderIsValid() {
  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;
  if (downloadFolderPath === undefined) {
    throw new DownloadFolderNotDefined();
  }

  const downloadFolderExists = await fs.pathExists(downloadFolderPath);
  if (!downloadFolderExists) {
    throw new DownloadFolderNotExists();
  }
}
