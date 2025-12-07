import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ThirdPartySettings } from './third-party-settings';
import { ThirdPartyAccounts } from './third-party-accounts';
import { useRenownAccounts } from 'csdm/ui/downloads/renown/use-renown-accounts';
import { useAddRenownAccount } from './use-add-renown-account';
import { accountsUpdated } from 'csdm/ui/downloads/renown/renown-actions';
import { useUpdateCurrentRenownAccount } from 'csdm/ui/downloads/renown/use-update-current-renown-account';
import { RenownLogo } from 'csdm/ui/logos/renown-logo';

function AddAccountDialog() {
  const [steamId, setSteamId] = useState('');
  const { addAccount, errorMessage, isBusy } = useAddRenownAccount();
  const { hideDialog } = useDialog();
  const { t } = useLingui();

  const onConfirm = async () => {
    const accountAdded = await addAccount(steamId);
    if (accountAdded) {
      hideDialog();
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Add Renown account</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
      isBusy={isBusy}
    >
      <TextInput
        label={t({
          context: 'Input label',
          message: 'Steam ID64',
        })}
        placeholder={t({
          context: 'Input placeholder',
          message: 'Steam ID64 (e.g. 76561198000000000)',
        })}
        value={steamId}
        onChange={(event) => {
          setSteamId(event.target.value);
        }}
        isDisabled={isBusy}
        onEnterKeyDown={onConfirm}
        autoFocus={true}
      />

      {errorMessage && (
        <div className="mt-8">
          <ErrorMessage message={errorMessage} />
        </div>
      )}
    </ConfirmDialog>
  );
}

export function RenownSettings() {
  const showToast = useShowToast();
  const accounts = useRenownAccounts();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateCurrentAccount = useUpdateCurrentRenownAccount();
  const { showDialog } = useDialog();

  const deleteAccount = async (steamId: string) => {
    try {
      const accounts = await client.send({
        name: RendererClientMessageName.DeleteRenownAccount,
        payload: steamId,
      });
      dispatch(accountsUpdated({ accounts }));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'delete-renown-account-error',
        type: 'error',
      });
    }
  };

  return (
    <ThirdPartySettings
      name="Renown"
      logo={<RenownLogo className="-mt-4 h-20" />}
      autoDownloadAtStartupSettingsKey="downloadRenownDemosAtStartup"
      autoDownloadInBackgroundSettingsKey="downloadRenownDemosInBackground"
    >
      <ThirdPartyAccounts
        accounts={accounts}
        getAccountUrl={(account) => {
          return `https://renown.gg/profile/${account.id}`;
        }}
        onSetAsCurrentClick={updateCurrentAccount}
        onDeleteClick={deleteAccount}
        onAddClick={() => {
          showDialog(<AddAccountDialog />);
        }}
      />
    </ThirdPartySettings>
  );
}
