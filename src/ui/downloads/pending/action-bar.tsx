import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { DownloadDemoFromShareCodeButton } from 'csdm/ui/downloads/download-demo-from-share-code-button';
import { RevealDownloadFolderInExplorerButton } from '../reveal-download-folder-in-explorer-button';
import { RemoveDownloadsButton } from './remove-downloads-button';

export function DownloadsActionBar() {
  return (
    <ActionBar
      left={
        <>
          <DownloadDemoFromShareCodeButton />
          <RevealDownloadFolderInExplorerButton />
          <RemoveDownloadsButton />
        </>
      }
    />
  );
}
