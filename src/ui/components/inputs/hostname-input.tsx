import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  hostname: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function HostnameInput({ hostname, onChange, isDisabled = true }: Props) {
  const _ = useI18n();

  return (
    <TextInput
      label={<Trans context="Button">Hostname</Trans>}
      value={hostname}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Hostname',
        }),
      )}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
}
