import React from 'react';
import { ThirdPartySettings } from './third-party-settings';

export function ValveSettings() {
  return (
    <ThirdPartySettings
      name="Valve"
      autoDownloadAtStartupSettingsKey="downloadValveDemosAtStartup"
      autoDownloadInBackgroundSettingsKey="downloadValveDemosInBackground"
    />
  );
}
