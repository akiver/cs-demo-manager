import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ConfirmDialog } from './confirm-dialog';
import { Status } from 'csdm/common/types/status';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import type { UpdatePlayerSpectateKeyPayload } from 'csdm/server/handlers/renderer-process/match/update-player-spectate-key-handler';
import { playerSpectateKeyUpdated } from 'csdm/ui/match/match-actions';
import { PlayerSpectateKeySelect } from '../components/inputs/select/player-spectate-key-select';

type Props = {
  playerId: string;
  defaultKey: number;
};

export function UpdatePlayerSpectateKeyDialog({ playerId, defaultKey }: Props) {
  const client = useWebSocketClient();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();
  const showToast = useShowToast();
  const [key, setKey] = useState(defaultKey);

  const onConfirmClick = async () => {
    try {
      const payload: UpdatePlayerSpectateKeyPayload = {
        playerId,
        key,
      };
      await client.send({
        name: RendererClientMessageName.UpdatePlayerSpectateKey,
        payload,
      });
      setStatus(Status.Loading);

      dispatch(
        playerSpectateKeyUpdated({
          id: playerId,
          key,
        }),
      );
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'update-player-spectate-key',
        type: 'error',
      });
    } finally {
      hideDialog();
    }
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Update player's spectate key</Trans>}
      onConfirm={onConfirmClick}
      isBusy={status === Status.Loading}
    >
      <div className="flex flex-col gap-y-8 max-w-[600px]">
        <p>
          <Trans>
            The player's spectate key corresponds to the keyboard key (0 to 9) used to focus the camera on the player
            during playback.
          </Trans>
        </p>
        <p>
          <Trans>
            To find the correct key, you have to watch the demo and press the number keys until the camera is on the
            player.
          </Trans>
        </p>
        <div className="flex items-center gap-x-4">
          <ExclamationTriangleIcon className="size-16 text-red-700 shrink-0" />
          <p>
            <Trans>
              Change it only if the camera doesn't focus on the correct player when watching highlights, generating a
              video with camera focus…
            </Trans>
          </p>
        </div>

        <div className="mt-4 mx-auto">
          <PlayerSpectateKeySelect
            value={key}
            onChange={(value) => {
              setKey(value);
            }}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
