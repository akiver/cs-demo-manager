import React, { useState } from 'react';
import { plural } from '@lingui/core/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { Status } from 'csdm/common/types/status';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { demosDeleted } from 'csdm/ui/demos/demos-actions';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ButtonVariant } from '../buttons/button';
import { ErrorMessage } from '../error-message';

type Props = {
  checksums: string[];
};

export function DeleteDemosFromDatabaseDialog({ checksums }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const { hideDialog } = useDialog();

  const onConfirmClick = async () => {
    setStatus(Status.Loading);
    await client.send({
      name: RendererClientMessageName.DeleteDemosFromDatabase,
      payload: checksums,
    });

    dispatch(demosDeleted({ checksums }));
    hideDialog();
  };

  return (
    <ConfirmDialog
      title={plural(checksums.length, {
        one: 'Delete demo',
        other: 'Delete demos',
      })}
      onConfirm={onConfirmClick}
      isBusy={status === Status.Loading}
      closeOnConfirm={false}
      confirmButtonVariant={ButtonVariant.Danger}
    >
      <div className="max-w-[500px]">
        <ErrorMessage
          message={plural(checksums.length, {
            one: 'The demo will be deleted from the database, not your filesystem.',
            other: 'The demos will be deleted only from the database, not your filesystem.',
          })}
        />
      </div>
    </ConfirmDialog>
  );
}
