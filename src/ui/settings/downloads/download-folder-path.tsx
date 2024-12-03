import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RevealFolderInExplorerButton } from 'csdm/ui/components/buttons/reveal-folder-in-explorer-button';
import { useDownloadFolderPath } from './use-download-folder-path';
import { useShowDownloadFolderDialog } from './use-show-download-folder-dialog';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { ChangeButton } from 'csdm/ui/components/buttons/change-button';

export function DownloadFolderPath() {
  const downloadFolderPath = useDownloadFolderPath();
  const showDownloadFolderDialog = useShowDownloadFolderDialog();

  return (
    <div>
      <p className="text-body-strong">
        <Trans>Download folder</Trans>
      </p>
      <div className="flex gap-x-8 mt-8">
        <TextInput value={downloadFolderPath} isReadOnly={true} />
        {downloadFolderPath !== undefined && <RevealFolderInExplorerButton path={downloadFolderPath} />}
        <ChangeButton onClick={showDownloadFolderDialog} />
      </div>
    </div>
  );
}
