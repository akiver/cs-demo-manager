import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

type Props = {
  hostname: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function HostnameInput({ hostname, onChange, isDisabled = true }: Props) {
  const { t } = useLingui();

  return (
    <TextInput
      label={<Trans context="Button">Hostname</Trans>}
      value={hostname}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Hostname',
      })}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
}
