import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { deleteMapSuccess } from 'csdm/ui/maps/maps-actions';
import { Status } from 'csdm/common/types/status';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import type { Map } from 'csdm/common/types/map';

type Props = {
  map: Map;
};

export function DeleteMapDialog({ map }: Props) {
  const client = useWebSocketClient();
  const [status, setStatus] = useState<Status>(Status.Idle);
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();

  const onConfirmClick = async () => {
    try {
      setStatus(Status.Loading);
      await client.send({
        name: RendererClientMessageName.DeleteMap,
        payload: map,
      });
      hideDialog();
      dispatch(deleteMapSuccess({ mapId: map.id }));
    } catch (error) {
      setStatus(Status.Error);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans>Delete map</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={false}
      isBusy={status === Status.Loading}
    >
      <div className="gap-y-8">
        <p>
          <Trans>Do you want to delete this map?</Trans>
        </p>
        {status === Status.Error && <ErrorMessage message={<Trans>An error occurred.</Trans>} />}
      </div>
    </ConfirmDialog>
  );
}
