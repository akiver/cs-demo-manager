import React, { useRef, useState, useEffect } from 'react';
import { KillIndicator } from './kill-indicator';
import { FreezetimeEndIndicator } from './freezetime-end-indicator';
import { useViewerContext } from '../use-viewer-context';
import { BombExplodedIndicator } from './bomb-exploded-indicator';
import { BombPlantedIndicator } from './bomb-planted-indicator';

export function Timeline() {
  const { play, currentTick, round, kills, bombExploded, bombPlanted } = useViewerContext();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    setTimelineWidth(wrapper.clientWidth);

    const observer = new ResizeObserver(() => {
      if (wrapperRef.current) {
        setTimelineWidth(wrapperRef.current.clientWidth);
      }
    });

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, []);

  const tickToPlaybackBarX = (tick: number) => {
    const { startTick, endOfficiallyTick } = round;
    const elapsedPercent = (tick - startTick) / (endOfficiallyTick - startTick);
    const x = timelineWidth * elapsedPercent;

    return x;
  };

  const getPlayBarElapsedWidth = () => {
    const { startTick, endOfficiallyTick } = round;
    const elapsedPercent = (currentTick - startTick) / (endOfficiallyTick - startTick);
    const width = timelineWidth * elapsedPercent;
    return width;
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (wrapperRef.current === null) {
      return;
    }
    const rectangle = wrapperRef.current.getBoundingClientRect();
    const xCoordinate = event.clientX - rectangle.left;
    const playbackPercent = (xCoordinate * 100) / timelineWidth;
    const { startTick, endOfficiallyTick } = round;
    const newTick = Math.floor((playbackPercent * (endOfficiallyTick - startTick)) / 100 + startTick);
    play(newTick);
  };

  const elapsedTimeWidth = getPlayBarElapsedWidth();

  return (
    <div className="flex relative bg-gray-50 border-x border-x-gray-300 w-full" ref={wrapperRef} onClick={onClick}>
      <div
        className="bg-gray-300"
        style={{
          width: `${elapsedTimeWidth}px`,
        }}
      />
      <FreezetimeEndIndicator leftX={tickToPlaybackBarX(round.freezetimeEndTick)} />
      {kills.map((kill) => {
        const leftX = tickToPlaybackBarX(kill.tick);
        return <KillIndicator key={kill.id} leftX={leftX} kill={kill} />;
      })}
      {bombExploded !== null && (
        <BombExplodedIndicator
          key={`playback-bomb-exploded-${bombExploded.id}`}
          leftX={tickToPlaybackBarX(bombExploded.tick)}
          planterName={bombExploded.planterName}
          site={bombExploded.site}
          tick={bombExploded.tick}
        />
      )}
      {bombPlanted !== null && (
        <BombPlantedIndicator
          key={`playback-bomb-planted-${bombPlanted.id}`}
          leftX={tickToPlaybackBarX(bombPlanted.tick)}
          planterName={bombPlanted.planterName}
          site={bombPlanted.site}
          tick={bombPlanted.tick}
        />
      )}
    </div>
  );
}
