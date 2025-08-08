import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchBeforeKillDelay } from './watch-before-kill-delay';
import { usePlaybackSettings } from './use-playback-settings';

export function HighlightsWatchAfterKillDelay() {
  const { highlights, updateSettings } = usePlaybackSettings();

  const onChange = async (seconds: number) => {
    await updateSettings({
      highlights: {
        afterKillDelayInSeconds: seconds,
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
