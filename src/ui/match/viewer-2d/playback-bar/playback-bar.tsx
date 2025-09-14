import React from 'react';
import { Timeline } from './timeline';
import { PlayPauseButton } from './play-pause-button';
import { SpeedButton } from './speed-button';
import { FullscreenButton } from './fullscreen-button';
import { NextRoundButton } from './next-round-button';
import { PreviousRoundButton } from './previous-round-button';
import { LowerRadarButton } from './lower-radar-button';
import { AudioButton } from './audio-button';
import { AudioSelectorButton } from './audio-selector-button';
import { useViewerContext } from '../use-viewer-context';
import { DocumentationLink } from 'csdm/ui/components/links/documentation-link';
import { DrawingButton } from './drawing-button';
import type { DrawableCanvas } from '../drawing/use-drawable-canvas';

type Props = {
  drawing: DrawableCanvas;
};

export function PlaybackBar({ drawing }: Props) {
  const { loadAudioFile, audioBytes } = useViewerContext();

  return (
    <div className="relative flex h-40 cursor-pointer">
      <PlayPauseButton />
      <PreviousRoundButton />
      <NextRoundButton />
      <SpeedButton />
      {audioBytes.length > 0 ? <AudioButton /> : <AudioSelectorButton loadAudioFile={loadAudioFile} />}
      <Timeline />
      <DrawingButton drawing={drawing} />
      <LowerRadarButton />
      <FullscreenButton />
      <div className="flex items-center px-8">
        <DocumentationLink url="https://cs-demo-manager.com/docs/guides/2d-viewer" />
      </div>
    </div>
  );
}
