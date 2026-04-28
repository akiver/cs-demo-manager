import { glob } from 'csdm/node/filesystem/glob';
import type { Folder } from '../settings/settings';
import { uniqueArray } from 'csdm/common/array/unique-array';

export async function findDemosInFolders(folders: Folder[]) {
  const demoPaths: string[] = [];
  for (const folder of folders) {
    const pattern = folder.includeSubFolders ? '**/*.dem' : '*.dem';
    const files = await glob(pattern, {
      cwd: folder.path,
      absolute: true,
    });
    demoPaths.push(...files);
  }

  return uniqueArray(demoPaths);
}
