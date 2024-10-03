import { Game } from 'csdm/common/types/counter-strike';
import { generateVideoWithVirtualDub } from 'csdm/node/video/virtual-dub/generate-video-with-virtual-dub';
import { generateVideoWithFFmpeg } from 'csdm/node/video/ffmpeg/generate-video-with-ffmpeg';
import { concatenateVideosFromSequences } from 'csdm/node/video/ffmpeg/concatenate-videos-from-sequences';
import { createVdmFileForRecording } from 'csdm/node/video/create-vdm-file-for-recording';
import { deleteSequenceRawFiles } from 'csdm/node/video/sequences/delete-sequence-raw-files';
import type { HlaeOptions } from 'csdm/node/counter-strike/launcher/watch-demo-with-hlae';
import { watchDemoWithHlae } from 'csdm/node/counter-strike/launcher/watch-demo-with-hlae';
import { isWindows } from 'csdm/node/os/is-windows';
import { killCounterStrikeProcesses } from 'csdm/node/counter-strike/kill-counter-strike-processes';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { killFfmpegProcess } from 'csdm/node/video/ffmpeg/kill-ffmpeg-process';
import { killVirtualDubProcess } from 'csdm/node/video/virtual-dub/kill-virtual-dub-process';
import { deleteVdmFile } from 'csdm/node/counter-strike/launcher/delete-vdm-file';
import { deleteSequencesOutputFile } from 'csdm/node/video/sequences/delete-sequences-output-file';
import { abortError, throwIfAborted } from 'csdm/node/errors/abort-error';
import { killHlaeProcess } from 'csdm/node/video/hlae/kill-hlae-process';
import { sleep } from 'csdm/common/sleep';
import { sortSequencesByStartTick } from 'csdm/node/video/sequences/sort-sequences-by-start-tick';
import { createJsonActionsFileForRecording } from 'csdm/node/video/create-json-actions-file-for-recording';
import { startCounterStrike } from 'csdm/node/counter-strike/launcher/start-counter-strike';
import { deleteJsonActionsFile } from 'csdm/node/counter-strike/json-actions-file/delete-json-actions-file';
import { moveSequencesRawFiles } from 'csdm/node/video/sequences/move-sequences-raw-files';
import type { Sequence } from 'csdm/common/types/sequence';
import { VideoContainer } from 'csdm/common/types/video-container';
import { fetchMatchPlayersSlots } from '../database/match/fetch-match-players-slots';
import { assertVideoGenerationIsPossible } from './assert-video-generation-is-possible';
import { deleteSequencesRawFiles } from './sequences/delete-sequences-raw-files';
import { uninstallCs2ServerPlugin } from '../counter-strike/launcher/cs2-server-plugin';

type FfmpegSettings = {
  audioBitrate: number;
  constantRateFactor: number;
  videoContainer: VideoContainer;
  videoCodec: string;
  audioCodec: string;
  inputParameters: string;
  outputParameters: string;
};

type Parameters = {
  videoId: string;
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
  signal: AbortSignal;
  onGameStart: () => void;
  onMoveFilesStart: () => void;
  onSequenceStart: (sequenceNumber: number) => void;
  onConcatenateSequencesStart: () => void;
};

async function buildVideos({ signal, ...options }: Parameters) {
  throwIfAborted(signal);

  const {
    encoderSoftware,
    framerate,
    deleteRawFilesAfterEncoding,
    sequences,
    rawFilesFolderPath,
    outputFolderPath,
    concatenateSequences,
    ffmpegSettings,
    game,
    onSequenceStart,
    onConcatenateSequencesStart,
  } = options;
  const shouldConcatenate = concatenateSequences && sequences.length > 1;

  for (const sequence of sequences) {
    onSequenceStart(sequence.number);

    if (encoderSoftware === EncoderSoftware.FFmpeg) {
      await generateVideoWithFFmpeg(
        {
          game,
          audioBitrate: ffmpegSettings.audioBitrate,
          constantRateFactor: ffmpegSettings.constantRateFactor,
          videoContainer: ffmpegSettings.videoContainer,
          videoCodec: ffmpegSettings.videoCodec,
          audioCodec: ffmpegSettings.audioCodec,
          inputParameters: ffmpegSettings.inputParameters,
          outputParameters: ffmpegSettings.outputParameters,
          framerate,
          rawFilesFolderPath,
          outputFolderPath,
          sequence,
        },
        signal,
      );
    } else {
      await generateVideoWithVirtualDub(
        {
          game,
          framerate,
          rawFilesFolderPath,
          outputFolderPath,
          sequence,
        },
        signal,
      );
    }

    if (!shouldConcatenate && deleteRawFilesAfterEncoding) {
      await deleteSequenceRawFiles(rawFilesFolderPath, sequence);
    }
  }

  if (shouldConcatenate) {
    onConcatenateSequencesStart();
    await concatenateVideosFromSequences(
      {
        outputFolderPath,
        sequences,
        audioBitrate: ffmpegSettings.audioBitrate,
        constantRateFactor: ffmpegSettings.constantRateFactor,
        audioCodec: ffmpegSettings.audioCodec,
        videoCodec: ffmpegSettings.videoCodec,
        videoContainer: ffmpegSettings.videoContainer,
        inputParameters: ffmpegSettings.inputParameters,
        outputParameters: ffmpegSettings.outputParameters,
      },
      signal,
    );
    if (deleteRawFilesAfterEncoding) {
      for (const sequence of sequences) {
        await deleteSequenceRawFiles(rawFilesFolderPath, sequence);
      }
    }
  }
}

