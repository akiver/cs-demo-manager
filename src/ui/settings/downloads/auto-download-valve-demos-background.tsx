import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function AutoDownloadValveDemosBackground() {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      download: {
        downloadValveDemosInBackground: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={download.downloadValveDemosInBackground} onChange={onChange} />}
      description={<Trans>Automatically download Valve matchmaking demos in the background.</Trans>}
      title={<Trans context="Settings title">Background download</Trans>}
    />
  );
}
