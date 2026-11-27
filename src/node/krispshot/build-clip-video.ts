import type { Demo } from 'csdm/common/types/demo';
import type { AddVideoPayload } from 'csdm/common/types/video';
import type { KrispShotClipJob } from 'csdm/common/types/krispshot';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { VideoContainer } from 'csdm/common/types/video-container';
import type { Sequence } from 'csdm/common/types/sequence';

/**
 * Turns a website clip job into a video for this app's own video queue: one sequence per part, the camera on the
 * player, game audio on. The parts are written as near-lossless MKV (x264 CRF 14 + PCM); the worker makes the final
 * MP4 with the HUD afterwards.
 */
export function buildClipVideo(job: KrispShotClipJob, demo: Demo, outputFolderPath: string): AddVideoPayload {
  const recording = job.recording;
  const isHlae = recording.recordingSystem === 'HLAE';
  const playersOptions =
    isHlae && recording.killfeed === 'player'
      ? [
          {
            playerName: job.playerName,
            steamId: job.steamId,
            showKill: true,
            highlightKill: true,
            isVoiceEnabled: true,
          },
        ]
      : [];
  const sequences: Sequence[] = job.segments.map((segment, index) => ({
    number: index + 1,
    startTick: segment.startTick,
    endTick: segment.endTick,
    showXRay: false,
    showAssists: true,
    showOnlyDeathNotices: recording.showOnlyDeathNotices,
    playersOptions,
    playerCameras: [{ tick: segment.startTick, playerSteamId: job.steamId, playerName: job.playerName }],
    cameras: [],
    playerVoicesEnabled: recording.playerVoices,
    recordAudio: true,
    deathNoticesDuration: recording.deathNoticesSeconds,
    cfg: recording.cfg.trim() === '' ? undefined : recording.cfg.replace(/\r/g, ''),
  }));

  return {
    checksum: demo.checksum,
    demoPath: demo.filePath,
    mapName: demo.mapName,
    game: demo.game,
    tickrate: demo.tickrate,
    recordingSystem: isHlae ? RecordingSystem.HLAE : RecordingSystem.CounterStrike,
    recordingOutput: RecordingOutput.Video,
    encoderSoftware: EncoderSoftware.FFmpeg,
    framerate: recording.framerate,
    width: recording.width,
    height: recording.height,
    closeGameAfterRecording: true,
    keepRawFilesOnGameError: false,
    concatenateSequences: false,
    outputFileName: `clip-${job.id}`,
    trueView: recording.trueView,
    ffmpegSettings: {
      audioBitrate: 320,
      constantRateFactor: 14,
      customLocationEnabled: false,
      customExecutableLocation: '',
      videoContainer: VideoContainer.MKV,
      videoCodec: 'libx264',
      audioCodec: 'pcm_s16le',
      inputParameters: '',
      outputParameters: '',
    },
    outputFolderPath,
    sequences,
  };
}
