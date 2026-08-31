import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { formatErrorMessage } from 'csdm/ui/shared/format-error';

function ResetDatabaseDialog() {
  const client = useWebSocketClient();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const { t } = useLingui();

  const onConfirmClick = async () => {
    try {
      setIsBusy(true);
      const operationError = await client.send({
        name: RendererClientMessageName.ResetDatabase,
      });
      if (operationError !== undefined) {
        setError(operationError.message);
        return;
      }

      window.csdm.reloadWindow();
    } catch (error) {
      setError(formatErrorMessage(error, t`Unknown error`));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Reset database</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={false}
      isBusy={isBusy}
      confirmButtonVariant={ButtonVariant.Danger}
    >
      <p>
        <Trans>It will delete all data in the database!</Trans>
      </p>
      {error !== undefined && (
        <div className="mt-8">
          <ErrorMessage message={error} />
        </div>
      )}
    </ConfirmDialog>
  );
}

type Props = {
  variant?: ButtonVariant;
};

export function ResetDatabaseButton({ variant }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ResetDatabaseDialog />);
  };

  return (
    <Button variant={variant} onClick={onClick}>
      <Trans context="Button">Reset database</Trans>
    </Button>
  );
}
