import { formatMillisecondsToTimer } from 'csdm/ui/shared/format-milliseconds-to-timer';

type Params = {
  tickrate: number;
  startTick: number;
  endTick: number;
};

export function getTimeElapsedBetweenTicks(params: Params) {
  const elapsedTickCount = params.endTick - params.startTick;
  const millisecondsElapsed = (elapsedTickCount / params.tickrate) * 1000;
  const timeElapsed = formatMillisecondsToTimer(millisecondsElapsed);

  return timeElapsed;
}
