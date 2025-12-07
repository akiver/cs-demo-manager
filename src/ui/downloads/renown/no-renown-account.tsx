import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { useAddRenownAccount } from 'csdm/ui/settings/downloads/use-add-renown-account';

export function NoRenownAccount() {
  const { t } = useLingui();
  const [steamId, setSteamId] = useState('');
  const { addAccount, errorMessage, isBusy } = useAddRenownAccount();

  const submit = () => {
    addAccount(steamId);
  };

  const isDisabled = isBusy || steamId === '';

  return (
    <div className="mx-auto mt-48 flex max-w-[600px] flex-col">
      <p className="text-body-strong">
        <Trans>No Renown account configured yet. Enter your Steam ID to get started.</Trans>
      </p>
      <div className="mt-8 flex flex-col gap-y-4">
        <TextInput
          placeholder={t({ message: 'Steam ID', context: 'Input placeholder' })}
          onChange={(event) => {
            setSteamId(event.target.value);
          }}
          autoFocus={true}
          value={steamId}
          isDisabled={isBusy}
          onEnterKeyDown={submit}
        />
        <p className="text-caption">
          <Trans>Use the 64-bit version of your Steam ID (e.g., 76561198000000000).</Trans>
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
