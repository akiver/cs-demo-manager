import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Status } from 'csdm/common/types/status';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { deleteCameraSuccess } from 'csdm/ui/cameras/cameras-actions';

type Props = {
  cameraId: string;
};

export function DeleteCameraDialog({ cameraId }: Props) {
  const client = useWebSocketClient();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();

  const onConfirmClick = async () => {
    try {
      setStatus(Status.Loading);
      await client.send({
        name: RendererClientMessageName.DeleteCamera,
        payload: cameraId,
      });
      hideDialog();
      dispatch(deleteCameraSuccess({ cameraId }));
    } catch (error) {
      setStatus(Status.Error);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Delete camera</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={false}
      isBusy={status === Status.Loading}
    >
      <div className="gap-y-8">
        <p>
          <Trans>Do you want to delete this camera?</Trans>
        </p>
        {status === Status.Error && <ErrorMessage message={<Trans>An error occurred.</Trans>} />}
      </div>
    </ConfirmDialog>
  );
}
