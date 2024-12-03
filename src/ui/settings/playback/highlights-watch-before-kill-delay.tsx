import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWatchSettings } from './use-watch-settings';
import { useUpdateSettings } from '../use-update-settings';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';

export function HighlightsWatchBeforeKillDelay() {
  const { highlights } = useWatchSettings();
  const updateSettings = useUpdateSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      playback: {
        highlights: {
          beforeKillDelayInSeconds: seconds,
        },
      },
    });
  };

  return (
    <WatchBeforeKillDelay
      title={<Trans context="Settings title">Before kill delay (highlights)</Trans>}
      description={<Trans>How many seconds to start before a kill when watching highlights</Trans>}
      defaultValue={highlights.beforeKillDelayInSeconds}
      onChange={onChange}
    />
  );
}
