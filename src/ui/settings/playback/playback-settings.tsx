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
import { WatchRoundBeforeDelay } from './watch-round-before-delay';
import { WatchRoundAfterDelay } from './watch-round-after-delay';
import { UseHlae } from './use-hlae';
import { PlayerVoices } from './player-voices';

export function PlaybackSettings() {
  return (
    <SettingsView>
      <GameWidth />
      <GameHeight />
      <GameFullscreen />
      <LaunchParameters />
      <PlayerVoices />
      <CustomHighlights />
      <HighlightsWatchBeforeKillDelay />
      <HighlightsWatchAfterKillDelay />
      <CustomLowlights />
      <LowlightsWatchBeforeKillDelay />
      <LowlightsWatchAfterKillDelay />
      <WatchRoundBeforeDelay />
      <WatchRoundAfterDelay />
      {window.csdm.isWindows && <UseHlae />}
    </SettingsView>
  );
}
