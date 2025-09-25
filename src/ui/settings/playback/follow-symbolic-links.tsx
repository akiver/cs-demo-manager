import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { usePlaybackSettings } from './use-playback-settings';

export function FollowSymbolicLinks() {
  const { followSymbolicLinks, updateSettings } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      followSymbolicLinks: isChecked,
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={followSymbolicLinks} onChange={onChange} />}
      description={
        <p>
          <Trans>Follow symbolic links when looking for the Steam runtime script used to launch Counter-Strike.</Trans>
        </p>
      }
      title={<Trans context="Settings title">Follow symbolic Links</Trans>}
    />
  );
}
