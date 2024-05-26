import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  databaseName: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function DatabaseNameInput({ databaseName, onChange, isDisabled = true }: Props) {
  const _ = useI18n();

  return (
    <TextInput
      label={<Trans context="Input label">Name</Trans>}
      value={databaseName}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Name',
        }),
      )}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
}
