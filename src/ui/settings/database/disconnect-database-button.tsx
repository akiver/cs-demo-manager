import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { disconnectDatabaseSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { makeElementNonInert } from 'csdm/ui/shared/inert';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';

function DisconnectDatabaseDialog() {
  const client = useWebSocketClient();
  const [error, setError] = useState<string | undefined>(undefined);
  const { hideDialog } = useDialog();
  const dispatch = useDispatch();

  const onConfirm = async () => {
    try {
      await client.send({
        name: RendererClientMessageName.DisconnectDatabase,
      });
      dispatch(disconnectDatabaseSuccess());
      hideDialog();
      makeElementNonInert(APP_ELEMENT_ID);
    } catch (error) {
      if (typeof error === 'string') {
        setError(error);
      } else {
        setError(JSON.stringify(error));
      }
    }
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Disconnect database</Trans>}
      onConfirm={onConfirm}
      closeOnConfirm={false}
      confirmButtonVariant={ButtonVariant.Danger}
    >
      <div className="flex flex-col gap-y-12">
        <p>
          <Trans>It will close the database connection and cancel all running queries!</Trans>
        </p>
        {error && (
          <div className="flex flex-col gap-8">
            <ErrorMessage message={<Trans>Database disconnection failed with the following error:</Trans>} />
            <p className="select-text text-body-strong">{error}</p>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}

export function DisconnectDatabaseButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<DisconnectDatabaseDialog />);
  };

  return (
    <Button onClick={onClick} variant={ButtonVariant.Danger}>
      <Trans context="Button">Disconnect</Trans>
    </Button>
  );
}
