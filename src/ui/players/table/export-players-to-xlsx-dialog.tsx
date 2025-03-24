import React, { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { OpenDialogOptions, SaveDialogOptions } from 'electron';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { RadioInput } from 'csdm/ui/components/inputs/radio-input';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Status } from 'csdm/common/types/status';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { RevealFolderInExplorerButton } from 'csdm/ui/components/buttons/reveal-folder-in-explorer-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { XlsxOutputType, type XlsxOutput } from 'csdm/node/xlsx/xlsx-output';
import { PlayerSheetName } from 'csdm/node/xlsx/player-sheet-name';
import type { ExportPlayersToXlsxPayload } from 'csdm/server/handlers/renderer-process/player/export-players-to-xlsx-handler';
import type { ExportToXlsxProgressPayload, ExportToXlsxSuccessPayload } from 'csdm/common/types/xlsx';

function Header() {
  return (
    <DialogHeader>
      <DialogTitle>
        <Trans context="Dialog title">Excel export</Trans>
      </DialogTitle>
    </DialogHeader>
  );
}

const translationPerSheetName: Record<PlayerSheetName, MessageDescriptor> = {
  [PlayerSheetName.General]: msg({
    context: 'Excel sheet',
    message: 'General',
  }),
  [PlayerSheetName.Maps]: msg({
    context: 'Excel sheet',
    message: 'Maps',
  }),
};

type ExportingContentProps = {
  totalMatchCount: number;
};

function ExportingDialog({ totalMatchCount }: ExportingContentProps) {
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
      setMessage(msg`Exporting match ${count} of ${totalCount}…`);
    };

    const onSheetProgress = (sheetName: string) => {
      const translatedSheetName = translationPerSheetName[sheetName as PlayerSheetName].message;
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
  }, [client, totalMatchCount]);

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

type ExportDialogContentProps = {
  steamIds: string[];
  onExportStart: () => void;
};

function ExportOptionsDialog({ steamIds, onExportStart }: ExportDialogContentProps) {
  const { t } = useLingui();
  const client = useWebSocketClient();
  const { hideDialog } = useDialog();
  const [atLeastOneSheetSelected, setAtLeastOneSheetSelected] = useState(true);
  const isExportButtonDisabled = !atLeastOneSheetSelected;
  const isSinglePlayerSelected = steamIds.length === 1;

  const isAtLeastOneSheetSelected = (formData: FormData) => {
    for (const fieldName of formData.keys()) {
      if (fieldName.startsWith('sheets.')) {
        return true;
      }
    }

    return false;
  };

  const onFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    setAtLeastOneSheetSelected(isAtLeastOneSheetSelected(formData));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (isExportButtonDisabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const outputType = formData.get('output-type') as XlsxOutputType;
    let payload: ExportPlayersToXlsxPayload;
    const buildSheetsPayload = (formData: FormData) => {
      return {
        [PlayerSheetName.General]: formData.has('sheets.general'),
        [PlayerSheetName.Maps]: formData.has('sheets.maps'),
      };
    };

    if (outputType === XlsxOutputType.SingleFile && !isSinglePlayerSelected) {
      const name = `${steamIds.length}-players.xlsx`;
      const options: SaveDialogOptions = {
        buttonLabel: t({
          context: 'Button label',
          message: 'Export',
        }),
        defaultPath: name,
        filters: [{ name, extensions: ['xlsx'] }],
      };
      const { canceled, filePath: outputFilePath } = await window.csdm.showSaveDialog(options);
      if (canceled || outputFilePath === undefined) {
        return;
      }

      payload = {
        exportEachPlayerToSingleFile: false,
        steamIds,
        outputFilePath,
        sheets: buildSheetsPayload(formData),
        filter: {
          demoTypes: [],
          startDate: undefined,
          endDate: undefined,
          gameModes: [],
          games: [],
          maxRounds: [],
          ranking: 'all',
          sources: [],
          tagIds: [],
        },
      };
    } else {
      const options: OpenDialogOptions = {
        buttonLabel: t({
          context: 'Button label',
          message: 'Export',
        }),
        properties: ['openDirectory'],
      };
      const { canceled, filePaths } = await window.csdm.showOpenDialog(options);
      if (canceled || filePaths.length === 0) {
        return;
      }

      payload = {
        exportEachPlayerToSingleFile: true,
        steamIds,
        outputFolderPath: filePaths[0],
        sheets: buildSheetsPayload(formData),
        filter: {
          demoTypes: [],
          startDate: undefined,
          endDate: undefined,
          gameModes: [],
          games: [],
          maxRounds: [],
          ranking: 'all',
          sources: [],
          tagIds: [],
        },
      };
    }

    client.send({
      name: RendererClientMessageName.ExportPlayersToXlsx,
      payload,
    });
    onExportStart();
  };

  const renderOutputOptions = () => {
    return (
      <div className={isSinglePlayerSelected ? 'hidden' : undefined}>
        <p className="text-body-strong">
          <Trans context="File destination">Output</Trans>
        </p>
        <div className="flex gap-4">
          <RadioInput
            id="single"
            name="output-type"
            value={XlsxOutputType.SingleFile}
            label={<Trans context="Radio label">Single file</Trans>}
            defaultChecked={true}
          />
          <RadioInput
            id="multiple"
            name="output-type"
            value={XlsxOutputType.MultipleFiles}
            label={<Trans context="Radio label">Multiple files</Trans>}
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <Header />
      <form onSubmit={onSubmit} onChange={onFormChange}>
        <DialogContent>
          <div className="gap-y-8">
            {renderOutputOptions()}
            <div className="max-w-[448px] mt-8">
              <p className="text-body-strong">
                <Trans context="Excel sheets">Sheets</Trans>
              </p>
              <div className="flex gap-8 flex-wrap">
                <Checkbox
                  label={t(translationPerSheetName[PlayerSheetName.General])}
                  name="sheets.general"
                  defaultChecked={true}
                />
                <Checkbox
                  label={t(translationPerSheetName[PlayerSheetName.Maps])}
                  name="sheets.maps"
                  defaultChecked={true}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant={ButtonVariant.Primary} type="submit" isDisabled={isExportButtonDisabled}>
            <Trans context="Button">Export</Trans>
          </Button>
          <CloseButton onClick={hideDialog} />
        </DialogFooter>
      </form>
    </Dialog>
  );
}

type Props = {
  steamIds: string[];
};

export function ExportPlayersToXlsxDialog({ steamIds }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const key = steamIds.join(',');

  const onExportStart = () => {
    setIsExporting(true);
  };

  if (isExporting) {
    return <ExportingDialog key={key} totalMatchCount={steamIds.length} />;
  }

  return <ExportOptionsDialog key={key} steamIds={steamIds} onExportStart={onExportStart} />;
}
