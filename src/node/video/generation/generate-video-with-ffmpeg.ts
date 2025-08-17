import path from 'node:path';
import fs from 'fs-extra';
import { tmpdir } from 'node:os';
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

async function convertGameAudioFile(
  wavFilePath: string,
  audioCodec: string,
  audioBitrate: number,
  signal: AbortSignal,
) {
  const codecs = [
    { name: 'mp3', ext: '.mp3' },
    { name: 'aac', ext: '.m4a' },
    { name: 'alac', ext: '.m4a' },
    { name: 'opus', ext: '.opus' },
    { name: 'flac', ext: '.flac' },
    { name: 'vorbis', ext: '.ogg' },
    { name: 'ac3', ext: '.ac3' },
  ];
  let extension = '.wav';
  for (const codec of codecs) {
    if (audioCodec.includes(codec.name)) {
      extension = codec.ext;
      break;
    }
  }

  const tmpFilePath = path.join(tmpdir(), `csdm-audio${extension}`);
  const args = [
    '-y', // override the file if it exists
    '-i',
    `"${wavFilePath}"`,
    '-acodec',
    audioCodec,
    '-b:a',
    `${audioBitrate}K`,
    `"${tmpFilePath}"`,
  ];

  await executeFfmpeg(args, signal);

  const audioFilePath = wavFilePath.replace(/\.wav$/, extension);
  await fs.move(tmpFilePath, audioFilePath, { overwrite: true });

  return audioFilePath;
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

export async function generateVideoWithFFmpeg(settings: GenerateVideoWithFFmpegSettings, signal: AbortSignal) {
  const { tgaFiles, wavFilePath, videoFilePath } = await getSequenceRawFiles(settings);

  const {
    framerate,
    inputParameters,
    videoCodec,
    audioCodec,
    audioBitrate,
    constantRateFactor,
    outputParameters,
    recordingSystem,
    game,
    sequence,
    outputFolderPath,
    videoContainer,
    recordingOutput,
  } = settings;

  // It's important to create the output folder before running FFmpeg otherwise it will fail.
  await fs.ensureDir(outputFolderPath);

  const outputPath = getSequenceOutputFilePath(outputFolderPath, sequence, videoContainer);
  if (recordingSystem === RecordingSystem.HLAE && recordingOutput === RecordingOutput.Video) {
    if (!videoFilePath) {
      throw new RawFilesNotFoundError();
    }
    // The game generates PCM audio, we need to convert it to the desired format
    const audioFilePath = await convertGameAudioFile(wavFilePath, audioCodec, audioBitrate, signal);
    const args = [
      '-y', // override the file if it exists
    ];

    if (inputParameters !== '') {
      args.push(inputParameters);
    }

    args.push(
      ...[`-i "${videoFilePath}"`, `-i "${audioFilePath}"`, '-c copy', '-map 0:v:0', '-map 1:a:0', `"${outputPath}"`],
    );

    if (outputParameters !== '') {
      args.push(outputParameters);
    }

    return await executeFfmpeg(args, signal);
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

  const wavFileExists = await fs.pathExists(wavFilePath);
  const args: string[] = [
    '-y', // override the file if it exists
    `-framerate ${framerate}`,
  ];
  if (inputParameters !== '') {
    args.push(inputParameters);
  }
  args.push(`-i "${rawFilesPathPattern}"`);
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

  await executeFfmpeg(args, signal);
}
