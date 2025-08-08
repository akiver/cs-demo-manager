import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { usePlaybackSettings } from './use-playback-settings';

export function HighlightsWatchBeforeKillDelay() {
  const { highlights } = usePlaybackSettings();
  const { updateSettings } = usePlaybackSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      highlights: {
        beforeKillDelayInSeconds: seconds,
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
