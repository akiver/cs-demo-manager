import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';

type Props = {
  port: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function PortInput({ port, onChange, isDisabled = true }: Props) {
  const { t } = useLingui();
  const maxPortNumber = 65_535;

  return (
    <InputNumber
      label={<Trans context="Input label">Port</Trans>}
      defaultValue={String(port)}
      onChange={onChange}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Port',
      })}
      isDisabled={isDisabled}
      max={maxPortNumber}
    />
  );
}
