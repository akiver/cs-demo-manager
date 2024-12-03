import React from 'react';
import { Trans } from '@lingui/react/macro';
import { IncludeSubFoldersSwitch } from './include-sub-folders-switch';
import { RemoveFolderButton } from './remove-folder-button';
import { RevealFolderInExplorerButton } from 'csdm/ui/components/buttons/reveal-folder-in-explorer-button';
import type { Folder } from 'csdm/node/settings/settings';
import { pathContainsInvalidCsgoChars } from 'csdm/common/string/path-contains-invalid-csgo-chars';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

type Props = {
  folder: Folder;
};

export function FolderRow({ folder }: Props) {
  return (
    <div className="flex flex-col border border-gray-300 p-8 rounded">
      <p className="font-semibold selectable">{folder.path}</p>
      <div className="flex items-center justify-between mt-4">
        <IncludeSubFoldersSwitch folder={folder} />
        <div className="flex gap-x-8">
          <RevealFolderInExplorerButton path={folder.path} />
          <RemoveFolderButton folderPath={folder.path} />
        </div>
      </div>
      {pathContainsInvalidCsgoChars(folder.path) && (
        <div className="flex items-center gap-x-4 mt-4">
          <ExclamationTriangleIcon className="size-12 text-orange-700" />
          <p className="text-caption">
            <Trans>
              This folder contains characters that will prevent demo playback when starting CS:GO! (not CS2)
            </Trans>
          </p>
        </div>
      )}
    </div>
  );
}
