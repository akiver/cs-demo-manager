import React from 'react';
import { Trans } from '@lingui/macro';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';

export function HighlightsWatchAfterKillDelay() {
  const { highlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      playback: {
        highlights: {
          afterKillDelayInSeconds: seconds,
        },
      },
    });
  };

  return (
    <WatchBeforeKillDelay
      title={<Trans context="Settings title">After kill delay (highlights)</Trans>}
      description={<Trans>How many seconds to wait before skipping to the next kill when watching highlights</Trans>}
      defaultValue={highlights.afterKillDelayInSeconds}
      onChange={onChange}
    />
  );
}
