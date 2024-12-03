import React, { useRef, useState, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { Status } from 'csdm/common/types/status';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { steamAccountNameUpdated } from 'csdm/ui/player/player-actions';
import { UpdateButton } from 'csdm/ui/components/buttons/update-button';

type Props = {
  steamId: string;
  name: string;
};

export function UpdatePlayerNameDialog({ steamId, name }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();

  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [error, setError] = useState<ReactNode>('');
  const isUpdating = status === Status.Loading;

  const onSubmit = async () => {
    const form = formRef.current;
    if (isUpdating || !form) {
      return;
    }

    try {
      const formData = new FormData(form);
      const wantedName = formData.get('name') as string;
      if (wantedName === name) {
        hideDialog();
        return;
      }

      setStatus(Status.Loading);

      const newName = await client.send({
        name: RendererClientMessageName.UpdateSteamAccountName,
        payload: {
          steamId,
          name: wantedName,
        },
      });

      dispatch(
        steamAccountNameUpdated({
          steamId,
          name: newName,
        }),
      );

      hideDialog();
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      let errorMessage: ReactNode;
      switch (errorCode) {
        case ErrorCode.SteamAccountNameTooLong:
          errorMessage = <Trans>The name is too long</Trans>;
          break;
        default:
          errorMessage = <Trans>An error occurred.</Trans>;
          break;
      }
      setError(errorMessage);
      setStatus(Status.Error);
    }
  };

  return (
    <Dialog
      onEnterPressed={onSubmit}
      blockNavigation={isUpdating}
      closeOnBackgroundClicked={!isUpdating}
      closeOnEscPressed={!isUpdating}
    >
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Update player name</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form id="player-form" ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-y-8 max-w-[524px]">
          <TextInput
            name="name"
            defaultValue={name}
            isDisabled={isUpdating}
            label={<Trans context="Input label">Name</Trans>}
          />

          <div className="flex items-center gap-x-8 mt-8">
            <ExclamationTriangleIcon className="size-24 text-orange-700" />
            <p>
              <Trans>
                It will override the name of the player identified by his Steam ID every place in the application.
              </Trans>
            </p>
          </div>
          <p>
            <Trans>Leave it empty to remove the override.</Trans>
          </p>
          {status === Status.Error && <ErrorMessage message={error} />}
        </form>
      </DialogContent>
      <DialogFooter>
        <UpdateButton type="submit" form="player-name" onClick={onSubmit} />
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
