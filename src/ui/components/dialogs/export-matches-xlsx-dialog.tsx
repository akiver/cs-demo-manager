import React, { useEffect, useState } from 'react';
import { Trans, msg } from '@lingui/macro';
import type { MessageDescriptor } from '@lingui/core';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { OpenDialogOptions, SaveDialogOptions } from 'electron';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { MatchTable } from 'csdm/common/types/match-table';
import type {
  ExportMatchesToXlsxPayload,
  ExportMatchesToXlsxProgressPayload,
  ExportMatchesToXlsxSuccessPayload,
} from 'csdm/server/handlers/renderer-process/match/export-matches-to-xlsx-handler';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { RadioInput } from 'csdm/ui/components/inputs/radio-input';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Status } from 'csdm/common/types/status';
import { RevealFileInExplorerButton } from 'csdm/ui/components/buttons/reveal-file-in-explorer-button';
import { RevealFolderInExplorerButton } from 'csdm/ui/components/buttons/reveal-folder-in-explorer-button';
import { SheetName } from 'csdm/node/xlsx/sheet-name';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { ErrorMessage } from 'csdm/ui/components/error-message';

type Match = Pick<MatchTable, 'checksum' | 'name'>;

const OutputType = {
  SingleFile: 'single-file',
  MultipleFiles: 'multiple-files',
} as const;
type OutputType = (typeof OutputType)[keyof typeof OutputType];

type Output = {
  type: 'file' | 'folder';
  path: string;
};

function Header() {
  return (
    <DialogHeader>
      <DialogTitle>
        <Trans context="Dialog title">Excel export</Trans>
      </DialogTitle>
    </DialogHeader>
  );
}

const translationPerSheetName: Record<SheetName, MessageDescriptor> = {
  [SheetName.General]: msg({
    context: 'Excel sheet',
    message: 'General',
  }),
  [SheetName.Players]: msg({
    context: 'Excel sheet',
    message: 'Players',
  }),
  [SheetName.Kills]: msg({
    context: 'Excel sheet',
    message: 'Rounds',
  }),
  [SheetName.Rounds]: msg({
    context: 'Excel sheet',
    message: 'Kills',
  }),
  [SheetName.Weapons]: msg({
    context: 'Excel sheet',
    message: 'Weapons',
  }),
  [SheetName.PlayersFlashbangMatrix]: msg({
    context: 'Excel sheet',
    message: 'Players Flashbang matrix',
  }),
};

type ExportingContentProps = {
  totalMatchCount: number;
};

