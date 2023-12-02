import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { downloadFolderChanged } from '../settings-actions';
import { useUpdateSettings } from '../use-update-settings';

export function useShowDownloadFolderDialog() {
  const updateSettings = useUpdateSettings();
  const dispatch = useDispatch();

  return async () => {
    const options: OpenDialogOptions = { properties: ['openDirectory'] };
    const { filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (filePaths.length > 0) {
      const [folder] = filePaths;
      await updateSettings({
        download: {
          folderPath: folder,
        },
      });
      dispatch(downloadFolderChanged());
    }
  };
}
