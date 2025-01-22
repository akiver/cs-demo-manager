import path from 'node:path';
import fs from 'fs-extra';
import { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceOutputFilePath } from 'csdm/node/video/generation/get-sequence-output-file-path';
import { getSequenceName } from 'csdm/node/video/generation/get-sequence-name';
import { getSequenceRawFiles } from 'csdm/node/video/generation/get-sequence-raw-files';
import { executeFfmpeg } from 'csdm/node/video/ffmpeg/execute-ffmpeg';
import type { VideoContainer } from 'csdm/common/types/video-container';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { RawFilesNotFoundError } from '../errors/raw-files-not-found';

function buildMergeVideoAndAudioArgs(videoFilePath: string, wavFilePath: string, outputPath: string) {
  return [`-i "${videoFilePath}"`, `-i "${wavFilePath}"`, '-c copy', '-map 0:v:0', '-map 1:a:0', `"${outputPath}"`];
}

type GenerateVideoWithFFmpegSettings = {
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  game: Game;
  outputFolderPath: string;
  framerate: number;
  videoContainer: VideoContainer;
  videoCodec: string;
  audioCodec: string;
  constantRateFactor: number;
  audioBitrate: number;
  sequence: Sequence;
  inputParameters: string;
  outputParameters: string;
};

async function getFFmpegArgs(settings: GenerateVideoWithFFmpegSettings) {
  const {
    recordingSystem,
    recordingOutput,
    game,
    sequence,
    outputFolderPath,
    framerate,
    audioBitrate,
    constantRateFactor,
    videoContainer,
    videoCodec,
    audioCodec,
    inputParameters,
    outputParameters,
  } = settings;
  const { tgaFiles, wavFilePath, videoFilePath } = await getSequenceRawFiles({
    recordingSystem,
    sequence,
    game,
    recordingOutput,
    videoContainer,
    outputFolderPath,
  });

  // It's important to create the output folder before running FFmpeg otherwise it will fail.
  await fs.ensureDir(outputFolderPath);

  const outputPath = getSequenceOutputFilePath(outputFolderPath, sequence, videoContainer);
  if (recordingSystem === RecordingSystem.HLAE && recordingOutput === RecordingOutput.Video) {
    if (!videoFilePath) {
      throw new RawFilesNotFoundError();
    }
    return buildMergeVideoAndAudioArgs(videoFilePath, wavFilePath, outputPath);
  }

  let rawFilesPathPattern: string;
  const sequenceRawFilesFolderPath = path.dirname(tgaFiles[0]);
  if (recordingSystem === RecordingSystem.HLAE) {
    rawFilesPathPattern = path.join(sequenceRawFilesFolderPath, '%05d.tga');
  } else {
    const sequenceName = getSequenceName(sequence);
    rawFilesPathPattern = path.join(
      sequenceRawFilesFolderPath,
      game === Game.CSGO ? `${sequenceName}%04d.tga` : `${sequenceName}%08d.tga`,
    );
  }

  const args: string[] = [
    '-y', // override the file if it exists
    `-framerate ${framerate}`,
  ];
  if (inputParameters !== '') {
    args.push(inputParameters);
  }
  args.push(`-i "${rawFilesPathPattern}"`);
  const wavFileExists = await fs.pathExists(wavFilePath);
  if (wavFileExists) {
    args.push(`-i "${wavFilePath}"`);
  }

  args.push(`-vcodec ${videoCodec}`);

  if (wavFileExists) {
    args.push(`-acodec ${audioCodec}`, `-b:a ${audioBitrate}K`);
  }

  if (outputParameters !== '') {
    args.push(outputParameters);
  } else {
    args.push(`-pix_fmt yuv420p`, `-crf ${constantRateFactor}`);
  }

  args.push(`"${outputPath}"`);

  return args;
}

export async function generateVideoWithFFmpeg(settings: GenerateVideoWithFFmpegSettings, signal: AbortSignal) {
  const args = await getFFmpegArgs(settings);
  await executeFfmpeg(args, signal);
}
