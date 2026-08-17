import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';

function ResetEmbeddedDatabaseDialog() {
  const client = useWebSocketClient();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const onConfirmClick = async () => {
    try {
      setIsBusy(true);
      const operationError = await client.send({
        name: RendererClientMessageName.ResetEmbeddedDatabase,
      });
      if (operationError !== undefined) {
        setError(operationError.message);
        setIsBusy(false);
        return;
      }

      window.csdm.reloadWindow();
    } catch (error) {
      setError(typeof error === 'string' ? error : JSON.stringify(error));
      setIsBusy(false);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Reset the built-in database</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={false}
      isBusy={isBusy}
      confirmButtonVariant={ButtonVariant.Danger}
    >
      <div className="flex flex-col gap-y-12">
        <p>
          <Trans>
            It will delete the built-in database and create a new empty one. All analyzed demos will have to be analyzed
            again!
          </Trans>
        </p>
        {error !== undefined && <ErrorMessage message={error} />}
      </div>
    </ConfirmDialog>
  );
}

export function ResetEmbeddedDatabaseButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ResetEmbeddedDatabaseDialog />);
  };

  return (
    <Button variant={ButtonVariant.Danger} onClick={onClick}>
      <Trans context="Button">Reset the built-in database</Trans>
    </Button>
  );
}
