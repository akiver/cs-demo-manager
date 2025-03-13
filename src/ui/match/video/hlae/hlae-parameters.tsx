import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useHlaeSettings } from 'csdm/ui/settings/video/hlae/use-hlae-settings';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

export function HlaeParameters() {
  const { hlaeSettings, updateHlaeSettings } = useHlaeSettings();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateHlaeSettings({
      parameters: event.target.value,
    });
  };

  return (
    <TextInput
      label={<Trans context="Input label">Parameters</Trans>}
      onChange={onChange}
      value={hlaeSettings.parameters ?? ''}
    />
  );
}
