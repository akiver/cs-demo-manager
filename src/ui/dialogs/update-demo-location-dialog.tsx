import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { ErrorCode } from 'csdm/common/error-code';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { useDialog } from '../components/dialogs/use-dialog';
import { useUpdateDemoLocation } from '../hooks/use-update-demo-location';
import { ErrorMessage } from '../components/error-message';

type Props = {
  checksum: string;
  demoFilePath: string;
};

export function UpdateDemoLocationDialog({ checksum, demoFilePath }: Props) {
  const { t } = useLingui();
  const [error, setError] = useState<string | undefined>(undefined);
  const { hideDialog } = useDialog();
  const updateDemoLocation = useUpdateDemoLocation();

  const onUpdateLocationClick = async () => {
    try {
      await updateDemoLocation(checksum);
      setError(undefined);
      hideDialog();
    } catch (error) {
      if (error === ErrorCode.ChecksumsMismatch) {
        setError(t`This demo checksum doesn't match the one associated with the match.`);
      } else {
        setError(t`An error occurred while updating demo location.`);
      }
    }
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans>Demo location</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="flex flex-col gap-y-8 max-w-[700px] break-all">
          <p>
            <Trans>
              The demo located at <code className="selectable">{demoFilePath}</code> doesn't exists.
            </Trans>
          </p>
          {error !== undefined && <ErrorMessage message={error} />}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onUpdateLocationClick}>
          <Trans context="Button">Update demo location</Trans>
        </Button>
        <CancelButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
