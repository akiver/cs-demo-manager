import React, { useEffect, useState, type ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { RevealFolderInExplorerButton } from 'csdm/ui/components/buttons/reveal-folder-in-explorer-button';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import type {
  ExportDemoPlayersVoiceErrorPayload,
  ExportDemoPlayersVoiceProgressPayload,
} from 'csdm/server/handlers/renderer-process/demo/export-demo-players-voice-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ExternalLink } from 'csdm/ui/components/external-link';

type DialogProps = {
  outputFolderPath: string;
};

function ExportPlayersVoiceDialog({ outputFolderPath }: DialogProps) {
  const { hideDialog } = useDialog();
  const client = useWebSocketClient();
  const [warnings, setWarnings] = useState<ReactNode[]>([]);
  const [message, setMessage] = useState(<Trans>Export in progress…</Trans>);
  const [error, setError] = useState<ReactNode | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(true);

  useEffect(() => {
    const onProgress = ({ demoNumber, totalDemoCount }: ExportDemoPlayersVoiceProgressPayload) => {
      setMessage(
        <Trans>
          Exporting demo {demoNumber} of {totalDemoCount}...
        </Trans>,
      );
    };

    const onDone = () => {
      setIsExporting(false);
      setMessage(<Trans>Export done.</Trans>);
    };

    const onError = ({ demoPath, errorCode }: ExportDemoPlayersVoiceErrorPayload) => {
      const addWarning = (warning: ReactNode) => {
        setWarnings((prevWarnings) => [...prevWarnings, warning]);
      };

      switch (errorCode) {
        case ErrorCode.DemoNotFound:
          addWarning(<Trans>Demo not found: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorDecodingError:
          addWarning(<Trans>Decoding error: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorNoVoiceDataFound:
          addWarning(<Trans>No voice data found for demo: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorParsingError:
          addWarning(<Trans>Failed to parse demo: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorUnsupportedAudioCodec:
          addWarning(<Trans>Unsupported audio codec: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorCreateAudioFileError:
          addWarning(<Trans>Failed to create audio file: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorInvalidArgs:
          addWarning(<Trans>Invalid arguments for demo: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorLoadCsgoLibError:
          setError(<Trans>Failed to load the Counter-Strike audio library.</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorOpenDemoError:
          addWarning(<Trans>Failed to open the demo file.</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorMissingLibraryFiles:
          setError(<Trans>Some required library files are missing.</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorUnsupportedDemoFormat:
          addWarning(<Trans>This demo format is not supported.</Trans>);
          break;
        case ErrorCode.BadCpuType:
          setError(
            <Trans>
              You need to install <ExternalLink href="https://support.apple.com/en-us/HT211861">Rosetta</ExternalLink>.
            </Trans>,
          );
          break;
        case ErrorCode.UnknownError:
          setError(<Trans>An error occurred.</Trans>);
          break;
      }
    };

    client.on(RendererServerMessageName.ExportDemoPlayersVoiceProgress, onProgress);
    client.on(RendererServerMessageName.ExportDemoPlayersVoiceDone, onDone);
    client.on(RendererServerMessageName.ExportDemoPlayersVoiceError, onError);

    return () => {
      client.off(RendererServerMessageName.ExportDemoPlayersVoiceProgress, onProgress);
      client.off(RendererServerMessageName.ExportDemoPlayersVoiceDone, onDone);
      client.off(RendererServerMessageName.ExportDemoPlayersVoiceError, onError);
    };
  }, [client]);

  return (
    <Dialog closeOnBackgroundClicked={!isExporting} closeOnEscPressed={!isExporting}>
      <div className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Players voice export</Trans>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="flex items-center gap-x-4 mb-16">
            <ExclamationTriangleIcon className="size-16 text-red-700" />
            <p>
              <Trans>Valve Matchmaking demos do not contain voice audio data!</Trans>
            </p>
          </div>
          {warnings.length > 0 && (
            <div className="flex flex-col">
              <div className="flex items-center gap-x-8 mb-8">
                <ExclamationTriangleIcon className="size-16 text-orange-700" />
                <p>
                  <Trans>Warnings:</Trans>
                </p>
              </div>
              <ul className="flex flex-col gap-y-8 p-8 rounded max-w-[824px] max-h-[224px] overflow-auto bg-gray-100">
                {warnings.map((warning, index) => {
                  return (
                    <li key={`${warning}${index}`} className="select-text break-all selectable">
                      {warning}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <p className="my-8">{message}</p>
          {error !== undefined && <ErrorMessage message={error} />}
        </DialogContent>
        <DialogFooter>
          <RevealFolderInExplorerButton path={outputFolderPath} variant={ButtonVariant.Primary} />
          <CloseButton onClick={hideDialog} isDisabled={isExporting} />
        </DialogFooter>
      </div>
    </Dialog>
  );
}

type Props = {
  demoPaths: string[];
};

export function ExportPlayersVoiceItem({ demoPaths }: Props) {
  const client = useWebSocketClient();
  const { showDialog } = useDialog();
  const { t } = useLingui();

  const onClick = async () => {
    const { filePaths, canceled } = await window.csdm.showOpenDialog({
      buttonLabel: t({
        context: 'Button label',
        message: 'Export',
      }),
      defaultPath: window.csdm.getPathDirectoryName(demoPaths[0]),
      properties: ['openDirectory'],
    });

    if (canceled || filePaths.length === 0) {
      return;
    }

    const outputPath = filePaths[0];
    showDialog(<ExportPlayersVoiceDialog outputFolderPath={outputPath} />);

    client.send({
      name: RendererClientMessageName.ExportDemoPlayersVoice,
      payload: {
        demoPaths,
        outputPath,
      },
    });
  };

  return (
    <ContextMenuItem onClick={onClick} isDisabled={demoPaths.length === 0}>
      <Trans context="Context menu">Export players voice</Trans>
    </ContextMenuItem>
  );
}
