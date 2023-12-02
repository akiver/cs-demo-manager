import React from 'react';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { Trans } from '@lingui/macro';

export function LowlightsWatchBeforeKillDelay() {
  const { lowlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      playback: {
        lowlights: {
          beforeKillDelayInSeconds: seconds,
        },
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
