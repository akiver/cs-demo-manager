import React, { memo } from 'react';
import { useViewerContext } from './use-viewer-context';
import { formatMillisecondsToTimer } from 'csdm/ui/shared/format-milliseconds-to-timer';

export const Timer = memo(() => {
  const { timeRemaining, bombPlanted, currentFrame, framerate, round } = useViewerContext();
  const remainingTimer = formatMillisecondsToTimer(timeRemaining);
  const isBombPlanted = bombPlanted !== null && bombPlanted.frame <= currentFrame;
  const elapsedFrameCount = currentFrame - round.freezetimeEndFrame;
  const elapsedTimer = formatMillisecondsToTimer((elapsedFrameCount / framerate) * 1000);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 py-4 px-8 bg-gray-200 rounded flex gap-4">
      <p className={`text-body-strong ${isBombPlanted ? 'text-red-700' : ''}`}>{remainingTimer}</p>
      <p>/</p>
      <p className="text-body-strong">{elapsedTimer}</p>
    </div>
  );
});

Timer.displayName = 'Timer';
