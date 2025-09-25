import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingAssists() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.showAssists}
          onChange={(isChecked) => {
            updateSettings({ showAssists: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>Show assists in kill feed.</Trans>
        </p>
      }
      title={<Trans context="Settings title">Show Assists</Trans>}
    />
  );
}
