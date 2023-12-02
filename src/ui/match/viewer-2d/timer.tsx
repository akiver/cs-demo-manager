import React, { memo } from 'react';
import { useViewerContext } from './use-viewer-context';
import { formatMillisecondsToTimer } from 'csdm/ui/shared/format-milliseconds-to-timer';

export const Timer = memo(() => {
  const { timeRemaining, bombPlanted, currentFrame } = useViewerContext();
  const timer = formatMillisecondsToTimer(timeRemaining);
  const isBombPlanted = bombPlanted !== null && bombPlanted.frame <= currentFrame;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 py-4 px-8 bg-gray-200 rounded">
      <p className={`text-body-strong ${isBombPlanted ? 'text-red-700' : ''}`}>{timer}</p>
    </div>
  );
});

Timer.displayName = 'Timer';
