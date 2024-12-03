import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useAddFaceitAcount } from '../../settings/downloads/use-add-faceit-account';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';

export function NoFaceitAccount() {
  const { t } = useLingui();
  const [nickname, setNickname] = useState('');
  const { addFaceitAccount, errorMessage, isBusy } = useAddFaceitAcount();

  const submit = () => {
    addFaceitAccount(nickname);
  };

  const isDisabled = isBusy || nickname === '';

  return (
    <div className="flex flex-col mt-48 mx-auto max-w-[600px]">
      <p className="text-body-strong">
        <Trans>To add a FACEIT account, enter your FACEIT nickname.</Trans>
      </p>
      <div className="w-[228px] mt-8">
        <TextInput
          placeholder={t({ message: 'FACEIT nickname', context: 'Input placeholder' })}
          onChange={(event) => {
            setNickname(event.target.value);
          }}
          autoFocus={true}
          value={nickname}
          isDisabled={isBusy}
          onEnterKeyDown={submit}
        />
      </div>
      <div className="flex items-center gap-x-8 mt-4">
        <ExclamationTriangleIcon className="size-12 text-orange-700" />
        <p className="text-caption">
          <Trans>The nickname is case sensitive!</Trans>
        </p>
      </div>
      <div className="my-8">
        <Button variant={ButtonVariant.Primary} onClick={submit} isDisabled={isDisabled}>
          <Trans context="Button">Add</Trans>
        </Button>
      </div>
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </div>
  );
}
