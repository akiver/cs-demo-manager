import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

export function RecordingPlayerVoices() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.playerVoicesEnabled}
          onChange={(isChecked) => {
            updateSettings({ playerVoicesEnabled: isChecked });
          }}
        />
      }
      description={
        <>
          <p>
            <Trans>Listen to player voices during recording.</Trans>
          </p>
          <div className="flex items-center gap-x-4 mt-4">
            <ExclamationTriangleIcon className="size-12 shrink-0 text-orange-700" />
            <p className="text-caption">
              <Trans>Player voices are not available in Valve Matchmaking demos!</Trans>
            </p>
          </div>
        </>
      }
      title={<Trans context="Settings title">Player voices</Trans>}
    />
  );
}
