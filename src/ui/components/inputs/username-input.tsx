import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  username: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
};

export function UsernameInput({ username, onChange, isDisabled = true }: Props) {
  const _ = useI18n();

  return (
    <TextInput
      id="username-input"
      label={<Trans context="Input label">Username</Trans>}
      value={username}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Username',
        }),
      )}
      onChange={onChange}
      isDisabled={isDisabled}
    />
  );
}
