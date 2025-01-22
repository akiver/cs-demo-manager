import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useHlaeSettings } from 'csdm/ui/settings/video/hlae/use-hlae-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function HlaeParameters() {
  const { hlaeSettings, updateHlaeSettings } = useHlaeSettings();
  const [parameters, setParameters] = useState<string | undefined>(() => {
    return hlaeSettings.parameters;
  });

  const onBlur = () => {
    updateHlaeSettings({
      parameters,
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
