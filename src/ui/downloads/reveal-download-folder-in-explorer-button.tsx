import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useDownloadFolderPath } from 'csdm/ui/settings/downloads/use-download-folder-path';
import { Tooltip } from 'csdm/ui/components/tooltip';

export function RevealDownloadFolderInExplorerButton() {
  const downloadFolder = useDownloadFolderPath();

  const onClick = () => {
    if (downloadFolder !== undefined) {
      window.csdm.browseToFolder(downloadFolder);
    }
  };
  const isDisabled = downloadFolder === undefined;

  const button = (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Reveal download folder</Trans>
    </Button>
  );

  if (!isDisabled) {
    return button;
  }

  return (
    <Tooltip content={<Trans context="Tooltip">A download folder is required. You can change it from settings.</Trans>}>
      {button}
    </Tooltip>
  );
}
