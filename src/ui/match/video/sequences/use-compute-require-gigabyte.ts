import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { roundNumber } from 'csdm/common/math/round-number';

export function useComputeRequiredGigabyte() {
  const { settings } = useVideoSettings();
  const { framerate, width, height } = settings;

  return (startTick: number, endTick: number, tickrate: number) => {
    if (framerate > 0 && startTick > 0 && endTick > 0 && endTick > startTick) {
      const tickCount = endTick - startTick;
      const ratio = tickCount / tickrate;
      const tgaFileCount = ratio * framerate;
      const imageSize = (width * height * 24) / 8 / 1024 / 1024; // 24 bit depth
      const totalImageSize = (tgaFileCount * imageSize) / 1024;
      return roundNumber(totalImageSize, 2);
    }

    return 0;
  };
}