function ExportingDialog({ totalMatchCount }: ExportingContentProps) {
  const _ = useI18n();
  const client = useWebSocketClient();
  const { hideDialog } = useDialog();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [message, setMessage] = useState<MessageDescriptor>(msg`Export in progress…`);
  const [output, setOutput] = useState<Output | undefined>(undefined);
  const isExporting = status === Status.Loading;

  useEffect(() => {
    const onSuccess = ({ outputPath, outputType }: ExportMatchesToXlsxSuccessPayload) => {
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

    const onProgress = ({ matchCount }: ExportMatchesToXlsxProgressPayload) => {
      setMessage(msg`Exporting match ${matchCount} of ${totalMatchCount}…`);
    };

    const onSheetProgress = (sheetName: SheetName) => {
      const translatedSheetName = translationPerSheetName[sheetName].message;
      setMessage(msg`Generating sheet ${translatedSheetName}…`);
    };

    client.on(RendererServerMessageName.ExportMatchesToXlsxMatchProgress, onProgress);
    client.on(RendererServerMessageName.ExportMatchesToXlsxSheetProgress, onSheetProgress);
    client.on(RendererServerMessageName.ExportMatchesToXlsxSuccess, onSuccess);
    client.on(RendererServerMessageName.ExportMatchesToXlsxError, onError);

    return () => {
      client.off(RendererServerMessageName.ExportMatchesToXlsxMatchProgress, onProgress);
      client.off(RendererServerMessageName.ExportMatchesToXlsxSheetProgress, onSheetProgress);
      client.off(RendererServerMessageName.ExportMatchesToXlsxSuccess, onSuccess);
      client.off(RendererServerMessageName.ExportMatchesToXlsxError, onError);
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
          <p>{_(message)}</p>
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
  matches: Match[];
  onExportStart: () => void;
};

function ExportOptionsDialog({ matches, onExportStart }: ExportDialogContentProps) {
  const _ = useI18n();
  const client = useWebSocketClient();
  const { hideDialog } = useDialog();
  const [outputType, setOutputType] = useState<OutputType>(OutputType.SingleFile);
  const [atLeastOneSheetSelected, setAtLeastOneSheetSelected] = useState(true);
  const isExportButtonDisabled = !atLeastOneSheetSelected;
  const isSingleMatchSelected = matches.length === 1;

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
    const outputType = formData.get('output-type') as OutputType;
    let payload: ExportMatchesToXlsxPayload;
    const buildSheetsPayload = (formData: FormData) => {
      return {
        [SheetName.General]: formData.has('sheets.general'),
        [SheetName.Players]: formData.has('sheets.players'),
        [SheetName.Kills]: formData.has('sheets.kills'),
        [SheetName.Rounds]: formData.has('sheets.rounds'),
        [SheetName.Weapons]: formData.has('sheets.weapons'),
        [SheetName.PlayersFlashbangMatrix]: formData.has('sheets.playersFlashbangMatrix'),
      };
    };

    if (outputType === OutputType.SingleFile && !isSingleMatchSelected) {
      const name = `${matches.length}-matches.xlsx`;
      const options: SaveDialogOptions = {
        buttonLabel: _(
          msg({
            context: 'Button label',
            message: 'Export',
          }),
        ),
        defaultPath: name,
        filters: [{ name, extensions: ['xlsx'] }],
      };
      const { canceled, filePath: outputFilePath } = await window.csdm.showSaveDialog(options);
      if (canceled || outputFilePath === undefined) {
        return;
      }

      payload = {
        exportEachMatchToSingleFile: false,
        checksums: matches.map((match) => match.checksum),
        outputFilePath,
        sheets: buildSheetsPayload(formData),
      };
    } else {
      const options: OpenDialogOptions = {
        buttonLabel: _(
          msg({
            context: 'Button label',
            message: 'Export',
          }),
        ),
        properties: ['openDirectory'],
      };
      const { canceled, filePaths } = await window.csdm.showOpenDialog(options);
      if (canceled || filePaths.length === 0) {
        return;
      }

      payload = {
        exportEachMatchToSingleFile: true,
        matches: matches.map((match) => {
          return {
            checksum: match.checksum,
            name: match.name,
          };
        }),
        outputFolderPath: filePaths[0],
        sheets: buildSheetsPayload(formData),
      };
    }

    client.send({
      name: RendererClientMessageName.ExportMatchesToXlsx,
      payload,
    });
    onExportStart();
  };

  const renderOutputOptions = () => {
    return (
      <div className={isSingleMatchSelected ? 'hidden' : undefined}>
        <p className="text-body-strong">
          <Trans context="File destination">Output</Trans>
        </p>
        <div className="flex gap-4">
          <RadioInput
            id="single"
            name="output-type"
            value={OutputType.SingleFile}
            label={<Trans context="Radio label">Single file</Trans>}
            defaultChecked={true}
            onChange={() => setOutputType(OutputType.SingleFile)}
          />
          <RadioInput
            id="multiple"
            name="output-type"
            value={OutputType.MultipleFiles}
            label={<Trans context="Radio label">Multiple files</Trans>}
            onChange={() => setOutputType(OutputType.MultipleFiles)}
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
                  label={_(translationPerSheetName[SheetName.General])}
                  id="general"
                  name="sheets.general"
                  defaultChecked={true}
                />
                <Checkbox
                  label={_(translationPerSheetName[SheetName.Rounds])}
                  id="rounds"
                  name="sheets.rounds"
                  defaultChecked={true}
                />
                <Checkbox
                  label={_(translationPerSheetName[SheetName.Players])}
                  id="players"
                  name="sheets.players"
                  defaultChecked={true}
                />
                <Checkbox
                  label={_(translationPerSheetName[SheetName.Kills])}
                  id="kills"
                  name="sheets.kills"
                  defaultChecked={true}
                />
                <Checkbox
                  label={_(translationPerSheetName[SheetName.Weapons])}
                  id="weapons"
                  name="sheets.weapons"
                  defaultChecked={true}
                />
                {(isSingleMatchSelected || outputType === OutputType.MultipleFiles) && (
                  <Checkbox
                    label={_(translationPerSheetName[SheetName.PlayersFlashbangMatrix])}
                    id="players-flashbang-matrix"
                    name="sheets.playersFlashbangMatrix"
                    defaultChecked={true}
                  />
                )}
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
  matches: Match[];
};

export function ExportMatchesAsXlsxDialog({ matches }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const key = matches.map((match) => match.checksum).join(',');

  const onExportStart = () => {
    setIsExporting(true);
  };

  if (isExporting) {
    return <ExportingDialog key={key} totalMatchCount={matches.length} />;
  }

  return <ExportOptionsDialog key={key} matches={matches} onExportStart={onExportStart} />;
}
