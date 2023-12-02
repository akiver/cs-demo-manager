import React from 'react';
import { Trans } from '@lingui/macro';
import { DEFAULT_AUDIO_CODEC } from 'csdm/ui/settings/video/default-values';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function AudioCodecInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const newAudioCodec = event.target.value.trim();
    if (newAudioCodec === '') {
      event.target.value = DEFAULT_AUDIO_CODEC;
    } else if (newAudioCodec !== settings.ffmpegSettings.audioCodec) {
      updateSettings({
        ffmpegSettings: {
          audioCodec: newAudioCodec,
        },
      });
    }
  };

  return (
    <TextInput
      key={settings.ffmpegSettings.audioCodec}
      label={<Trans context="Input label">Audio codec</Trans>}
      id="ffmpeg-audio-codec"
      onBlur={onBlur}
      defaultValue={settings.ffmpegSettings.audioCodec}
    />
  );
}