export async function generateVideo(parameters: Parameters) {
  logger.log(`Generating video with id ${parameters.videoId}`);

  const { signal } = parameters;
  throwIfAborted(signal);

  const cleanupFiles = async (deleteOutputFile = true, deleteRawFiles = true) => {
    logger.log(`Cleaning up files for video with id ${parameters.videoId}`);
    const promises: Promise<void>[] = [deleteVdmFile(demoPath), deleteJsonActionsFile(demoPath)];
    if (deleteRawFiles) {
      promises.push(deleteSequencesRawFiles(rawFilesFolderPath, parameters.sequences));
    }

    if (deleteOutputFile) {
      const videoContainer =
        parameters.encoderSoftware === EncoderSoftware.FFmpeg
          ? parameters.ffmpegSettings.videoContainer
          : VideoContainer.AVI;
      promises.push(deleteSequencesOutputFile(parameters.outputFolderPath, parameters.sequences, videoContainer));
    }
    await Promise.all(promises);
  };

  async function onAbort() {
    logger.log(`Aborting video generation with id ${parameters.videoId}`);
    if (isWindows) {
      await Promise.all([killHlaeProcess(), killVirtualDubProcess()]);
    }

    await Promise.all([killFfmpegProcess(), killCounterStrikeProcesses()]);

    // Wait a few seconds before deleting files because they may still locked by software processes
    await sleep(2000);
    cleanupFiles();
  }
  signal.addEventListener('abort', onAbort, { once: true });

  const {
    framerate,
    demoPath,
    rawFilesFolderPath,
    generateOnlyRawFiles,
    showOnlyDeathNotices,
    width,
    height,
    closeGameAfterRecording,
    tickrate,
    deathNoticesDuration,
    game,
  } = parameters;

  await assertVideoGenerationIsPossible(parameters);

  throwIfAborted(signal);

  await cleanupFiles();

  const sequences = sortSequencesByStartTick(parameters.sequences);
  if (game === Game.CSGO) {
    await createVdmFileForRecording({
      rawFilesFolderPath,
      framerate,
      demoPath,
      sequences,
      closeGameAfterRecording,
      showOnlyDeathNotices,
      tickrate,
      deathNoticesDuration,
    });
  } else {
    const playerSlots = await fetchMatchPlayersSlots(parameters.checksum);
    await createJsonActionsFileForRecording({
      framerate,
      demoPath,
      sequences,
      closeGameAfterRecording,
      showOnlyDeathNotices,
      deathNoticesDuration,
      tickrate,
      playerSlots,
    });
  }

  throwIfAborted(signal);

  try {
    if (isWindows) {
      const hlaeOptions: HlaeOptions = {
        demoPath,
        game,
        width,
        height,
        fullscreen: false,
        signal,
        uninstallPluginOnExit: false,
        gameParameters: null,
      };
      await watchDemoWithHlae(hlaeOptions);
    } else {
      await startCounterStrike({
        game,
        demoPath,
        fullscreen: false,
        width,
        height,
        signal,
        uninstallPluginOnExit: false,
        onGameStart: parameters.onGameStart,
      });
    }

    throwIfAborted(signal);

    parameters.onMoveFilesStart();
    await moveSequencesRawFiles(sequences, rawFilesFolderPath, game);

    if (generateOnlyRawFiles) {
      logger.log(`Generating raw files with id ${parameters.videoId} ended`);
      return;
    }

    await buildVideos(parameters);
    await cleanupFiles(false, parameters.deleteRawFilesAfterEncoding);

    logger.log(`Generating video with id ${parameters.videoId} ended`);
  } catch (error) {
    if (signal.aborted) {
      throw abortError;
    }

    cleanupFiles();
    throw error;
  } finally {
    await uninstallCs2ServerPlugin();
  }
}
