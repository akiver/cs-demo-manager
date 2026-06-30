import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { FoldersList } from './folders-list';
import { AddFolderButton } from './add-folder-button';
import { DemoArchiveExtractionSettings } from './demo-archive-extraction-settings';

export function FoldersSettings() {
  return (
    <SettingsView>
      <div className="flex flex-col gap-y-12">
        <DemoArchiveExtractionSettings />
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-subtitle">
              <Trans>Folders</Trans>
            </h2>
            <AddFolderButton />
          </div>
          <FoldersList />
        </div>
      </div>
    </SettingsView>
  );
}
