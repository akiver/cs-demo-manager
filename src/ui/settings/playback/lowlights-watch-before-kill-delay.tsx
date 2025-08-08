import React from 'react';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { Trans } from '@lingui/react/macro';
import { usePlaybackSettings } from './use-playback-settings';

export function LowlightsWatchBeforeKillDelay() {
  const { lowlights, updateSettings } = usePlaybackSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      lowlights: {
        beforeKillDelayInSeconds: seconds,
      },
    });
  };

  return (
    <WatchBeforeKillDelay
      title={<Trans context="Settings title">Before kill delay (lowlights)</Trans>}
      description={<Trans>How many seconds to start before a kill when watching lowlights</Trans>}
      defaultValue={lowlights.beforeKillDelayInSeconds}
      onChange={onChange}
    />
  );
}
