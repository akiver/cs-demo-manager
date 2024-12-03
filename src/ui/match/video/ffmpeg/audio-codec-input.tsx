import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function AudioCodecInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const newAudioCodec = event.target.value.trim();
    if (newAudioCodec === '') {
      event.target.value = defaultSettings.video.ffmpegSettings.audioCodec;
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
      onBlur={onBlur}
      defaultValue={settings.ffmpegSettings.audioCodec}
    />
  );
}
