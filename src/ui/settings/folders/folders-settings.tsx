import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { FoldersList } from './folders-list';
import { AddFolderButton } from './add-folder-button';

export function FoldersSettings() {
  return (
    <SettingsView>
      <AddFolderButton />
      <FoldersList />
    </SettingsView>
  );
}
