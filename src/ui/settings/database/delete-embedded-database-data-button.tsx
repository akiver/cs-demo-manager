import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';

type DialogProps = {
  onDeleted: () => void;
};

function DeleteEmbeddedDatabaseDataDialog({ onDeleted }: DialogProps) {
  const client = useWebSocketClient();
  const { hideDialog } = useDialog();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const onConfirmClick = async () => {
    try {
      setIsBusy(true);
      await client.send({
        name: RendererClientMessageName.DeleteEmbeddedDatabaseData,
      });
      hideDialog();
      onDeleted();
    } catch (error) {
      setError(typeof error === 'string' ? error : JSON.stringify(error));
      setIsBusy(false);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Delete database data</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={false}
      isBusy={isBusy}
      confirmButtonVariant={ButtonVariant.Danger}
    >
      <div className="flex flex-col gap-y-8">
        <p>
          <Trans>It will delete all data of the embedded database: matches, comments, tags, maps, cameras…</Trans>
        </p>
        <p>
          <Trans>Match statistics can be restored by analyzing the demos again, the rest will be lost.</Trans>
        </p>
        {error !== undefined && <ErrorMessage message={error} />}
      </div>
    </ConfirmDialog>
  );
}

type Props = {
  onDeleted: () => void;
};

export function DeleteEmbeddedDatabaseDataButton({ onDeleted }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<DeleteEmbeddedDatabaseDataDialog onDeleted={onDeleted} />);
  };

  return (
    <Button variant={ButtonVariant.Danger} onClick={onClick}>
      <Trans context="Button">Delete data and start from scratch</Trans>
    </Button>
  );
}
