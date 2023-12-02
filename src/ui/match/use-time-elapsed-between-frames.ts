import { formatMillisecondsToTimer } from 'csdm/ui/shared/format-milliseconds-to-timer';

type Params = {
  frameRate: number;
  startFrame: number;
  endFrame: number;
};

export function useGetTimeElapsedBetweenFrames() {
  return (params: Params) => {
    const elapsedFrameCount = params.endFrame - params.startFrame;
    const millisecondsElapsed = (elapsedFrameCount / params.frameRate) * 1000;
    const timeElapsed = formatMillisecondsToTimer(millisecondsElapsed);

    return timeElapsed;
  };
}
