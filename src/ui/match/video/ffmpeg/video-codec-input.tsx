import React from 'react';
import { Trans } from '@lingui/macro';
import { DEFAULT_VIDEO_CODEC } from 'csdm/ui/settings/video/default-values';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function VideoCodecInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const newVideoCodec = event.target.value.trim();
    if (newVideoCodec === '') {
      event.target.value = DEFAULT_VIDEO_CODEC;
    } else if (newVideoCodec !== settings.ffmpegSettings.videoCodec) {
      updateSettings({
        ffmpegSettings: {
          videoCodec: newVideoCodec,
        },
      });
    }
  };

  return (
    <TextInput
      key={settings.ffmpegSettings.videoCodec}
      label={<Trans context="Input label">Video codec</Trans>}
      id="ffmpeg-video-codec"
      onBlur={onBlur}
      defaultValue={settings.ffmpegSettings.videoCodec}
    />
  );
}
