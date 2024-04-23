import type { Folder } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { findDemosInFolders } from './find-demos-in-folders';

async function getFoldersToInclude(): Promise<Folder[]> {
  const settings = await getSettings();
  const { showAllFolders, currentFolderPath } = settings.demos;

  let foldersToInclude: Folder[] = settings.folders;
  if (!showAllFolders && currentFolderPath !== '') {
    const currentFolder = settings.folders.find((folder) => {
      return folder.path === currentFolderPath;
    });

    if (currentFolder !== undefined) {
      foldersToInclude = [currentFolder];
    }
  }

  return foldersToInclude;
}

export async function getDemosFilePathsToLoad() {
  const foldersToInclude = await getFoldersToInclude();
  const filePaths = await findDemosInFolders(foldersToInclude);

  return filePaths;
}
