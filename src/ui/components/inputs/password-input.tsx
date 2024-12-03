import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';

type Props = {
  password: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function PasswordInput({ password, onChange, isDisabled = true }: Props) {
  const { t } = useLingui();

  return (
    <TextInput
      label={<Trans context="Input label">Password</Trans>}
      value={password}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Password',
      })}
      onChange={onChange}
      isDisabled={isDisabled}
      type="password"
    />
  );
}
