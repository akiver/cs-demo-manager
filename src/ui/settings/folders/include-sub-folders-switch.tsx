import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import type { Folder } from 'csdm/node/settings/settings';
import { useToggleFolderSubFoldersInclusion } from './use-toggle-folder-sub-folders-inclusion';

type Props = {
  folder: Folder;
};

export function IncludeSubFoldersSwitch({ folder }: Props) {
  const toggleFolderSubFoldersInclusion = useToggleFolderSubFoldersInclusion();

  const onChange = async (isChecked: boolean) => {
    await toggleFolderSubFoldersInclusion(folder.path, isChecked);
  };

  const id = `include-sub-folders-${folder.path}`;

  return (
    <div className="flex items-center gap-x-12">
      <label htmlFor={id}>
        <Trans>Include subfolders</Trans>
      </label>
      <Switch id={id} isChecked={folder.includeSubFolders} onChange={onChange} />
    </div>
  );
}
