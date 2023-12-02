import React from 'react';
import { Trans } from '@lingui/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function AutoDownloadFaceitDemosBackground() {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    await updateSettings({
      download: {
        downloadFaceitDemosInBackground: checked,
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
