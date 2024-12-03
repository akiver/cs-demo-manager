import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';

export function WatchRoundAfterDelay() {
  const { round } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      playback: {
        round: {
          afterRoundDelayInSeconds: seconds,
        },
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
