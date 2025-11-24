import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingAudio() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.recordAudio}
          onChange={(isChecked) => {
            updateSettings({ recordAudio: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>Record audio during video recording.</Trans>
        </p>
      }
      title={<Trans context="Settings title">Record Audio</Trans>}
    />
  );
}
