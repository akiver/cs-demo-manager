import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import type { AddVideoPayload } from 'csdm/common/types/video';
import { VideoStatus } from 'csdm/common/types/video-status';

vi.mock('csdm/server/server', () => {
  return {
    server: {
      sendPushMessage: vi.fn(),
    },
  };
});
vi.mock('csdm/node/video/generation/generate-video', () => {
  return {
    generateVideo: vi.fn(() => {
      // Never resolves: the video stays in progress for the duration of the test.
      return new Promise(() => {});
    }),
  };
});

vi.stubGlobal('logger', {
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

const { videoQueue } = await import('./video-queue');

function buildPayload(): AddVideoPayload {
  return {
    checksum: 'checksum',
    demoPath: '/demos/demo.dem',
    mapName: 'de_dust2',
    game: 'CS2',
    tickrate: 64,
    recordingSystem: 'HLAE',
    recordingOutput: 'video',
    encoderSoftware: 'FFmpeg',
    framerate: 60,
    width: 1920,
    height: 1080,
    closeGameAfterRecording: true,
    concatenateSequences: false,
    outputFileName: 'sequence-{sequenceNumber}',
    ffmpegSettings: {
      customExecutableLocation: '',
      audioBitrate: 256,
      constantRateFactor: 23,
      videoCodec: 'libx264',
      audioCodec: 'aac',
      videoContainer: 'mp4',
      inputParameters: '',
      outputParameters: '',
    },
    outputFolderPath: '/videos',
    sequences: [],
    trueView: false,
  } as unknown as AddVideoPayload;
}

describe('videoQueue', () => {
  beforeEach(() => {
    const pendingVideoIds = videoQueue.getVideos().map(({ id }) => id);
    if (pendingVideoIds.length > 0) {
      videoQueue.removeVideos(pendingVideoIds);
    }
    videoQueue.pause();
  });

  it('should return the created video with a generated id and a nested output folder', () => {
    const video = videoQueue.addVideo(buildPayload());

    expect(video.id).not.toBe('');
    expect(video.status).toBe(VideoStatus.Pending);
    expect(video.outputFolderPath).toContain(video.id);
  });

  it('should keep the output folder as it is when updating an existing video', () => {
    const payload = buildPayload();
    payload.id = 'existing-id';
    const video = videoQueue.addVideo(payload);

    expect(video.id).toBe('existing-id');
    expect(video.outputFolderPath).toBe('/videos');
  });

  it('should not be busy when the queue is paused with pending videos', () => {
    videoQueue.addVideo(buildPayload());

    expect(videoQueue.getIsPaused()).toBe(true);
    expect(videoQueue.isBusy()).toBe(false);
  });

  it('should be busy while a video is being processed', () => {
    videoQueue.addVideo(buildPayload());
    videoQueue.resume();

    expect(videoQueue.getIsPaused()).toBe(false);
    expect(videoQueue.isBusy()).toBe(true);
  });

  it('should remove only the pending videos queued by the given client', () => {
    const cliVideo = videoQueue.addVideo(buildPayload(), 'cli-client-1');
    const otherCliVideo = videoQueue.addVideo(buildPayload(), 'cli-client-2');
    const rendererVideo = videoQueue.addVideo(buildPayload());

    videoQueue.removeVideosAddedByClient('cli-client-1');

    const remainingVideoIds = videoQueue.getVideos().map(({ id }) => id);
    expect(remainingVideoIds).not.toContain(cliVideo.id);
    expect(remainingVideoIds).toContain(otherCliVideo.id);
    expect(remainingVideoIds).toContain(rendererVideo.id);
  });

  it('should abort the video being processed when its client is removed', () => {
    videoQueue.addVideo(buildPayload(), 'cli-client-1');
    videoQueue.resume();
    expect(videoQueue.isBusy()).toBe(true);

    videoQueue.removeVideosAddedByClient('cli-client-1');

    expect(videoQueue.getVideos()).toHaveLength(0);
    expect(videoQueue.isBusy()).toBe(false);
  });
});
