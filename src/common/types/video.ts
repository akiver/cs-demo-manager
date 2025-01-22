import type { FfmpegSettings } from 'csdm/node/settings/settings';
import type { Game } from './counter-strike';
import type { EncoderSoftware } from './encoder-software';
import type { Sequence } from './sequence';
import type { VideoStatus } from './video-status';
import type { ErrorCode } from '../error-code';
import type { RecordingOutput } from './recording-output';
import type { RecordingSystem } from './recording-system';

export type Video = {
  id: string;
  date: string;
  checksum: string;
  demoPath: string;
  mapName: string;
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
  ffmpegSettings: FfmpegSettings;
  outputFolderPath: string;
  sequences: Sequence[];
  output: string;
  status: VideoStatus;
  errorCode?: ErrorCode;
  currentSequence?: number;
};

export type AddVideoPayload = Omit<Video, 'id' | 'date' | 'status' | 'output'> & {
  id?: string;
  date?: string;
};
