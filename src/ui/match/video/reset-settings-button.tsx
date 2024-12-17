import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Button } from 'csdm/ui/components/buttons/button';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function ResetSettingsButton() {
  const { updateSettings } = useVideoSettings();
  const onClick = () => {
    const {
      closeGameAfterRecording,
      concatenateSequences,
      deleteRawFilesAfterEncoding,
      deathNoticesDuration,
      encoderSoftware,
      ffmpegSettings,
      framerate,
      generateOnlyRawFiles,
      height,
      width,
    } = defaultSettings.video;
    updateSettings({
      closeGameAfterRecording,
      concatenateSequences,
      deleteRawFilesAfterEncoding,
      deathNoticesDuration,
      encoderSoftware,
      ffmpegSettings: {
        audioBitrate: ffmpegSettings.audioBitrate,
        constantRateFactor: ffmpegSettings.constantRateFactor,
        videoCodec: ffmpegSettings.videoCodec,
        audioCodec: ffmpegSettings.audioCodec,
        inputParameters: ffmpegSettings.inputParameters,
        outputParameters: ffmpegSettings.outputParameters,
        videoContainer: ffmpegSettings.videoContainer,
      },
      framerate,
      generateOnlyRawFiles,
      height,
      width,
    });
  };
  return (
    <Button onClick={onClick}>
      <Trans context="Button">Reset settings</Trans>
    </Button>
  );
}
