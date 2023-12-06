import path from 'node:path';
import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceOutputFilePath } from 'csdm/node/video/sequences/get-sequence-output-file-path';
import { deleteSequencesOutputFile } from 'csdm/node/video/sequences/delete-sequences-output-file';
import { executeFfmpeg } from 'csdm/node/video/ffmpeg/execute-ffmpeg';

function computeComplexFilter(sequences: Sequence[]) {
  const streams: string[] = [];
  for (const [sequenceIndex] of sequences.entries()) {
    streams.push(`[${sequenceIndex}:v][${sequenceIndex}:a]`);
  }

  return `-filter_complex ${streams.join('')}concat=n=${sequences.length}:v=1:a=1`;
}

type ConcatenateVideoOptions = {
  sequences: Sequence[];
  outputFolderPath: string;
  videoCodec: string;
  audioCodec: string;
  constantRateFactor: number;
  audioBitrate: number;
  inputParameters: string;
  outputParameters: string;
};

function getFfmpegArgs(options: ConcatenateVideoOptions) {
  const {
    audioBitrate,
    audioCodec,
    constantRateFactor,
    inputParameters,
    outputFolderPath,
    outputParameters,
    sequences,
    videoCodec,
  } = options;

  const args: string[] = [];
  args.push('-y'); // override the file if it exists
  if (inputParameters !== '') {
    args.push(inputParameters);
  }
  for (const sequence of sequences) {
    const sequenceOutputFilePath = getSequenceOutputFilePath(outputFolderPath, sequence);
    args.push(`-i "${sequenceOutputFilePath}"`);
  }
  args.push(
    `-vcodec ${videoCodec} -pix_fmt yuv420p`,
    `-crf ${constantRateFactor}`,
    `-acodec ${audioCodec}`,
    `-b:a ${audioBitrate}K`,
    computeComplexFilter(sequences),
  );
  if (outputParameters !== '') {
    args.push(outputParameters);
  }
  args.push(`"${path.join(outputFolderPath, 'output.avi')}"`);

  return args;
}

export async function concatenateVideosFromSequences(options: ConcatenateVideoOptions, signal: AbortSignal) {
  const args: string[] = getFfmpegArgs(options);
  await executeFfmpeg(args, signal);
  await deleteSequencesOutputFile(options.outputFolderPath, options.sequences);
}
