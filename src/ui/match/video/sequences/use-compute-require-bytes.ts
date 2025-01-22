import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingSystem } from 'csdm/common/types/recording-system';

/**
 * Maps CRF (Constant Rate Factor) to bitrate factor for libx264 (the default codec used).
 * CRF values range from 0 (highest quality) to 51 (lowest quality).
 * ! It's an approximation and is not 100% accurate.
 *
 * Reference points:
 * CRF:    0    10   23   32    44    51
 * Factor: 5.8  1.4  0.2  0.05  0.02  0.01
 */
function getCrfFactor(crf: number): number {
  const crfMap: [number, number][] = [
    [0, 5.8],
    [10, 1.4],
    [23, 0.2],
    [32, 0.05],
    [44, 0.02],
    [51, 0.01],
  ];

  if (crf <= crfMap[0][0]) {
    return crfMap[0][1];
  }

  if (crf >= crfMap[crfMap.length - 1][0]) {
    return crfMap[crfMap.length - 1][1];
  }

  for (let i = 0; i < crfMap.length - 1; i++) {
    const [lowerCrf, lowerFactor] = crfMap[i];
    const [upperCrf, upperFactor] = crfMap[i + 1];

    if (crf <= upperCrf) {
      const ratio = (crf - lowerCrf) / (upperCrf - lowerCrf);
      return lowerFactor + ratio * (upperFactor - lowerFactor);
    }
  }

  return 0.2;
}

export function useComputeRequiredBytes() {
  const { settings } = useVideoSettings();
  const { framerate, width, height, recordingSystem, encoderSoftware, recordingOutput, ffmpegSettings } = settings;

  return (startTick: number, endTick: number, tickrate: number) => {
    const tickCount = endTick - startTick;
    const seconds = tickCount / tickrate;

    if (framerate > 0 && startTick > 0 && endTick > 0 && endTick > startTick) {
      if (
        recordingSystem === RecordingSystem.HLAE &&
        recordingOutput === RecordingOutput.Video &&
        encoderSoftware === EncoderSoftware.FFmpeg
      ) {
        const { audioBitrate, constantRateFactor } = ffmpegSettings;
        const crfFactor = getCrfFactor(constantRateFactor);
        const video = (width * height * framerate * crfFactor) / 8;
        const audio = audioBitrate / 8;
        const bytes = (video + audio) * seconds;
        return bytes;
      }

      const tgaFileCount = seconds * framerate;
      const imageSize = (width * height * 24) / 8; // 24 bit depth
      const bytes = tgaFileCount * imageSize;
      return bytes;
    }

    return 0;
  };
}
