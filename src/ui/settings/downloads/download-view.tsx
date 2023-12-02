import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { DownloadFolderPath } from './download-folder-path';
import { FaceitSettings } from './faceit-settings';
import { ValveSettings } from './valve-settings';

export function DownloadSettings() {
  return (
    <SettingsView>
      <DownloadFolderPath />
      <ValveSettings />
      <FaceitSettings />
    </SettingsView>
  );
}
