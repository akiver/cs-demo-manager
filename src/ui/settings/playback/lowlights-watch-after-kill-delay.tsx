import React from 'react';
import { Trans } from '@lingui/macro';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';

export function LowlightsWatchAfterKillDelay() {
  const { lowlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      playback: {
        lowlights: {
          afterKillDelayInSeconds: seconds,
        },
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
