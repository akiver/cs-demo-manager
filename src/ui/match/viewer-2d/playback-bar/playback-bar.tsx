import React from 'react';
import { Timeline } from './timeline';
import { PlayPauseButton } from './play-pause-button';
import { SpeedButton } from './speed-button';
import { FullscreenButton } from './fullscreen-button';
import { NextRoundButton } from './next-round-button';
import { PreviousRoundButton } from './previous-round-button';
import { RadarLevelButton } from './radar-level-button';
import { AudioButton } from './audio-button';
import { AudioSelectorButton } from './audio-selector-button';
import { useViewerContext } from '../use-viewer-context';
import { DocumentationLink } from 'csdm/ui/components/links/documentation-link';

export function PlaybackBar() {
  const { loadAudioFile, audioBytes } = useViewerContext();

  return (
    <div className="flex relative h-40 cursor-pointer">
      <PlayPauseButton />
      <PreviousRoundButton />
      <NextRoundButton />
      <SpeedButton />
      {audioBytes.length > 0 ? <AudioButton /> : <AudioSelectorButton loadAudioFile={loadAudioFile} />}
      <Timeline />
      <RadarLevelButton />
      <FullscreenButton />
      <div className="flex items-center px-8">
        <DocumentationLink url="https://cs-demo-manager.com/docs/guides/2d-viewer" />
      </div>
    </div>
  );
}
