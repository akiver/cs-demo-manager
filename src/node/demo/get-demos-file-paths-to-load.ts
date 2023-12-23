import glob from 'fast-glob';
import type { Folder } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';

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
  const foldersToInclude: Folder[] = await getFoldersToInclude();

  const filePaths: string[] = [];
  for (const folder of foldersToInclude) {
    const pattern = folder.includeSubFolders ? '**/*.dem' : '*.dem';
    const files = await glob(pattern, {
      cwd: folder.path,
      absolute: true,
    });
    filePaths.push(...files);
  }

  return filePaths;
}
