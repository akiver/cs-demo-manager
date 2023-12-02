import { Game } from 'csdm/common/types/counter-strike';
import { isHlaeInstalled } from 'csdm/node/video/hlae/is-hlae-installed';
import { generateVideoWithVirtualDub } from 'csdm/node/video/virtual-dub/generate-video-with-virtual-dub';
import { generateVideoWithFFmpeg } from 'csdm/node/video/ffmpeg/generate-video-with-ffmpeg';
import { concatenateVideosFromSequences } from 'csdm/node/video/ffmpeg/concatenate-videos-from-sequences';
import { createVdmFileForRecording } from 'csdm/node/video/create-vdm-file-for-recording';
import { deleteSequenceRawFiles } from 'csdm/node/video/sequences/delete-sequence-raw-files';
import type { HlaeOptions } from 'csdm/node/counter-strike/launcher/watch-demo-with-hlae';
import { watchDemoWithHlae } from 'csdm/node/counter-strike/launcher/watch-demo-with-hlae';
import { isVirtualDubInstalled } from 'csdm/node/video/virtual-dub/is-virtual-dub-installed';
import { VirtualDubNotInstalled } from 'csdm/node/video/errors/virtual-dub-not-installed';
import { isFfmpegInstalled } from 'csdm/node/video/ffmpeg/is-ffmpeg-installed';
import { FfmpegNotInstalled } from 'csdm/node/video/errors/ffmpeg-not-installed';
import { HlaeNotInstalled } from 'csdm/node/video/errors/hlae-not-installed';
import { getHlaeExecutablePath } from 'csdm/node/video/hlae/hlae-location';
import { isWindows } from 'csdm/node/os/is-windows';
import { killCounterStrikeProcesses } from 'csdm/node/counter-strike/kill-counter-strike-processes';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { deleteSequencesRawFiles } from 'csdm/node/video/sequences/delete-sequences-raw-files';
import { killFfmpegProcess } from 'csdm/node/video/ffmpeg/kill-ffmpeg-process';
import { killVirtualDubProcess } from 'csdm/node/video/virtual-dub/kill-virtual-dub-process';
import { deleteVdmFile } from 'csdm/node/counter-strike/launcher/delete-vdm-file';
import { deleteSequencesOutputFile } from 'csdm/node/video/sequences/delete-sequences-output-file';
import { abortError, throwIfAborted } from 'csdm/node/errors/abort-error';
import { NoSequencesFound } from 'csdm/node/video/errors/no-sequences-found';
import { assertSequencesAreNotOverlapping } from 'csdm/node/video/sequences/assert-sequences-are-not-overlapping';
import { killHlaeProcess } from 'csdm/node/video/hlae/kill-hlae-process';
import { sleep } from 'csdm/common/sleep';
import { sortSequencesByStartTick } from 'csdm/node/video/sequences/sort-sequences-by-start-tick';
import { assertSteamIsRunning } from 'csdm/node/counter-strike/launcher/assert-steam-is-running';
import { createJsonActionsFileForRecording } from 'csdm/node/video/create-json-actions-file-for-recording';
import { startCounterStrike } from 'csdm/node/counter-strike/launcher/start-counter-strike';
import { deleteJsonActionsFile } from 'csdm/node/counter-strike/json-actions-file/delete-json-actions-file';
import { moveSequencesRawFiles } from 'csdm/node/video/sequences/move-sequences-raw-files';
import type { Sequence } from 'csdm/common/types/sequence';

type FfmpegSettings = {
  audioBitrate: number;
  constantRateFactor: number;
  videoCodec: string;
  audioCodec: string;
  inputParameters: string;
  outputParameters: string;
};

type Options = {
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
  onSequenceStart: (sequenceNumber: number, sequenceCount: number) => void;
  onConcatenateSequencesStart: () => void;
  onSuccess: () => void;
};

