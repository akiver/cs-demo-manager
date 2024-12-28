import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { DeleteButton } from 'csdm/ui/components/buttons/delete-button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { use5EPlayAccounts } from 'csdm/ui/downloads/five-eplay/use-5eplay-accounts';
import { useUpdateCurrent5EPlayAccount } from 'csdm/ui/downloads/five-eplay/use-update-current-5eplay-account';
import { FiveEPlayAccountInstructions } from 'csdm/ui/downloads/five-eplay/five-eplay-account-instructions';
import { useAdd5EPlayAcount } from './use-add-5eplay-account';
import { accountsUpdated } from 'csdm/ui/downloads/five-eplay/5eplay-actions';

function AddAccountDialog() {
  const [domainId, setDomainId] = useState('');
  const { add5EPlayAccount, errorMessage, isBusy } = useAdd5EPlayAcount();
  const { hideDialog } = useDialog();
  const { t } = useLingui();

  const onConfirm = async () => {
    const accountAdded = await add5EPlayAccount(domainId);
    if (accountAdded) {
      hideDialog();
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Add 5EPlay account</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
      isBusy={isBusy}
    >
      <TextInput
        label={t({
          context: 'Input label',
          message: '5EPlay ID',
        })}
        placeholder={t({
          context: 'Input placeholder',
          message: 'ID',
        })}
        value={domainId}
        onChange={(event) => {
          setDomainId(event.target.value);
        }}
        isDisabled={isBusy}
        onEnterKeyDown={onConfirm}
        autoFocus={true}
      />
      <div className="mt-8">
        <FiveEPlayAccountInstructions />
      </div>

      {errorMessage && (
        <div className="mt-8">
          <ErrorMessage message={errorMessage} />
        </div>
      )}
    </ConfirmDialog>
  );
}

export function FiveEPlayAccounts() {
  const showToast = useShowToast();
  const accounts = use5EPlayAccounts();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateCurrentAccount = useUpdateCurrent5EPlayAccount();
  const { showDialog } = useDialog();

  function renderAccounts() {
    if (accounts.length === 0) {
      return (
        <p>
          <Trans>No accounts</Trans>
        </p>
      );
    }

    const deleteAccount = async (accountId: string) => {
      try {
        const accounts = await client.send({
          name: RendererClientMessageName.Delete5EPlayAccount,
          payload: accountId,
        });
        dispatch(accountsUpdated({ accounts }));
      } catch (error) {
        showToast({
          content: <Trans>An error occurred</Trans>,
          id: 'delete-5eplay-account-error',
          type: 'error',
        });
      }
    };

    return accounts.map((account) => {
      const avatarSrc = account.avatarUrl === '' ? window.csdm.getDefaultPlayerAvatar() : account.avatarUrl;

      return (
        <div className="flex p-8 border-gray-300 border-t first:border-t-0 w-fit" key={account.id}>
          <a
            className="flex items-center w-[224px] gap-x-4 mr-8"
            href={`https://arena.5eplay.com/data/player/${account.domainId}`}
            target="_blank"
            rel="noreferrer"
          >
            <img className="w-32" src={avatarSrc} />
            <p className="truncate" title={account.nickname}>
              {account.nickname}
            </p>
          </a>
          <div className="flex items-center gap-x-8">
            <Button
              onClick={async () => {
                await updateCurrentAccount(account.id);
              }}
              isDisabled={account.isCurrent}
            >
              <Trans>Set as current account</Trans>
            </Button>
            <DeleteButton
              onClick={async () => {
                await deleteAccount(account.id);
              }}
            />
          </div>
        </div>
      );
    });
  }

  return (
    <div>
      <div className="flex items-center gap-x-16 my-12">
        <p className="text-body-strong">
          <Trans>Accounts</Trans>
        </p>
        <Button
          variant={ButtonVariant.Primary}
          onClick={() => {
            showDialog(<AddAccountDialog />);
          }}
        >
          <Trans context="Button">Add account</Trans>
        </Button>
      </div>

      <div className="flex flex-col gap-y-4">{renderAccounts()}</div>
    </div>
  );
}
