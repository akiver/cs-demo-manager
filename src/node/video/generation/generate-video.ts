import { Game } from 'csdm/common/types/counter-strike';
import { generateVideoWithVirtualDub } from 'csdm/node/video/generation/generate-video-with-virtual-dub';
import { generateVideoWithFFmpeg } from 'csdm/node/video/generation/generate-video-with-ffmpeg';
import { concatenateVideosFromSequences } from 'csdm/node/video/generation/concatenate-videos-from-sequences';
import { createCsgoVideoJsonFile } from 'csdm/node/video/generation/create-csgo-video-json-file';
import { watchDemoWithHlae } from 'csdm/node/counter-strike/launcher/watch-demo-with-hlae';
import { isWindows } from 'csdm/node/os/is-windows';
import { killCounterStrikeProcesses } from 'csdm/node/counter-strike/kill-counter-strike-processes';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { killFfmpegProcess } from 'csdm/node/video/ffmpeg/kill-ffmpeg-process';
import { killVirtualDubProcess } from 'csdm/node/video/virtual-dub/kill-virtual-dub-process';
import { abortError, throwIfAborted } from 'csdm/node/errors/abort-error';
import { killHlaeProcess } from 'csdm/node/video/hlae/kill-hlae-process';
import { sleep } from 'csdm/common/sleep';
import { sortSequencesByStartTick } from 'csdm/common/video/sort-sequences-by-start-tick';
import { createCs2VideoJsonFile } from 'csdm/node/video/generation/create-cs2-video-json-file';
import { startCounterStrike } from 'csdm/node/counter-strike/launcher/start-counter-strike';
import { deleteJsonActionsFile } from 'csdm/node/counter-strike/json-actions-file/delete-json-actions-file';
import { moveStartMovieFilesToOutputFolder } from 'csdm/node/video/generation/move-startmovie-files-to-output-folder';
import type { Sequence } from 'csdm/common/types/sequence';
import type { FfmpegSettings } from 'csdm/node/settings/settings';
import { fetchMatchPlayersSlots } from 'csdm/node/database/match/fetch-match-players-slots';
import { assertVideoGenerationIsPossible } from './assert-video-generation-is-possible';
import { deleteSequencesRawFiles } from './delete-sequences-raw-files';
import { uninstallCounterStrikeServerPlugin } from 'csdm/node/counter-strike/launcher/cs-server-plugin';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { moveHlaeRawFilesToOutputFolder } from './move-hlae-files-to-output-folder';
import { fetchCameras } from 'csdm/node/database/cameras/fetch-cameras';
import { getFfmpegExecutablePath } from '../ffmpeg/ffmpeg-location';
import { isEmptyString } from 'csdm/common/string/is-empty-string';
import { DisplayMode } from 'csdm/common/types/display-mode';

export type Parameters = {
  videoId: string;
  checksum: string;
  game: Game;
  tickrate: number;
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  framerate: number;
  width: number;
  height: number;
  closeGameAfterRecording: boolean;
  concatenateSequences: boolean;
  ffmpegSettings: Omit<FfmpegSettings, 'customLocationEnabled'>;
  outputFolderPath: string;
  demoPath: string;
  sequences: Sequence[];
  signal: AbortSignal;
  onGameStart: () => void;
  onMoveFilesStart: () => void;
  onSequenceStart: (sequenceNumber: number) => void;
  onConcatenateSequencesStart: () => void;
};

async function buildVideos({ signal, ...options }: Parameters) {
  throwIfAborted(signal);

  const {
    recordingSystem,
    recordingOutput,
    encoderSoftware,
    framerate,
    sequences,
    outputFolderPath,
    concatenateSequences,
    ffmpegSettings,
    game,
    onSequenceStart,
    onConcatenateSequencesStart,
  } = options;

  for (const sequence of sequences) {
    onSequenceStart(sequence.number);
    if (encoderSoftware === EncoderSoftware.FFmpeg) {
      await generateVideoWithFFmpeg(
        {
          ffmpegExecutablePath: !isEmptyString(ffmpegSettings.customExecutableLocation)
            ? ffmpegSettings.customExecutableLocation
            : await getFfmpegExecutablePath(),
          recordingSystem,
          recordingOutput,
          game,
          recordAudio: sequence.recordAudio,
          audioBitrate: ffmpegSettings.audioBitrate,
          constantRateFactor: ffmpegSettings.constantRateFactor,
          videoContainer: ffmpegSettings.videoContainer,
          videoCodec: ffmpegSettings.videoCodec,
          audioCodec: ffmpegSettings.audioCodec,
          inputParameters: ffmpegSettings.inputParameters,
          outputParameters: ffmpegSettings.outputParameters,
          framerate,
          outputFolderPath,
          sequence,
        },
        signal,
      );
    } else {
      await generateVideoWithVirtualDub(
        {
          recordingSystem,
          game,
          recordAudio: sequence.recordAudio,
          framerate,
          outputFolderPath,
          sequence,
        },
        signal,
      );
    }
  }

  const shouldConcatenate = concatenateSequences && sequences.length > 1;
  if (shouldConcatenate) {
    onConcatenateSequencesStart();
    await concatenateVideosFromSequences(
      {
        ffmpegExecutablePath: !isEmptyString(ffmpegSettings.customExecutableLocation)
          ? ffmpegSettings.customExecutableLocation
          : await getFfmpegExecutablePath(),
        outputFolderPath,
        sequences,
        videoContainer: ffmpegSettings.videoContainer,
      },
      signal,
    );
  }
}

