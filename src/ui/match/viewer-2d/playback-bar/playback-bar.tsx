import React from 'react';
import { Timeline } from './timeline';
import { PlayPauseButton } from './play-pause-button';
import { VolumeButton } from './volume-button';
import { SpeedButton } from './speed-button';
import { FullscreenButton } from './fullscreen-button';
import { NextRoundButton } from './next-round-button';
import { PreviousRoundButton } from './previous-round-button';
import { RadarLevelButton } from './radar-level-button';

export function PlaybackBar() {
  return (
    <div className="flex relative h-40 cursor-pointer">
      <PlayPauseButton />
      <PreviousRoundButton />
      <NextRoundButton />
      <SpeedButton />
      <VolumeButton />
      <Timeline />
      <RadarLevelButton />
      <FullscreenButton />
    </div>
  );
}
