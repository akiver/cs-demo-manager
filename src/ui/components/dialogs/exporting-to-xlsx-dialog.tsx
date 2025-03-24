import React, { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { MessageDescriptor } from '@lingui/core';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Status } from 'csdm/common/types/status';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { RevealFolderInExplorerButton } from 'csdm/ui/components/buttons/reveal-folder-in-explorer-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { type XlsxOutput } from 'csdm/node/xlsx/xlsx-output';
import type { ExportToXlsxProgressPayload, ExportToXlsxSuccessPayload } from 'csdm/common/types/xlsx';
import { msg } from '@lingui/core/macro';
import { sheetTranslations } from 'csdm/ui/xlsx/xlsx-sheet-translations';

function Header() {
  return (
    <DialogHeader>
      <DialogTitle>
        <Trans context="Dialog title">Excel export</Trans>
      </DialogTitle>
    </DialogHeader>
  );
}

type Props = {
  totalCount: number;
};

export function ExportingToXlsxDialog({ totalCount }: Props) {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const { hideDialog } = useDialog();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [message, setMessage] = useState<MessageDescriptor>(msg`Export in progress…`);
  const [output, setOutput] = useState<XlsxOutput | undefined>(undefined);
  const isExporting = status === Status.Loading;

  useEffect(() => {
    const onSuccess = ({ outputPath, outputType }: ExportToXlsxSuccessPayload) => {
      setStatus(Status.Success);
      setMessage(msg`Export done.`);
      setOutput({
        path: outputPath,
        type: outputType,
      });
    };

    const onError = () => {
      setStatus(Status.Error);
    };

    const onProgress = ({ count, totalCount }: ExportToXlsxProgressPayload) => {
      setMessage(msg`Exporting player ${count} of ${totalCount}…`);
    };

    const onSheetProgress = (sheetName: string) => {
      const translatedSheetName = sheetTranslations[sheetName].message;
      if (translatedSheetName) {
        setMessage(msg`Generating sheet ${translatedSheetName}…`);
      }
    };

    client.on(RendererServerMessageName.ExportToXlsxProgress, onProgress);
    client.on(RendererServerMessageName.ExportToXlsxSheetProgress, onSheetProgress);
    client.on(RendererServerMessageName.ExportToXlsxSuccess, onSuccess);
    client.on(RendererServerMessageName.ExportToXlsxError, onError);

    return () => {
      client.off(RendererServerMessageName.ExportToXlsxProgress, onProgress);
      client.off(RendererServerMessageName.ExportToXlsxSheetProgress, onSheetProgress);
      client.off(RendererServerMessageName.ExportToXlsxSuccess, onSuccess);
      client.off(RendererServerMessageName.ExportToXlsxError, onError);
    };
  }, [client, totalCount]);

  const renderRevealInExplorerButton = () => {
    if (output === undefined) {
      return null;
    }

    if (output.type === 'file') {
      return (
        <RevealFileInExplorerButton
          path={output.path}
          isDisabled={status !== Status.Success}
          variant={ButtonVariant.Primary}
          onFileRevealed={hideDialog}
        />
      );
    }

    return (
      <RevealFolderInExplorerButton
        path={output.path}
        isDisabled={status !== Status.Success}
        variant={ButtonVariant.Primary}
        onFolderRevealed={hideDialog}
      />
    );
  };

  return (
    <Dialog closeOnBackgroundClicked={!isExporting} closeOnEscPressed={!isExporting}>
      <Header />
      <DialogContent>
        <div className="flex flex-col gap-y-8">
          <p>{t(message)}</p>
          {status === Status.Error && <ErrorMessage message={<Trans>An error occurred.</Trans>} />}
        </div>
      </DialogContent>
      <DialogFooter>
        {renderRevealInExplorerButton()}
        <CloseButton onClick={hideDialog} isDisabled={isExporting} />
      </DialogFooter>
    </Dialog>
  );
}
