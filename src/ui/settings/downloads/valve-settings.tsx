import React from 'react';
import { ThirdPartySettings } from './third-party-settings';
import { ValveLogo } from 'csdm/ui/logos/valve-logo';

export function ValveSettings() {
  return (
    <ThirdPartySettings
      name="Valve"
      logo={<ValveLogo className="h-20" />}
      autoDownloadAtStartupSettingsKey="downloadValveDemosAtStartup"
      autoDownloadInBackgroundSettingsKey="downloadValveDemosInBackground"
    />
  );
}
