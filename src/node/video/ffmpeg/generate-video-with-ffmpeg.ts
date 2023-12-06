import path from 'node:path';
import { Game } from 'csdm/common/types/counter-strike';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceOutputFilePath } from 'csdm/node/video/sequences/get-sequence-output-file-path';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSequenceName } from 'csdm/node/video/sequences/get-sequence-name';
import { getSequenceRawFiles } from 'csdm/node/video/sequences/get-sequence-raw-files';
import { executeFfmpeg } from 'csdm/node/video/ffmpeg/execute-ffmpeg';

type GenerateVideoWithFFmpegSettings = {
  game: Game;
  rawFilesFolderPath: string;
  outputFolderPath: string;
  framerate: number;
  videoCodec: string;
  audioCodec: string;
  constantRateFactor: number;
  audioBitrate: number;
  sequence: Sequence;
  inputParameters: string;
  outputParameters: string;
};

async function getFFmpegArgs(settings: GenerateVideoWithFFmpegSettings) {
  let rawFilesPathPattern: string;
  const {
    game,
    sequence,
    outputFolderPath,
    framerate,
    audioBitrate,
    constantRateFactor,
    videoCodec,
    audioCodec,
    inputParameters,
    rawFilesFolderPath,
    outputParameters,
  } = settings;
  const { tgaFiles, wavFilePath } = await getSequenceRawFiles(sequence, rawFilesFolderPath, game);
  const sequenceRawFilesFolderPath = path.dirname(tgaFiles[0]);
  if (isWindows && game === Game.CSGO) {
    rawFilesPathPattern = path.join(sequenceRawFilesFolderPath, '%05d.tga');
  } else {
    const sequenceName = getSequenceName(sequence);
    rawFilesPathPattern = path.join(sequenceRawFilesFolderPath, `${sequenceName}%04d.tga`);
  }

  const args: string[] = [
    '-y', // override the file if it exists
    '-f image2',
    `-framerate ${framerate}`,
  ];
  if (inputParameters !== '') {
    args.push(inputParameters);
  }
  args.push(
    `-i "${rawFilesPathPattern}"`,
    `-i "${wavFilePath}"`,
    `-vcodec ${videoCodec} -pix_fmt yuv420p`,
    `-crf ${constantRateFactor}`,
    `-acodec ${audioCodec}`,
    `-b:a ${audioBitrate}K`,
  );
  if (outputParameters !== '') {
    args.push(outputParameters);
  }
  args.push('"' + getSequenceOutputFilePath(outputFolderPath, sequence) + '"');

  return args;
}

export async function generateVideoWithFFmpeg(settings: GenerateVideoWithFFmpegSettings, signal: AbortSignal) {
  const args = await getFFmpegArgs(settings);
  await executeFfmpeg(args, signal);
}
