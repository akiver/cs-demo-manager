import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { usePlaybackSettings } from './use-playback-settings';

export function PlayerVoices() {
  const { playerVoicesEnabled, updateSettings } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      playerVoicesEnabled: isChecked,
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={playerVoicesEnabled} onChange={onChange} />}
      description={
        <div>
          <Trans>Listen player voices during playback</Trans>
          <div className="flex items-center gap-x-4 mt-4">
            <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
            <p className="text-caption">
              <Trans>Doesn't work with Valve Matchmaking demos as voice data are not available!</Trans>
            </p>
          </div>
        </div>
      }
      title={<Trans context="Settings title">Player voices</Trans>}
    />
  );
}
