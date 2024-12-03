import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { accountsUpdated } from 'csdm/ui/downloads/faceit/faceit-actions';
import { useFaceitAccounts } from 'csdm/ui/downloads/faceit/use-faceit-accounts';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { DeleteButton } from 'csdm/ui/components/buttons/delete-button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useUpdateCurrentFaceitAccount } from 'csdm/ui/downloads/faceit/use-update-current-faceit-account';
import { useAddFaceitAcount } from './use-add-faceit-account';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ErrorMessage } from 'csdm/ui/components/error-message';

function AddAccountDialog() {
  const [nickname, setNickname] = useState('');
  const { addFaceitAccount, errorMessage, isBusy } = useAddFaceitAcount();
  const { hideDialog } = useDialog();
  const { t } = useLingui();

  const onConfirm = async () => {
    const accountAdded = await addFaceitAccount(nickname);
    if (accountAdded) {
      hideDialog();
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Add FACEIT account</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
      isBusy={isBusy}
    >
      <TextInput
        label={t({
          context: 'Input label',
          message: 'FACEIT nickname',
        })}
        placeholder={t({
          context: 'Input placeholder',
          message: 'Nickname',
        })}
        value={nickname}
        onChange={(event) => {
          setNickname(event.target.value);
        }}
        isDisabled={isBusy}
        onEnterKeyDown={onConfirm}
        autoFocus={true}
      />
      <div className="flex items-center gap-x-4 mt-4">
        <ExclamationTriangleIcon className="size-12 text-orange-700" />
        <p className="text-caption">
          <Trans>The nickname is case sensitive!</Trans>
        </p>
      </div>
      {errorMessage && (
        <div className="mt-8">
          <ErrorMessage message={errorMessage} />
        </div>
      )}
    </ConfirmDialog>
  );
}

export function FaceitAccounts() {
  const showToast = useShowToast();
  const accounts: FaceitAccount[] = useFaceitAccounts();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateCurrentFaceitAccount = useUpdateCurrentFaceitAccount();
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
          name: RendererClientMessageName.DeleteFaceitAccount,
          payload: accountId,
        });
        dispatch(accountsUpdated({ accounts }));
      } catch (error) {
        showToast({
          content: <Trans>An error occurred</Trans>,
          id: 'delete-faceit-account-error',
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
            href={`https://www.faceit.com/en/players/${account.nickname}`}
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
                await updateCurrentFaceitAccount(account.id);
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
