import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';

function ResetSettingsDialog() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);

  const onConfirmClick = async () => {
    try {
      setIsBusy(true);
      await window.csdm.resetSettings();
      window.csdm.reloadWindow();
    } catch (error) {
      logger.error(error);
      if (typeof error === 'string') {
        setError(error);
      } else {
        setError(JSON.stringify(error));
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ConfirmDialog
      title={<Trans context="Dialog title">Reset settings</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={false}
      isBusy={isBusy}
      confirmButtonVariant={ButtonVariant.Danger}
    >
      <p>
        <Trans>It will reset settings excepted database information!</Trans>
      </p>
      {error !== undefined && (
        <div className="mt-8">
          <ErrorMessage message={error} />
        </div>
      )}
    </ConfirmDialog>
  );
}

export function ResetSettingsButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ResetSettingsDialog />);
  };

  return (
    <Button onClick={onClick}>
      <Trans>Reset settings</Trans>
    </Button>
  );
}
