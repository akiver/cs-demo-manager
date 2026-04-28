import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Switch } from 'csdm/ui/components/inputs/switch';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { usePlaybackSettings } from './use-playback-settings';

export function WatchRoundWaitRoundEnd() {
  const {
    round: { waitForRoundEnd },
    updateSettings,
  } = usePlaybackSettings();

  const onChange = async (isChecked: boolean) => {
    await updateSettings({
      round: {
        waitForRoundEnd: isChecked,
      },
    });
  };

  return (
    <SettingsEntry
      interactiveComponent={<Switch isChecked={waitForRoundEnd} onChange={onChange} />}
      description={
        <span>
          <Trans>Wait for the round to end before skipping to the next round when watching player's rounds.</Trans>
        </span>
      }
      title={<Trans context="Settings title">Wait for round end</Trans>}
    />
  );
}
