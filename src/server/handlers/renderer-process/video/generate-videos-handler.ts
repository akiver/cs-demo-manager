import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { AbortError } from 'csdm/node/errors/abort-error';
import type { ErrorCode } from 'csdm/common/error-code';
import { CommandError } from 'csdm/node/video/errors/command-error';
import { generateVideos } from 'csdm/node/video/generate-videos';
import { onGameStart } from '../counter-strike/counter-strike';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Game } from 'csdm/common/types/counter-strike';
import type { VideoContainer } from 'csdm/common/types/video-container';

type FfmpegSettings = {
  audioBitrate: number;
  constantRateFactor: number;
  videoContainer: VideoContainer;
  videoCodec: string;
  audioCodec: string;
  inputParameters: string;
  outputParameters: string;
};

export type GenerateVideosPayload = {
  checksum: string;
  game: Game;
  tickrate: number;
  encoderSoftware: EncoderSoftware;
  framerate: number;
  width: number;
  height: number;
  generateOnlyRawFiles: boolean;
  deleteRawFilesAfterEncoding: boolean;
  closeGameAfterRecording: boolean;
  showOnlyDeathNotices: boolean;
  concatenateSequences: boolean;
  ffmpegSettings: FfmpegSettings;
  rawFilesFolderPath: string;
  outputFolderPath: string;
  deathNoticesDuration: number;
  demoPath: string;
  sequences: Sequence[];
};

export type GenerateVideoErrorPayload = { errorCode: ErrorCode; output?: string };

export type GeneratingVideoFromSequencePayload = {
  sequenceNumber: number;
  sequenceCount: number;
};

export let videoAbortController = new AbortController();

export async function generateVideosHandler(payload: GenerateVideosPayload) {
  try {
    videoAbortController = new AbortController();
    await generateVideos({
      ...payload,
      signal: videoAbortController.signal,
      onGameStart,
      onSequenceStart: (sequenceNumber: number, sequenceCount: number) => {
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.GeneratingVideoFromSequence,
          payload: {
            sequenceNumber,
            sequenceCount,
          },
        });
      },
      onConcatenateSequencesStart: () => {
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.ConcatenateSequencesStart,
        });
      },
    });
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.VideosGenerationSuccess,
    });
  } catch (error) {
    if (error instanceof AbortError) {
      return;
    }

    let output: string | undefined;
    if (error instanceof CommandError) {
      output = error.output;
    } else if (error instanceof Error) {
      output = error.message;
    }

    logger.error('Error while generating videos');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    const payload: GenerateVideoErrorPayload = {
      errorCode,
      output,
    };
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.VideosGenerationError,
      payload,
    });
  }
}
