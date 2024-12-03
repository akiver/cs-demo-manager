import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';

export function WatchRoundBeforeDelay() {
  const { round } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      playback: {
        round: {
          beforeRoundDelayInSeconds: seconds,
        },
      },
    });
  };

  return (
    <WatchBeforeKillDelay
      title={<Trans context="Settings title">Before round delay</Trans>}
      description={<Trans>How many seconds to start before the end of the round's freeze time.</Trans>}
      defaultValue={round.beforeRoundDelayInSeconds}
      onChange={onChange}
    />
  );
}
