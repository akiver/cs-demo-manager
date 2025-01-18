import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function AutoDownloadValveDemos() {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      download: {
        downloadValveDemosAtStartup: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={download.downloadValveDemosAtStartup} onChange={onChange} />}
      description={<Trans>Automatically download Valve matchmaking demos at application startup.</Trans>}
      title={<Trans context="Settings title">Startup download</Trans>}
    />
  );
}