async function buildVideos({ signal, generateOnlyRawFiles, onSuccess, ...options }: Options) {
  throwIfAborted(signal);

  if (generateOnlyRawFiles) {
    onSuccess();
    return;
  }

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

  for (const sequence of sequences) {
    onSequenceStart(sequence.number, sequences.length);

    if (encoderSoftware === EncoderSoftware.FFmpeg) {
      await generateVideoWithFFmpeg(
        {
          game,
          audioBitrate: ffmpegSettings.audioBitrate,
          constantRateFactor: ffmpegSettings.constantRateFactor,
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

    if (!concatenateSequences && deleteRawFilesAfterEncoding) {
      await deleteSequenceRawFiles(rawFilesFolderPath, sequence);
    }
  }

  if (concatenateSequences) {
    onConcatenateSequencesStart();
    await concatenateVideosFromSequences(
      {
        outputFolderPath,
        sequences,
        audioBitrate: ffmpegSettings.audioBitrate,
        constantRateFactor: ffmpegSettings.constantRateFactor,
        audioCodec: ffmpegSettings.audioCodec,
        videoCodec: ffmpegSettings.videoCodec,
        inputParameters: ffmpegSettings.inputParameters,
        outputParameters: ffmpegSettings.outputParameters,
      },
      signal,
    );
    if (deleteRawFilesAfterEncoding) {
      await deleteSequencesRawFiles(rawFilesFolderPath, sequences);
    }
  }

  onSuccess();
}

export async function generateVideos(options: Options) {
  const { signal } = options;
  throwIfAborted(signal);

  const cleanupFiles = () => {
    if (options.game === Game.CSGO) {
      deleteVdmFile(demoPath);
    } else {
      deleteJsonActionsFile(demoPath);
    }

    deleteSequencesRawFiles(rawFilesFolderPath, options.sequences);
    deleteSequencesOutputFile(outputFolderPath, options.sequences);
  };

  async function onAbort() {
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
    encoderSoftware,
    framerate,
    demoPath,
    generateOnlyRawFiles,
    showOnlyDeathNotices,
    width,
    height,
    rawFilesFolderPath,
    outputFolderPath,
    closeGameAfterRecording,
    tickrate,
    deathNoticesDuration,
    game,
  } = options;

  if (options.sequences.length === 0) {
    throw new NoSequencesFound();
  }

  const sequences = sortSequencesByStartTick(options.sequences);
  assertSequencesAreNotOverlapping(sequences, tickrate);

  if (isWindows) {
    if (!(await isHlaeInstalled())) {
      throw new HlaeNotInstalled();
    }

    if (!generateOnlyRawFiles && encoderSoftware === EncoderSoftware.VirtualDub && !(await isVirtualDubInstalled())) {
      throw new VirtualDubNotInstalled();
    }
  }

  if (!generateOnlyRawFiles && encoderSoftware === EncoderSoftware.FFmpeg && !(await isFfmpegInstalled())) {
    throw new FfmpegNotInstalled();
  }

  await assertSteamIsRunning();

  throwIfAborted(signal);

  await deleteSequencesRawFiles(rawFilesFolderPath, sequences);

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
    await createJsonActionsFileForRecording({
      rawFilesFolderPath,
      framerate,
      demoPath,
      sequences,
      closeGameAfterRecording,
      showOnlyDeathNotices,
      tickrate,
      deathNoticesDuration,
    });
  }

  throwIfAborted(signal);

  try {
    if (isWindows) {
      const hlaeExecutablePath = await getHlaeExecutablePath();
      const hlaeOptions: HlaeOptions = {
        demoPath,
        game,
        hlaeExecutablePath,
        width,
        height,
        signal,
        onGameExit: cleanupFiles,
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
        onGameStart: options.onGameStart,
      });
    }

    await moveSequencesRawFiles(sequences, rawFilesFolderPath, game);
    await buildVideos(options);
  } catch (error) {
    if (signal.aborted) {
      throw abortError;
    }

    cleanupFiles();
    throw error;
  }
}
