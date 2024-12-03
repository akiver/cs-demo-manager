import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function HlaeParameters() {
  const { settings, updateSettings } = useVideoSettings();
  const [parameters, setParameters] = useState<string | undefined>(() => {
    return settings.hlae.parameters;
  });

  const onBlur = () => {
    updateSettings({
      hlae: {
        parameters,
      },
    });
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParameters(event.target.value);
  };

  return (
    <TextInput
      label={<Trans context="Input label">Parameters</Trans>}
      onChange={onChange}
      onBlur={onBlur}
      value={parameters}
    />
  );
}
