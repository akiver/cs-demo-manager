import React from 'react';
import { Trans } from '@lingui/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { DeleteButton } from 'csdm/ui/components/buttons/delete-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { deleteIgnoredSteamAccountSuccess } from 'csdm/ui/ban/ban-actions';
import { useIgnoredSteamAccounts } from 'csdm/ui/ban/use-ignored-steam-accounts';
import { AddIgnoredSteamAccountDialog } from './add-ignored-steam-account-dialog';
import { buildPlayerSteamProfileUrl } from 'csdm/ui/shared/build-player-steam-profile-url';

export function IgnoredSteamAccounts() {
  const client = useWebSocketClient();
  const accounts = useIgnoredSteamAccounts();
  const { showDialog } = useDialog();
  const showToast = useShowToast();
  const dispatch = useDispatch();

  const onClick = () => {
    showDialog(<AddIgnoredSteamAccountDialog />);
  };

  return (
    <div>
      <h2 className="text-subtitle">
        <Trans context="Settings title">Ignored Steam accounts</Trans>
      </h2>
      <div className="my-8">
        <Button onClick={onClick} variant={ButtonVariant.Primary}>
          <Trans>Add Steam account</Trans>
        </Button>
      </div>
      <p>
        <Trans>The following Steam accounts will be ignored from VAC ban stats.</Trans>
      </p>
      {accounts.length > 0 ? (
        accounts.map((account) => {
          const onDeleteClick = async () => {
            try {
              await client.send({
                name: RendererClientMessageName.DeleteIgnoredSteamAccount,
                payload: account.steamId,
              });
              dispatch(
                deleteIgnoredSteamAccountSuccess({
                  account,
                }),
              );
            } catch (error) {
              showToast({
                content: <Trans>An error occurred</Trans>,
                type: 'error',
              });
            }
          };

          return (
            <div className="flex py-4 border-gray-300 border-t last:border-b w-fit" key={account.steamId}>
              <a
                className="flex items-center w-[384px] gap-x-8 mr-8"
                href={buildPlayerSteamProfileUrl(account.steamId)}
                target="_blank"
                rel="noreferrer"
              >
                <img className="w-32" src={account.avatar} />
                <p className="truncate" title={account.name}>
                  {account.name}
                </p>
              </a>
              <DeleteButton onClick={onDeleteClick} />
            </div>
          );
        })
      ) : (
        <p>
          <Trans>No ignored Steam account yet.</Trans>
        </p>
      )}
    </div>
  );
}
