import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { usePlaybackSettings } from './use-playback-settings';

export function LowlightsWatchAfterKillDelay() {
  const { lowlights, updateSettings } = usePlaybackSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      lowlights: {
        afterKillDelayInSeconds: seconds,
      },
    });
  };

  return (
    <WatchBeforeKillDelay
      title={<Trans context="Settings title">After kill delay (lowlights)</Trans>}
      description={<Trans>How many seconds to wait before skipping to the next kill when watching lowlights</Trans>}
      defaultValue={lowlights.afterKillDelayInSeconds}
      onChange={onChange}
    />
  );
}
