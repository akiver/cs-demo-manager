import React, { useState } from 'react';
import { ThirdPartySettings } from './third-party-settings';
import { Trans, useLingui } from '@lingui/react/macro';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { accountsUpdated } from 'csdm/ui/downloads/faceit/faceit-actions';
import { useFaceitAccounts } from 'csdm/ui/downloads/faceit/use-faceit-accounts';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useUpdateCurrentFaceitAccount } from 'csdm/ui/downloads/faceit/use-update-current-faceit-account';
import { useAddFaceitAccount } from './use-add-faceit-account';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { FaceitDownloadsWarning } from './faceit-downloads-warning';
import { ThirdPartyAccounts } from './third-party-accounts';
import { FaceitLogo } from 'csdm/ui/logos/faceit-logo';

function AddAccountDialog() {
  const [nickname, setNickname] = useState('');
  const { addFaceitAccount, errorMessage, isBusy } = useAddFaceitAccount();
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
      <div className="mt-4 flex items-center gap-x-4">
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

export function FaceitSettings() {
  const showToast = useShowToast();
  const accounts: FaceitAccount[] = useFaceitAccounts();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateCurrentAccount = useUpdateCurrentFaceitAccount();
  const { showDialog } = useDialog();

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

  return (
    <ThirdPartySettings
      name="FACEIT"
      logo={<FaceitLogo className="-mt-4 h-20" />}
      autoDownloadAtStartupSettingsKey="downloadFaceitDemosAtStartup"
      autoDownloadInBackgroundSettingsKey="downloadFaceitDemosInBackground"
      warning={<FaceitDownloadsWarning />}
    >
      <ThirdPartyAccounts
        accounts={accounts}
        getAccountUrl={(account) => {
          return `https://www.faceit.com/en/players/${account.nickname}`;
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
