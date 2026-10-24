import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingKeepRawFilesOnGameError() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.keepRawFilesOnGameError}
          onChange={async (isChecked) => {
            await updateSettings({ keepRawFilesOnGameError: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>Keep the video, audio and image files recorded before the game crashed.</Trans>
        </p>
      }
      title={<Trans context="Settings title">Keep recorded files if the game crashes</Trans>}
    />
  );
}
