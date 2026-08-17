import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import type { Sequence } from 'csdm/common/types/sequence';
import { VideoContainer } from 'csdm/common/types/video-container';
import { createCs2VideoJsonFile } from './create-cs2-video-json-file';
import { createCsgoVideoJsonFile } from './create-csgo-video-json-file';

const sequence: Sequence = {
  number: 1,
  startTick: 1000,
  endTick: 2000,
  showXRay: false,
  showAssists: true,
  showOnlyDeathNotices: true,
  playersOptions: [],
  playerCameras: [],
  cameras: [],
  playerVoicesEnabled: false,
  recordAudio: false,
  deathNoticesDuration: 5,
};

function ffmpegPresetCommand(content: string) {
  const sequences = JSON.parse(content) as Array<{ actions: Array<{ cmd: string }> }>;
  const command = sequences
    .flatMap((item) => item.actions)
    .find((action) => action.cmd.includes('mirv_streams settings add ffmpeg'))?.cmd;

  expect(command).toBeDefined();
  return command as string;
}

async function withDemoJson(run: (demoPath: string) => Promise<void>) {
  const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'csdm-crf-'));
  try {
    await run(path.join(folderPath, 'demo.dem'));
  } finally {
    await fs.rm(folderPath, { recursive: true, force: true });
  }
}

describe('FFmpeg quality 0 in HLAE presets', () => {
  it('emits CRF 1 for libx264 quality 0 on the CS2 FFmpeg preset', async () => {
    await withDemoJson(async (demoPath) => {
      await createCs2VideoJsonFile({
        type: 'record',
        recordingSystem: RecordingSystem.HLAE,
        recordingOutput: RecordingOutput.Video,
        encoderSoftware: EncoderSoftware.FFmpeg,
        outputFolderPath: path.dirname(demoPath),
        framerate: 30,
        demoPath,
        sequences: [sequence],
        closeGameAfterRecording: true,
        trueView: false,
        tickrate: 64,
        players: [],
        cameras: [],
        ffmpegSettings: {
          constantRateFactor: 0,
          videoContainer: VideoContainer.AVI,
          videoCodec: 'libx264',
          outputParameters: '',
        },
      });

      const command = ffmpegPresetCommand(await fs.readFile(`${demoPath}.json`, 'utf8'));
      expect(command).toContain('-crf 1');
      expect(command).not.toContain('-crf 0');
    });
  });

  it('emits CRF 0 for libx265 quality 0 on the CS2 FFmpeg preset', async () => {
    await withDemoJson(async (demoPath) => {
      await createCs2VideoJsonFile({
        type: 'record',
        recordingSystem: RecordingSystem.HLAE,
        recordingOutput: RecordingOutput.Video,
        encoderSoftware: EncoderSoftware.FFmpeg,
        outputFolderPath: path.dirname(demoPath),
        framerate: 30,
        demoPath,
        sequences: [sequence],
        closeGameAfterRecording: true,
        trueView: false,
        tickrate: 64,
        players: [],
        cameras: [],
        ffmpegSettings: {
          constantRateFactor: 0,
          videoContainer: VideoContainer.AVI,
          videoCodec: 'libx265',
          outputParameters: '',
        },
      });

      const command = ffmpegPresetCommand(await fs.readFile(`${demoPath}.json`, 'utf8'));
      expect(command).toContain('-c:v libx265');
      expect(command).toContain('-crf 0');
    });
  });

  it('emits CRF 1 for libx264 quality 0 on the CS:GO FFmpeg preset', async () => {
    await withDemoJson(async (demoPath) => {
      await createCsgoVideoJsonFile({
        type: 'record',
        recordingSystem: RecordingSystem.HLAE,
        recordingOutput: RecordingOutput.Video,
        encoderSoftware: EncoderSoftware.FFmpeg,
        outputFolderPath: path.dirname(demoPath),
        framerate: 30,
        demoPath,
        sequences: [sequence],
        closeGameAfterRecording: true,
        tickrate: 64,
        ffmpegSettings: {
          constantRateFactor: 0,
          videoContainer: VideoContainer.AVI,
          videoCodec: 'libx264',
          outputParameters: '',
        },
      });

      const command = ffmpegPresetCommand(await fs.readFile(`${demoPath}.json`, 'utf8'));
      expect(command).toContain('-crf 1');
      expect(command).not.toContain('-crf 0');
    });
  });
});
