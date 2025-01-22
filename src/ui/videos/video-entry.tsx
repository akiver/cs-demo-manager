import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import type { Video } from 'csdm/common/types/video';
import { VideoStatus } from 'csdm/common/types/video-status';
import { assertNever } from 'csdm/common/assert-never';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { Spinner } from 'csdm/ui/components/spinner';
import { useGetSequencesRequiredDiskSpace } from 'csdm/ui/match/video/sequences/use-get-sequences-required-disk-space';
import { RequiredDiskSpace } from 'csdm/ui/match/video/sequences/required-disk-space';
import { SequencesDuration } from 'csdm/ui/match/video/sequences/sequences-duration';
import { CheckCircleIcon } from 'csdm/ui/icons/check-circle-icon';
import { TimesCircleIcon } from 'csdm/ui/icons/times-circle';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { getVideoErrorMessageFromErrorCode } from 'csdm/ui/match/video/get-video-error-from-error-code';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { RevealButton } from 'csdm/ui/components/buttons/reveal-button';
import { useGetMapThumbnailSrc } from 'csdm/ui/maps/use-get-map-thumbnail-src';
import { Card } from 'csdm/ui/components/card';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { useRemoveVideos } from './use-remove-videos';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { isErrorCode } from 'csdm/common/is-error-code';
import { ErrorCode } from 'csdm/common/error-code';
import { AddVideoToQueueErrorDialog } from '../match/video/add-video-to-queue-error-dialog';
import { useDialog } from '../components/dialogs/use-dialog';
import { RetryButton } from '../components/buttons/retry-button';
import { RecordingOutput } from '../match/video/recording-output';

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[auto_1fr] gap-y-4 gap-x-8 items-center">{children}</div>;
}

type FieldProps = {
  label: ReactNode;
  children: ReactNode;
  isSelectable?: boolean;
};

function Field({ label, children, isSelectable = false }: FieldProps) {
  return (
    <>
      <p>{label}</p>
      <div className={`break-all text-body-strong ${isSelectable ? 'selectable' : 'select-none'}`}>{children}</div>
    </>
  );
}

function SequenceListHeader({ children }: { children: ReactNode }) {
  return <p className="truncate">{children}</p>;
}

function getStatusMessage(video: Video) {
  switch (video.status) {
    case VideoStatus.Pending:
      return (
        <p>
          <Trans>Waiting…</Trans>
        </p>
      );
    case VideoStatus.Recording:
      return (
        <p>
          <Trans>In-game recording in progress…</Trans>
        </p>
      );
    case VideoStatus.MovingFiles:
      return (
        <p>
          <Trans>Moving final files…</Trans>
        </p>
      );
    case VideoStatus.Converting: {
      const number = video.currentSequence;
      const sequenceCount = video.sequences.length;
      return (
        <p>
          <Trans>
            Generating video for sequence {number} / {sequenceCount}…
          </Trans>
        </p>
      );
    }
    case VideoStatus.Concatenating:
      return (
        <p>
          <Trans>Merging videos into a single file…</Trans>
        </p>
      );
    case VideoStatus.Error:
      return (
        <p>
          <Trans>An error occurred</Trans>
        </p>
      );
    case VideoStatus.Success:
      return (
        <p>
          <Trans>Video generation done</Trans>
        </p>
      );
    default:
      assertNever(video.status, `Unsupported video status: ${video.status}`);
  }
}

type Props = {
  video: Video;
};

