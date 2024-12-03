import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function FfmpegInputParametersInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const inputParameters = event.target.value;
    if (inputParameters !== settings.ffmpegSettings.inputParameters) {
      updateSettings({
        ffmpegSettings: {
          inputParameters,
        },
      });
    }
  };

  return (
    <TextInput
      key={settings.ffmpegSettings.inputParameters}
      label={<Trans context="Input label">Input parameters</Trans>}
      onBlur={onBlur}
      defaultValue={settings.ffmpegSettings.inputParameters}
    />
  );
}
