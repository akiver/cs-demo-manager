import React, { useState } from 'react';
import { plural } from '@lingui/core/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { Status } from 'csdm/common/types/status';
import type { Demo } from 'csdm/common/types/demo';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { deleteDemosSuccess } from 'csdm/ui/demos/demos-actions';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ButtonVariant } from '../buttons/button';
import { useShowToast } from '../toasts/use-show-toast';
import { ErrorMessage } from '../error-message';

type Props = {
  demos: Demo[];
};

export function DeleteDemosDialog({ demos }: Props) {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const { hideDialog } = useDialog();

  const onConfirmClick = async () => {
    setStatus(Status.Loading);
    const { deletedDemos, notDeletedDemos } = await client.send({
      name: RendererClientMessageName.DeleteDemos,
      payload: demos,
    });
    if (deletedDemos.length > 0) {
      showToast({
        content: plural(deletedDemos.length, {
          one: 'The demo has been deleted.',
          other: '# demos deleted.',
        }),
        id: `delete-demos-success-${Date.now()}`,
        type: 'success',
      });
    }
    if (notDeletedDemos.length > 0) {
      showToast({
        content: plural(notDeletedDemos.length, {
          one: 'The demo has not been deleted.',
          other: '# demos have not been deleted.',
        }),
        id: `delete-demos-error-${Date.now()}`,
        type: 'error',
      });
    }

    dispatch(deleteDemosSuccess(deletedDemos.map((demo) => demo.filePath)));
    hideDialog();
  };

  return (
    <ConfirmDialog
      title={plural(demos.length, {
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
          message={plural(demos.length, {
            one: 'The demo will be deleted only from your filesystem, not the database.',
            other: 'The demos will be deleted only from your filesystem, not the database.',
          })}
        />
      </div>
    </ConfirmDialog>
  );
}