export function VideoEntry({ video }: Props) {
  const getRequiredDiskSpace = useGetSequencesRequiredDiskSpace();
  const getMapThumbnailSrc = useGetMapThumbnailSrc();
  const showToast = useShowToast();
  const { showDialog } = useDialog();
  const client = useWebSocketClient();
  const { isRemovingVideos, removeVideos } = useRemoveVideos();

  const tryRevealFolder = async (folderPath: string) => {
    const folderExists = await window.csdm.pathExists(folderPath);
    if (folderExists) {
      window.csdm.browseToFolder(folderPath);
    } else {
      showToast({
        id: 'output-folder-doesnt-exist',
        content: <Trans>The folder doesn't exist yet</Trans>,
        type: 'warning',
      });
    }
  };

  const onRevealOutputFolderClick = async () => {
    await tryRevealFolder(video.outputFolderPath);
  };

  const renderCurrentStepMessage = (video: Video) => {
    const message = video.errorCode
      ? getVideoErrorMessageFromErrorCode(video.game, video.errorCode)
      : getStatusMessage(video);

    switch (video.status) {
      case VideoStatus.Pending:
        return message;
      case VideoStatus.Success:
        return (
          <div className="flex items-center gap-x-8">
            <CheckCircleIcon className="size-20 text-green-500" />
            {message}
          </div>
        );
      case VideoStatus.Error:
        return (
          <div className="flex items-center gap-x-8">
            <TimesCircleIcon className="size-20 text-red-500" />
            {message}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-x-8">
            <Spinner size={20} />
            {message}
          </div>
        );
    }
  };

  const onRetryClick = async () => {
    try {
      await client.send({
        name: RendererClientMessageName.AddVideoToQueue,
        payload: video,
      });
    } catch (error) {
      const errorCode = isErrorCode(error) ? error : ErrorCode.UnknownError;
      const message = getVideoErrorMessageFromErrorCode(video.game, errorCode);
      showDialog(<AddVideoToQueueErrorDialog>{message}</AddVideoToQueueErrorDialog>);
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-y-8">
        <div className="flex items-center gap-x-12">
          <Button
            variant={ButtonVariant.Danger}
            isDisabled={isRemovingVideos}
            onClick={async () => {
              await removeVideos([video.id]);
            }}
          >
            <Trans context="Button">Remove</Trans>
          </Button>
          {video.status === VideoStatus.Error && <RetryButton onClick={onRetryClick} />}
          {renderCurrentStepMessage(video)}
        </div>

        <div className="flex">
          <img
            src={getMapThumbnailSrc(video.mapName, video.game)}
            alt={video.mapName}
            className="h-[92px] rounded-4 mr-8 self-center"
          />

          <div className="flex flex-wrap items-start gap-x-16">
            <Grid>
              <Field label={<Trans>Map</Trans>}>{video.mapName}</Field>
              <Field label={<Trans>Video ID</Trans>} isSelectable={true}>
                {video.id}
              </Field>
              <Field label={<Trans>Sequences</Trans>}>{video.sequences.length}</Field>
              <Field label={<Trans>Duration</Trans>}>
                {<SequencesDuration sequences={video.sequences} tickrate={video.tickrate} />}
              </Field>
              <Field label={<Trans>Disk space</Trans>}>
                <RequiredDiskSpace bytes={getRequiredDiskSpace(video.sequences, video.tickrate)} />
              </Field>
            </Grid>

            <Grid>
              <Field label={<Trans>Encoder software</Trans>}>{video.encoderSoftware}</Field>
              <Field label={<Trans>Resolution</Trans>}>{`${video.width}x${video.height}`}</Field>
              <Field label={<Trans>Framerate</Trans>}>{video.framerate}</Field>
              <Field label={<Trans>Merge sequences into single file</Trans>}>
                {video.concatenateSequences ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              </Field>
              <Field label={<Trans>Output</Trans>}>
                <RecordingOutput output={video.recordingOutput} />
              </Field>
            </Grid>

            <Grid>
              <Field label={<Trans>Close game after recording</Trans>}>
                {video.closeGameAfterRecording ? (
                  <Trans>Yes</Trans>
                ) : (
                  <div className="flex items-center gap-x-4">
                    <span>
                      <Trans>No</Trans>
                    </span>
                    <Tooltip
                      content={
                        <p>
                          <Trans>You will have to close the game manually.</Trans>
                        </p>
                      }
                    >
                      <div>
                        <ExclamationTriangleIcon className="size-16 text-red-700" />
                      </div>
                    </Tooltip>
                  </div>
                )}
              </Field>
            </Grid>
          </div>
        </div>

        <div className="flex flex-col gap-y-8">
          <Grid>
            <p>
              <Trans>Demo path</Trans>
            </p>
            <div className="flex gap-x-8">
              <TextInput value={video.demoPath} isReadOnly={true} />
              <RevealButton
                onClick={() => {
                  window.csdm.browseToFile(video.demoPath);
                }}
              />
            </div>

            <p>
              <Trans>Output path</Trans>
            </p>
            <div className="flex gap-x-8">
              <TextInput value={video.outputFolderPath} isReadOnly={true} />
              <RevealButton onClick={onRevealOutputFolderClick} />
            </div>
          </Grid>

          <div className="flex flex-col">
            <h2 className="text-body-strong mb-4">
              <Trans>Sequences</Trans>
            </h2>

            <div className="grid grid-cols-[60px_100px_100px_100px_100px_100px_1fr] p-4 bg-gray-200 rounded-t gap-4">
              <SequenceListHeader>#</SequenceListHeader>
              <SequenceListHeader>
                <Trans>Start tick</Trans>
              </SequenceListHeader>
              <SequenceListHeader>
                <Trans>End tick</Trans>
              </SequenceListHeader>
              <SequenceListHeader>
                <Trans>X-Ray</Trans>
              </SequenceListHeader>
              <SequenceListHeader>
                <Trans>Player voices</Trans>
              </SequenceListHeader>
              <SequenceListHeader>
                <Trans>Cameras</Trans>
              </SequenceListHeader>
              <SequenceListHeader>
                <Trans>First camera on</Trans>
              </SequenceListHeader>
            </div>

            <ul>
              {video.sequences.map((sequence) => {
                const [firstCamera] = sequence.cameras;

                return (
                  <li
                    key={sequence.number}
                    className="grid grid-cols-[60px_100px_100px_100px_100px_100px_1fr] gap-4 border border-gray-200 p-4 last:rounded-b"
                  >
                    <p>{sequence.number}</p>
                    <p>{sequence.startTick}</p>
                    <p>{sequence.endTick}</p>
                    <p>{sequence.showXRay ? <Trans>Yes</Trans> : <Trans>No</Trans>}</p>
                    <p>{sequence.playerVoicesEnabled ? <Trans>Yes</Trans> : <Trans>No</Trans>}</p>
                    <p>{sequence.cameras.length}</p>
                    <p>{firstCamera?.playerName ? firstCamera.playerName : <Trans>None</Trans>}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {video.output && (
            <div className="flex flex-col gap-y-4 w-full">
              <h2 className="text-body-strong">
                <Trans>Output</Trans>
              </h2>
              <div className="overflow-auto bg-gray-75 max-h-[600px]">
                <pre className="select-text p-8">{video.output}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
