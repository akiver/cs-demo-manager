import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CenteredContent } from 'csdm/ui/components/content';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useShowDownloadFolderDialog } from 'csdm/ui/settings/downloads/use-show-download-folder-dialog';

export function DownloadsFolderRequired() {
  const showDownloadFolderDialog = useShowDownloadFolderDialog();

  return (
    <CenteredContent>
      <p className="text-subtitle mb-12">
        <Trans>A downloads folder is required.</Trans>
      </p>
      <Button onClick={showDownloadFolderDialog} variant={ButtonVariant.Primary}>
        <Trans context="Button">Select downloads folder</Trans>
      </Button>
    </CenteredContent>
  );
}
