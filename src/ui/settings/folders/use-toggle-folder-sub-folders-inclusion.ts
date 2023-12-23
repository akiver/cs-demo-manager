import { useFolders } from './use-folders';
import { useUpdateSettings } from '../use-update-settings';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { folderUpdated } from './folder-actions';

export function useToggleFolderSubFoldersInclusion() {
  const dispatch = useDispatch();
  const folders = useFolders();
  const updateSettings = useUpdateSettings();

  return async (folderPath: string, includeSubFolders: boolean) => {
    const newFolders = folders.map((folder) => {
      if (folderPath !== folder.path) {
        return folder;
      }

      return {
        path: folder.path,
        includeSubFolders,
      };
    });

    await updateSettings({ folders: newFolders }, { preserveSourceArray: true });

    dispatch(folderUpdated(folderPath));
  };
}
