import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingShowOnlyDeathNotices() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.showOnlyDeathNotices}
          onChange={(isChecked) => {
            updateSettings({ showOnlyDeathNotices: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>Show only death notices during recording.</Trans>
        </p>
      }
      title={<Trans context="Settings title">Show only death notices</Trans>}
    />
  );
}
