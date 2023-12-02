import React from 'react';
import { Switch } from 'csdm/ui/components/inputs/switch';
import type { Folder } from 'csdm/node/settings/settings';
import { useFolders } from './use-folders';
import { useUpdateSettings } from '../use-update-settings';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { folderUpdated } from './folder-actions';
import { Trans } from '@lingui/macro';

type Props = {
  folder: Folder;
};

export function IncludeSubDirectoriesSwitch({ folder }: Props) {
  const dispatch = useDispatch();
  const folders = useFolders();
  const updateSettings = useUpdateSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const folderPath = folder.path;

    const newFolders = folders.map((folder) => {
      if (folderPath !== folder.path) {
        return folder;
      }

      return {
        path: folder.path,
        includeSubFolders: event.target.checked,
      };
    });

    await updateSettings(
      {
        folders: newFolders,
      },
      {
        preserveSourceArray: true,
      },
    );

    dispatch(folderUpdated(folderPath));
  };

  const id = `include-sub-folders-${folder.path}`;

  return (
    <div className="flex items-center gap-x-12">
      <label htmlFor={id}>
        <Trans>Include subdirectories</Trans>
      </label>
      <Switch id={id} isChecked={folder.includeSubFolders} onChange={onChange} />
    </div>
  );
}
