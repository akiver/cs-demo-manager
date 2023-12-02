import React from 'react';
import { Trans } from '@lingui/macro';
import {
  DEFAULT_AUDIO_CODEC,
  DEFAULT_DEATH_NOTICES_DURATION,
  DEFAULT_ENCODER_SOFTWARE,
  DEFAULT_FFMPEG_AUDIO_BITRATE,
  DEFAULT_FFMPEG_CONSTANT_RATE_FACTOR,
  DEFAULT_FRAMERATE,
  DEFAULT_HEIGHT_RESOLUTION,
  DEFAULT_VIDEO_CODEC,
  DEFAULT_WIDTH_RESOLUTION,
} from 'csdm/ui/settings/video/default-values';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Button } from 'csdm/ui/components/buttons/button';

export function ResetSettingsButton() {
  const { updateSettings } = useVideoSettings();
  const onClick = () => {
    updateSettings({
      closeGameAfterRecording: true,
      concatenateSequences: false,
      deleteRawFilesAfterEncoding: true,
      showOnlyDeathNotices: true,
      deathNoticesDuration: DEFAULT_DEATH_NOTICES_DURATION,
      encoderSoftware: DEFAULT_ENCODER_SOFTWARE,
      ffmpegSettings: {
        audioBitrate: DEFAULT_FFMPEG_AUDIO_BITRATE,
        constantRateFactor: DEFAULT_FFMPEG_CONSTANT_RATE_FACTOR,
        videoCodec: DEFAULT_VIDEO_CODEC,
        audioCodec: DEFAULT_AUDIO_CODEC,
        inputParameters: '',
        outputParameters: '',
      },
      framerate: DEFAULT_FRAMERATE,
      generateOnlyRawFiles: false,
      height: DEFAULT_HEIGHT_RESOLUTION,
      width: DEFAULT_WIDTH_RESOLUTION,
    });
  };
  return (
    <Button onClick={onClick}>
      <Trans context="Button">Reset settings</Trans>
    </Button>
  );
}
