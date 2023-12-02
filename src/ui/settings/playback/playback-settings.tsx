import React from 'react';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { LaunchParameters } from './launch-parameters';
import { CustomHighlights } from './custom-highlights';
import { GameFullscreen } from './game-fullscreen';
import { GameHeight } from './game-height';
import { GameWidth } from './game-width';
import { HighlightsWatchBeforeKillDelay } from './highlights-watch-before-kill-delay';
import { HighlightsWatchAfterKillDelay } from './highlights-watch-after-kill-delay';
import { LowlightsWatchBeforeKillDelay } from './lowlights-watch-before-kill-delay';
import { LowlightsWatchAfterKillDelay } from './lowlights-watch-after-kill-delay';
import { CustomLowlights } from './custom-lowlights';

export function PlaybackSettings() {
  return (
    <SettingsView>
      <GameWidth />
      <GameHeight />
      <GameFullscreen />
      <LaunchParameters />
      <CustomHighlights />
      <HighlightsWatchBeforeKillDelay />
      <HighlightsWatchAfterKillDelay />
      <CustomLowlights />
      <LowlightsWatchBeforeKillDelay />
      <LowlightsWatchAfterKillDelay />
    </SettingsView>
  );
}
