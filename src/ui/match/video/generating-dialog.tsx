import React, { useEffect, useState, type ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { Button } from 'csdm/ui/components/buttons/button';
import { Spinner } from 'csdm/ui/components/spinner';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import { Status } from 'csdm/common/types/status';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { ErrorCode } from 'csdm/common/error-code';
import type {
  GenerateVideoErrorPayload,
  GeneratingVideoFromSequencePayload,
} from 'csdm/server/handlers/renderer-process/video/generate-videos-handler';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { useCurrentMatch } from '../use-current-match';
import { Game } from 'csdm/common/types/counter-strike';

type Props = {
  closeDialog: () => void;
};

export function GeneratingVideosDialog({ closeDialog }: Props) {
  const client = useWebSocketClient();
  const [error, setError] = useState<ReactNode | undefined>();
  const [output, setOutput] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const { settings } = useVideoSettings();
  const match = useCurrentMatch();
  const [message, setMessage] = useState(() => {
    return (
      <>
        <p>
          <Trans>Generation in progress…</Trans>
        </p>
        {match.game !== Game.CSGO && (
          <p>
            <Trans>Please keep the CS2 window focused; otherwise the camera focus may not change.</Trans>
          </p>
        )}
      </>
    );
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (status !== Status.Loading && event.key === 'Escape') {
        closeDialog();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [closeDialog, status]);

  useEffect(() => {
    const onCsStarting = () => {
      setMessage(<Trans>In-game recording in progress…</Trans>);
    };
    const onGenerateVideoFromSequence = ({ sequenceNumber, sequenceCount }: GeneratingVideoFromSequencePayload) => {
      setMessage(
        <Trans>
          Generating video for sequence {sequenceNumber} / {sequenceCount}…
        </Trans>,
      );
    };
    const onConcatenatingSequences = () => {
      setMessage(<Trans>Concatenating sequences…</Trans>);
    };
    const onError = ({ errorCode, output }: GenerateVideoErrorPayload) => {
      const getErrorMessageFromErrorCode = (errorCode: number) => {
        switch (errorCode) {
          case ErrorCode.DemoNotFound:
            return <Trans>Demo not found.</Trans>;
          case ErrorCode.InvalidDemoPath:
            return <Trans>The demo's path contains unsupported characters by CSGO.</Trans>;
          case ErrorCode.StartCounterStrikeError:
            return (
              <div className="flex flex-col gap-y-4">
                <p>
                  <Trans>Failed to start the game, make sure Steam is running and you are connected.</Trans>
                </p>
                {match.game === Game.CSGO && (
                  <p>
                    <Trans>
                      Please make sure that CS:GO is installed by selecting the <strong>csgo_legacy</strong> branch from
                      the CS2 "Betas" property tab on Steam.
                    </Trans>
                  </p>
                )}
              </div>
            );
          case ErrorCode.CounterStrikeExecutableNotFound:
            return <Trans>Counter-Strike executable not found.</Trans>;
          case ErrorCode.HlaeNotInstalled:
            return <Trans>HLAE is not installed.</Trans>;
          case ErrorCode.VirtualDubNotInstalled:
            return <Trans>VirtualDub is not installed.</Trans>;
          case ErrorCode.FfmpegNotInstalled:
            return <Trans>FFmpeg is not installed.</Trans>;
          case ErrorCode.NoSequencesFound:
            return <Trans>No sequences provided.</Trans>;
          case ErrorCode.SequencesAreOverlapping:
            return (
              <Trans>One or more sequences are overlapping, at least 2 seconds are required between 2 sequences.</Trans>
            );
          case ErrorCode.SteamNotRunning:
            return <Trans>Steam is not running.</Trans>;
          case ErrorCode.FfmpegError:
            return <Trans>FFmpeg returned an error.</Trans>;
          case ErrorCode.VirtualDubError:
            return <Trans>VirtualDub returned an error.</Trans>;
          case ErrorCode.WavFileNotFound:
            return <Trans>WAV file not found.</Trans>;
          case ErrorCode.RawFilesNotFound:
            return <Trans>Raw files not found.</Trans>;
          case ErrorCode.HlaeError:
            return <Trans>HLAE returned an error.</Trans>;
          default:
            return <Trans>An error occurred.</Trans>;
        }
      };

      const message = getErrorMessageFromErrorCode(errorCode);
      setStatus(Status.Error);
      setError(message);
      setOutput(output);
    };
    const onGenerationSuccess = () => {
      setMessage(<Trans>Generation done</Trans>);
      setStatus(Status.Success);
    };

    client.on(RendererServerMessageName.StartingGame, onCsStarting);
    client.on(RendererServerMessageName.GeneratingVideoFromSequence, onGenerateVideoFromSequence);
    client.on(RendererServerMessageName.ConcatenateSequencesStart, onConcatenatingSequences);
    client.on(RendererServerMessageName.VideosGenerationError, onError);
    client.on(RendererServerMessageName.VideosGenerationSuccess, onGenerationSuccess);

    return () => {
      client.off(RendererServerMessageName.StartingGame, onCsStarting);
      client.off(RendererServerMessageName.GeneratingVideoFromSequence, onGenerateVideoFromSequence);
      client.off(RendererServerMessageName.ConcatenateSequencesStart, onConcatenatingSequences);
      client.off(RendererServerMessageName.VideosGenerationError, onError);
      client.off(RendererServerMessageName.VideosGenerationSuccess, onGenerationSuccess);
    };
  }, [client, match.game]);

  const onCancelClick = () => {
    client.send({
      name: RendererClientMessageName.CancelVideosGeneration,
    });
    closeDialog();
  };

  const onRevealOutputFolderClick = () => {
    window.csdm.browseToFolder(settings.outputFolderPath);
  };

  const onRevealRawFilesFolderClick = () => {
    window.csdm.browseToFolder(settings.rawFilesFolderPath);
  };

  return (
    <div className="flex flex-col bg-gray-50 h-full p-16 overflow-auto">
      <div className="flex flex-col gap-y-8 items-center justify-center mt-48">
        {status === Status.Loading && <Spinner size={40} />}
        {status === Status.Error ? <ErrorMessage message={error} /> : <div>{message}</div>}
        {output !== undefined && (
          <div className="flex flex-col gap-y-4 w-full">
            <p>
              <Trans>Output:</Trans>
            </p>
            <div className="overflow-auto bg-gray-75 max-h-[600px]">
              <pre className="select-text p-8">{output}</pre>
            </div>
          </div>
        )}
        <div className="flex gap-x-8">
          {status === Status.Loading ? <CancelButton onClick={onCancelClick} /> : <CloseButton onClick={closeDialog} />}
          <Button onClick={onRevealRawFilesFolderClick}>
            <Trans context="Button">Reveal raw files folder</Trans>
          </Button>
          <Button onClick={onRevealOutputFolderClick}>
            <Trans context="Button">Reveal output folder</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
