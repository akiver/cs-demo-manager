import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function AutoDownloadFaceitDemosBackground() {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      download: {
        downloadFaceitDemosInBackground: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={download.downloadFaceitDemosInBackground} onChange={onChange} />}
      description={<Trans>Automatically download FACEIT demos in the background.</Trans>}
      title={<Trans context="Settings title">Background download</Trans>}
    />
  );
}
