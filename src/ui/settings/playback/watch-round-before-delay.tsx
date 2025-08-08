import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { usePlaybackSettings } from './use-playback-settings';

export function WatchRoundBeforeDelay() {
  const { round, updateSettings } = usePlaybackSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      round: {
        beforeRoundDelayInSeconds: seconds,
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
