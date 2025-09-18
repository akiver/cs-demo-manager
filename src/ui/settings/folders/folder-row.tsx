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
    <div className="flex flex-col rounded border border-gray-300 p-8">
      <p className="selectable font-semibold">{folder.path}</p>
      <div className="mt-4 flex items-center justify-between">
        <IncludeSubFoldersSwitch folder={folder} />
        <div className="flex gap-x-8">
          <RevealFolderInExplorerButton path={folder.path} />
          <RemoveFolderButton folderPath={folder.path} />
        </div>
      </div>
      {pathContainsInvalidCsgoChars(folder.path) && (
        <div className="mt-4 flex items-center gap-x-4">
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
