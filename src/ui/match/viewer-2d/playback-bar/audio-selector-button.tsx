import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { PlaybackBarButton } from './playback-bar-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import type { ExportDemoPlayersVoiceErrorPayload } from 'csdm/server/handlers/renderer-process/demo/export-demo-players-voice-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useCurrentMatch } from '../../use-current-match';
import { ExternalLink } from 'csdm/ui/components/external-link';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { ExportVoiceMode } from 'csdm/node/csgo-voice-extractor/export-voice-mode';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { DemoSource } from 'csdm/common/types/counter-strike';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';
import { SoundCross } from 'csdm/ui/icons/sound-cross';
import { useViewerContext } from '../use-viewer-context';
import { supportedAudioExtensions } from 'csdm/common/types/audio-extensions';

type Props = {
  loadAudioFile: (audioFilePath: string) => Promise<void>;
};

function AudioSelectorDialog({ loadAudioFile }: Props) {
  const { hideDialog } = useDialog();
  const { t } = useLingui();
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { demoFilePath, source } = useCurrentMatch();
  const [warnings, setWarnings] = useState<ReactNode[]>([]);
  const [error, setError] = useState<ReactNode | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const shouldAutoCloseDialog = useRef(true);

  useEffect(() => {
    const onDone = async () => {
      setIsExporting(false);
      try {
        const audioFilePath = await window.csdm.getDemoAudioFilePath(demoFilePath);
        if (audioFilePath) {
          await loadAudioFile(audioFilePath);
        }
      } catch (error) {
        setError(<Trans>An error occurred.</Trans>);
      }

      if (shouldAutoCloseDialog.current) {
        hideDialog();
      }
    };

    const onError = ({ demoPath, errorCode }: ExportDemoPlayersVoiceErrorPayload) => {
      shouldAutoCloseDialog.current = false;
      const addWarning = (warning: ReactNode) => {
        setWarnings((prevWarnings) => [...prevWarnings, warning]);
      };

      switch (errorCode) {
        case ErrorCode.DemoNotFound:
          addWarning(<Trans>Could not find the demo file: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorDecodingError:
          addWarning(<Trans>There was a problem decoding the demo: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorNoVoiceDataFound:
          addWarning(<Trans>No voice data was found in: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorParsingError:
          addWarning(<Trans>Failed to parse demo: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorUnsupportedAudioCodec:
          addWarning(<Trans>Unsupported audio format in: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorCreateAudioFileError:
          addWarning(<Trans>Unable to create audio file for: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorInvalidArgs:
          addWarning(<Trans>Invalid arguments provided for: {demoPath}</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorLoadCsgoLibError:
          setError(<Trans>Failed to load the Counter-Strike audio library.</Trans>);
          break;
        case ErrorCode.CsVoiceExtractorOpenDemoError:
          addWarning(<Trans>Could not open the demo file.</Trans>);
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
              Rosetta is required. Please install it from{' '}
              <ExternalLink href="https://support.apple.com/en-us/HT211861">Apple</ExternalLink>.
            </Trans>,
          );
          break;
        case ErrorCode.UnknownError:
          setError(<Trans>An error occurred.</Trans>);
          break;
      }
    };

    client.on(RendererServerMessageName.ExportDemoPlayersVoiceDone, onDone);
    client.on(RendererServerMessageName.ExportDemoPlayersVoiceError, onError);

    return () => {
      client.off(RendererServerMessageName.ExportDemoPlayersVoiceDone, onDone);
      client.off(RendererServerMessageName.ExportDemoPlayersVoiceError, onError);
    };
  }, [client, dispatch, hideDialog, demoFilePath, loadAudioFile]);

  return (
    <Dialog closeOnBackgroundClicked={!isExporting} closeOnEscPressed={!isExporting}>
      <div className="w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <Trans>Audio playback</Trans>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="flex flex-col gap-y-8">
            <div>
              <p>
                <Trans>No audio file was found for this demo.</Trans>
              </p>

              <p className="mt-8">
                <Trans>You can either:</Trans>
              </p>
              <ul className="list-disc list-inside ml-16">
                <li>
                  <Trans>
                    Generate a <code>.wav</code> file containing the players' voice audio next to the demo file.
                  </Trans>
                  {source === DemoSource.Valve && (
                    <div className="flex items-center gap-x-4 ml-16">
                      <ExclamationTriangleIcon className="size-16 text-red-700" />
                      <p>
                        <Trans>Valve Matchmaking demos do not contain voice audio data!</Trans>
                      </p>
                    </div>
                  )}
                </li>
                <li>
                  <Trans>Select an existing audio file from your computer to use for playback.</Trans>
                </li>
              </ul>

              <p className="mt-8">
                <Trans>
                  See the{' '}
                  <ExternalLink href="https://cs-demo-manager.com/docs/guides/2d-viewer#audio-playback">
                    documentation
                  </ExternalLink>{' '}
                  for more information.
                </Trans>
              </p>
            </div>
          </div>
          {warnings.length > 0 && (
            <div className="flex flex-col mt-16">
              <div className="flex items-center gap-x-8 mb-8">
                <ExclamationTriangleIcon className="size-16 text-orange-700" />
                <p>
                  <Trans>The following issues were found:</Trans>
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
          {error !== undefined && <ErrorMessage message={error} />}
        </DialogContent>
        <DialogFooter>
          <SpinnableButton
            isLoading={isExporting}
            variant={ButtonVariant.Primary}
            onClick={() => {
              client.send({
                name: RendererClientMessageName.ExportDemoPlayersVoice,
                payload: {
                  demoPaths: [demoFilePath],
                  outputPath: window.csdm.getPathDirectoryName(demoFilePath),
                  mode: ExportVoiceMode.SingleFull,
                  steamIds: [],
                },
              });
              setIsExporting(true);
              setWarnings([]);
              shouldAutoCloseDialog.current = true;
            }}
          >
            <Trans>Generate audio file</Trans>
          </SpinnableButton>
          <Button
            onClick={async () => {
              const result = await window.csdm.showOpenDialog({
                properties: ['openFile'],
                defaultPath: window.csdm.getPathDirectoryName(demoFilePath),
                filters: [{ name: t`Audio Files`, extensions: supportedAudioExtensions }],
              });
              if (result.canceled || !result.filePaths.length) {
                return;
              }
              const [audioFilePath] = result.filePaths;
              try {
                await loadAudioFile(audioFilePath);
                hideDialog();
              } catch (error) {
                setError(<Trans>An error occurred.</Trans>);
              }
            }}
            isDisabled={isExporting}
          >
            <Trans>Choose audio file…</Trans>
          </Button>
          <CloseButton onClick={hideDialog} isDisabled={isExporting} />
        </DialogFooter>
      </div>
    </Dialog>
  );
}

export function AudioSelectorButton({ loadAudioFile }: Props) {
  const { showDialog } = useDialog();
  const { pause } = useViewerContext();

  return (
    <PlaybackBarButton
      onClick={() => {
        pause();
        showDialog(<AudioSelectorDialog loadAudioFile={loadAudioFile} />);
      }}
    >
      <SoundCross className="size-32" />
    </PlaybackBarButton>
  );
}
