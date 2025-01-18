import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingXRay() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.showXRay}
          onChange={(isChecked) => {
            updateSettings({ showXRay: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>See players through walls during recording.</Trans>
        </p>
      }
      title={<Trans context="Settings title">Show X-Ray</Trans>}
    />
  );
}