export async function generateVideo(parameters: Parameters) {
  logger.debug('Generating video with parameters:');
  logger.debug(parameters);

  const {
    checksum,
    videoId,
    recordingSystem,
    recordingOutput,
    encoderSoftware,
    framerate,
    demoPath,
    width,
    height,
    closeGameAfterRecording,
    tickrate,
    game,
    ffmpegSettings,
    outputFolderPath,
    signal,
    onMoveFilesStart,
  } = parameters;

  throwIfAborted(signal);

  const sequences = sortSequencesByStartTick(parameters.sequences);

  const cleanupFiles = async () => {
    logger.debug(`Cleaning up files for video with id ${videoId}`);
    await Promise.all([deleteJsonActionsFile(demoPath), deleteSequencesRawFiles(parameters)]);
  };

  async function onAbort() {
    logger.debug(`Aborting video generation with id ${videoId}`);
    if (isWindows) {
      await Promise.all([killHlaeProcess(), killVirtualDubProcess()]);
    }

    await Promise.all([killFfmpegProcess(), killCounterStrikeProcesses()]);

    // Wait a few seconds before deleting files because they may still locked by software processes
    await sleep(2000);
    cleanupFiles();
  }
  signal.addEventListener('abort', onAbort, { once: true });

  await assertVideoGenerationIsPossible(parameters);

  throwIfAborted(signal);

  await cleanupFiles();

  const cameras = await fetchCameras(game);
  if (game === Game.CSGO) {
    await createCsgoVideoJsonFile({
      type: 'record',
      recordingSystem,
      recordingOutput,
      encoderSoftware,
      outputFolderPath,
      framerate,
      demoPath,
      sequences,
      closeGameAfterRecording,
      tickrate,
      ffmpegSettings,
    });
  } else {
    const players = await fetchMatchPlayersSlots(checksum);
    await createCs2VideoJsonFile({
      type: 'record',
      recordingSystem,
      recordingOutput,
      encoderSoftware,
      outputFolderPath,
      framerate,
      demoPath,
      sequences,
      closeGameAfterRecording,
      tickrate,
      players,
      cameras,
      ffmpegSettings,
    });
  }

  throwIfAborted(signal);

  const shouldGenerateVideo = recordingOutput !== RecordingOutput.Images;
  try {
    if (recordingSystem === RecordingSystem.HLAE) {
      await watchDemoWithHlae({
        demoPath,
        game,
        width,
        height,
        displayMode: DisplayMode.Windowed,
        signal,
        uninstallPluginOnExit: false,
        registerFfmpegLocation: shouldGenerateVideo,
        onGameStart: parameters.onGameStart,
      });
    } else {
      await startCounterStrike({
        game,
        demoPath,
        displayMode: DisplayMode.Windowed,
        width,
        height,
        signal,
        uninstallPluginOnExit: false,
        onGameStart: parameters.onGameStart,
      });
    }

    throwIfAborted(signal);

    if (shouldGenerateVideo) {
      await buildVideos(parameters);
      if (recordingOutput === RecordingOutput.Video) {
        await deleteSequencesRawFiles(parameters);
      }
    }

    const shouldKeepRawFiles = recordingOutput !== RecordingOutput.Video;
    if (shouldKeepRawFiles) {
      if (recordingSystem === RecordingSystem.CounterStrike) {
        onMoveFilesStart();
        await moveStartMovieFilesToOutputFolder({
          sequences,
          outputFolderPath,
          game,
        });
      } else {
        onMoveFilesStart();
        await moveHlaeRawFilesToOutputFolder({
          sequences,
          outputFolderPath,
          game,
        });
      }
    }

    await cleanupFiles();
    logger.debug(`Generating video with id ${videoId} ended`);
  } catch (error) {
    if (signal.aborted) {
      throw abortError;
    }

    cleanupFiles();
    throw error;
  } finally {
    await uninstallCounterStrikeServerPlugin(game);
  }
}
