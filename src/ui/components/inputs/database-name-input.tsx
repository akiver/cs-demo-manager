import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

type Props = {
  databaseName: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function DatabaseNameInput({ databaseName, onChange, isDisabled = true }: Props) {
  const { t } = useLingui();

  return (
    <TextInput
      label={<Trans context="Input label">Name</Trans>}
      value={databaseName}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Name',
      })}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
}
