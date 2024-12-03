import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function FfmpegOutputParametersInput() {
  const { settings, updateSettings } = useVideoSettings();

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const outputParameters = event.target.value;
    if (outputParameters !== settings.ffmpegSettings.outputParameters) {
      updateSettings({
        ffmpegSettings: {
          outputParameters,
        },
      });
    }
  };

  return (
    <TextInput
      key={settings.ffmpegSettings.outputParameters}
      label={<Trans context="Input label">Output parameters</Trans>}
      onBlur={onBlur}
      defaultValue={settings.ffmpegSettings.outputParameters}
    />
  );
}
