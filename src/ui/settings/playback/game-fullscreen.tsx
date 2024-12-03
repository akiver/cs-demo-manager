import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';

export function GameFullscreen() {
  const { fullscreen } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    await updateSettings({
      playback: {
        fullscreen: checked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={fullscreen} onChange={onChange} />}
      description={<Trans>Start the game in fullscreen mode</Trans>}
      title={<Trans context="Settings title">Fullscreen</Trans>}
    />
  );
}
