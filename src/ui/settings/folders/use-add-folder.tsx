import React from 'react';
import type { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { folderAdded } from './folder-actions';
import { useUpdateSettings } from '../use-update-settings';
import { useFolders } from './use-folders';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function useAddFolder() {
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const currentFolders = useFolders();
  const updateSettings = useUpdateSettings();

  return async () => {
    const options: OpenDialogOptions = { properties: ['openDirectory'] };
    const { canceled, filePaths }: OpenDialogReturnValue = await window.csdm.showOpenDialog(options);
    if (canceled || filePaths.length === 0) {
      return;
    }

    const [folderPath] = filePaths;
    const isFolderAlreadyInUserSettings = currentFolders.some((folder) => folder.path === folderPath);
    if (isFolderAlreadyInUserSettings) {
      showToast({
        content: <Trans>This folder is already in your settings</Trans>,
        type: 'warning',
      });
      return;
    }

    await updateSettings({
      demos: {
        currentFolderPath: folderPath,
      },
      folders: [
        {
          path: folderPath,
          includeSubFolders: false,
        },
      ],
    });

    dispatch(folderAdded(folderPath));
  };
}
