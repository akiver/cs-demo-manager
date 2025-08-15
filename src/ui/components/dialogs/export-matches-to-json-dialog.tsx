import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Button } from 'csdm/ui/components/buttons/button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { Status } from 'csdm/common/types/status';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import { ErrorMessage } from 'csdm/ui/components/error-message';

function Header() {
  return (
    <DialogHeader>
      <DialogTitle>
        <Trans context="Dialog title">JSON export</Trans>
      </DialogTitle>
    </DialogHeader>
  );
}

type Props = {
  checksums: string[];
};

export function ExportMatchesToJsonDialog({ checksums }: Props) {
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [outputFolderPath, setOutputFolderPath] = useState('');
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const { hideDialog } = useDialog();
  const { t } = useLingui();

  const isLoading = status === Status.Loading;
  const isOutputPathSelected = outputFolderPath !== '';
  const isExportPossible = isLoading || !isOutputPathSelected;

  const selectOutputFolder = async () => {
    const { filePaths, canceled } = await window.csdm.showOpenDialog({
      buttonLabel: t({
        context: 'Button label',
        message: 'Select',
      }),
      properties: ['openDirectory'],
    });

    if (canceled || filePaths.length === 0) {
      return;
    }

    const outputFolderPath = filePaths[0];
    setOutputFolderPath(outputFolderPath);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (isExportPossible) {
      return;
    }

    try {
      const formData = new FormData(event.currentTarget);
      setStatus(Status.Loading);
      await client.send({
        name: RendererClientMessageName.ExportMatchesToJson,
        payload: {
          checksums,
          outputFolderPath,
          minify: formData.has('minify'),
        },
      });

      hideDialog();
      showToast({
        content: (
          <div>
            <p>
              <Trans context="Notification">Export done</Trans>
            </p>
            <p>
              <Trans context="Notification">Click here to reveal the output folder</Trans>
            </p>
          </div>
        ),
        type: 'success',
        onClick: () => {
          window.csdm.browseToFolder(outputFolderPath);
        },
      });
    } catch (error) {
      setStatus(Status.Error);
    }
  };

  return (
    <Dialog>
      <Header />
      <form onSubmit={onSubmit}>
        <DialogContent>
          <div className="flex flex-col gap-y-8">
            <div>
              <p className="text-body-strong mb-8">
                <Trans context="File destination">Output</Trans>
              </p>
              <div className="flex flex-col items-start gap-y-12">
                {isOutputPathSelected && (
                  <div className="flex w-full max-w-[400px]">
                    <TextInput value={outputFolderPath} isReadOnly={true} isDisabled={isLoading} />
                  </div>
                )}
                <div className="flex items-center gap-x-8">
                  <Button onClick={selectOutputFolder} isDisabled={isLoading}>
                    <Trans context="Button to select an export output folder">Select folder</Trans>
                  </Button>
                  <Checkbox
                    label={<Trans context="Checkbox label">Minify</Trans>}
                    name="minify"
                    defaultChecked={false}
                    isDisabled={isLoading}
                  />
                </div>
              </div>
            </div>
            {status === Status.Error && <ErrorMessage message={<Trans>An error occurred.</Trans>} />}
          </div>
        </DialogContent>
        <DialogFooter>
          <SpinnableButton type="submit" isDisabled={isExportPossible} isLoading={isLoading}>
            <Trans context="Button">Export</Trans>
          </SpinnableButton>
          <CloseButton onClick={hideDialog} isDisabled={isLoading} />
        </DialogFooter>
      </form>
    </Dialog>
  );
}
