import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { useAdd5EPlayAcount } from 'csdm/ui/settings/downloads/use-add-5eplay-account';
import { FiveEPlayAccountInstructions } from './five-eplay-account-instructions';

export function No5EPlayAccount() {
  const { t } = useLingui();
  const [domainId, setDomainId] = useState('');
  const { add5EPlayAccount, errorMessage, isBusy } = useAdd5EPlayAcount();

  const submit = () => {
    add5EPlayAccount(domainId);
  };

  const isDisabled = isBusy || domainId === '';

  return (
    <div className="flex flex-col mt-48 mx-auto">
      <p className="text-body-strong">
        <Trans>To add a 5EPlay account, enter your 5EPlay ID.</Trans>
      </p>
      <div className="w-[228px] mt-8">
        <TextInput
          placeholder={t({ message: '5EPlay ID', context: 'Input placeholder' })}
          onChange={(event) => {
            setDomainId(event.target.value);
          }}
          autoFocus={true}
          value={domainId}
          isDisabled={isBusy}
          onEnterKeyDown={submit}
        />
      </div>

      <div className="my-8">
        <Button variant={ButtonVariant.Primary} onClick={submit} isDisabled={isDisabled}>
          <Trans context="Button">Add</Trans>
        </Button>
      </div>
      {errorMessage && <ErrorMessage message={errorMessage} />}

      <FiveEPlayAccountInstructions />
    </div>
  );
}
