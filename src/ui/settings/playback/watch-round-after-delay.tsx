import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { usePlaybackSettings } from './use-playback-settings';

export function WatchRoundAfterDelay() {
  const { round, updateSettings } = usePlaybackSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      round: {
        afterRoundDelayInSeconds: seconds,
      },
    });
  };

  return (
    <WatchBeforeKillDelay
      title={<Trans context="Settings title">After round delay</Trans>}
      description={
        <Trans>
          How many seconds to wait before skipping to the next round at the end of the round or when the player dies.
        </Trans>
      }
      defaultValue={round.afterRoundDelayInSeconds}
      onChange={onChange}
    />
  );
}
