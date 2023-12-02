import React from 'react';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { folderRemoved } from './folder-actions';
import { useUpdateSettings } from '../use-update-settings';
import { useFolders } from './use-folders';
import { useCurrentDemoFolder } from './use-current-demo-folder';
import { RemoveButton } from 'csdm/ui/components/buttons/remove-button';

type Props = {
  folderPath: string;
};

export function RemoveFolderButton({ folderPath }: Props) {
  const dispatch = useDispatch();
  const folders = useFolders();
  const currentFolderPath = useCurrentDemoFolder();
  const updateSettings = useUpdateSettings();

  const onClick = async () => {
    const newFolders = folders.filter((folder) => folder.path !== folderPath);
    let newCurrentFolderPath = '';
    if (newFolders.length > 0) {
      newCurrentFolderPath =
        currentFolderPath === folderPath ? newFolders[newFolders.length - 1].path : currentFolderPath;
    }

    await updateSettings(
      {
        folders: newFolders,
        demos: {
          currentFolderPath: newCurrentFolderPath,
        },
      },
      {
        preserveSourceArray: true,
      },
    );

    dispatch(folderRemoved(folderPath));
  };

  return <RemoveButton onClick={onClick} />;
}
