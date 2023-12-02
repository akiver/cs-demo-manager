import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  port: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function PortInput({ port, onChange, isDisabled = true }: Props) {
  const _ = useI18n();
  const maxPortNumber = 65_535;

  return (
    <InputNumber
      id="port-input"
      label={<Trans context="Input label">Port</Trans>}
      defaultValue={String(port)}
      onChange={onChange}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Port',
        }),
      )}
      isDisabled={isDisabled}
      max={maxPortNumber}
    />
  );
}
