import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { usePlaybackSettings } from './use-playback-settings';

export function GameFullscreen() {
  const { fullscreen, updateSettings } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      fullscreen: isChecked,
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
