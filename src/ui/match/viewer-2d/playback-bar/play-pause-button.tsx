import React from 'react';
import { useViewerContext } from '../use-viewer-context';
import { PlaybackBarButton } from './playback-bar-button';
import { PauseIcon } from 'csdm/ui/icons/pause-icon';
import { PlayIcon } from 'csdm/ui/icons/play-icon';

export function PlayPauseButton() {
  const { isPlaying, setIsPlaying } = useViewerContext();
  const onClick = () => {
    setIsPlaying(!isPlaying);
  };

  return <PlaybackBarButton onClick={onClick}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</PlaybackBarButton>;
}
