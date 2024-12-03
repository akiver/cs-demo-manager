import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

type Props = {
  username: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function UsernameInput({ username, onChange, isDisabled = true }: Props) {
  const { t } = useLingui();

  return (
    <TextInput
      label={<Trans context="Input label">Username</Trans>}
      value={username}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Username',
      })}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
}
