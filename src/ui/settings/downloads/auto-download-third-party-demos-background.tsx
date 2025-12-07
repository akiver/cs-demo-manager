import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from '../use-settings';
import { useUpdateSettings } from '../use-update-settings';
import type { DownloadSettings } from 'csdm/node/settings/settings';

type Props = {
  name: string;
  settingsKey: Extract<keyof DownloadSettings, `download${string}InBackground`>;
};

export function AutoDownloadThirdPartyDemosBackground({ name, settingsKey }: Props) {
  const { download } = useSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      download: {
        [settingsKey]: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={download[settingsKey]} onChange={onChange} />}
      description={<Trans>Automatically download {name} demos in the background.</Trans>}
      title={<Trans context="Settings title">Background download</Trans>}
    />
  );
}
