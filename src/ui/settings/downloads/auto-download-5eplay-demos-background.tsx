import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';

export function AutoDownload5EPlayDemosBackground() {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    await updateSettings({
      download: {
        download5EPlayDemosInBackground: checked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={download.download5EPlayDemosInBackground} onChange={onChange} />}
      description={<Trans>Automatically download 5EPLay demos in the background.</Trans>}
      title={<Trans context="Settings title">Background download</Trans>}
    />
  );
}
