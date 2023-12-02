import React from 'react';
import { SoftwareBrowseButton } from 'csdm/ui/match/video/software-browse-button';
import { useIsFfmpegInstalled } from './use-is-ffmpeg-installed';

export function FfmpegBrowseButton() {
  const isFfmpegInstalled = useIsFfmpegInstalled();

  return (
    <SoftwareBrowseButton
      getApplicationFolderPath={window.csdm.getFfmpegExecutablePath}
      isDisabled={!isFfmpegInstalled}
    />
  );
}
