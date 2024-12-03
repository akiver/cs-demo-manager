import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { deleteMatchesSuccess } from 'csdm/ui/matches/matches-actions';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from '../error-message';

type Props = {
  onDeleteSuccess?: (deletedChecksums: string[]) => void;
  checksums: string[];
};

export function DeleteMatchesDialog({ onDeleteSuccess, checksums }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const { hideDialog } = useDialog();

  const onConfirm = async () => {
    try {
      setStatus(Status.Loading);
      await client.send({
        name: RendererClientMessageName.DeleteMatches,
        payload: checksums,
      });
      dispatch(deleteMatchesSuccess({ deletedChecksums: checksums }));
      if (typeof onDeleteSuccess === 'function') {
        onDeleteSuccess(checksums);
      }
      hideDialog();
    } catch (error) {
      setStatus(Status.Error);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Delete matches</Trans>}
      onConfirm={onConfirm}
      isBusy={status === Status.Loading}
      confirmButtonVariant={ButtonVariant.Danger}
      closeOnConfirm={false}
    >
      <div className="flex flex-col gap-y-8 max-w-[500px]">
        <ErrorMessage
          message={plural(checksums.length, {
            one: 'The match will be deleted only from the database not your filesystem.',
            other: 'These matches will be deleted only from the database not your filesystem.',
          })}
        />
        {status === Status.Error && <ErrorMessage message={<Trans>An error occurred</Trans>} />}
      </div>
    </ConfirmDialog>
  );
}
