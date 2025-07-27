import React, { useRef } from 'react';
import { KillIndicator } from './kill-indicator';
import { FreezetimeEndIndicator } from './freezetime-end-indicator';
import { useViewerContext } from '../use-viewer-context';
import { BombExplodedIndicator } from './bomb-exploded-indicator';
import { BombPlantedIndicator } from './bomb-planted-indicator';

export function Timeline() {
  const { play, currentTick, round, kills, bombExploded, bombPlanted } = useViewerContext();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const getTimelineWidth = () => {
    const wrapper = wrapperRef.current;
    if (wrapper === null) {
      return 0;
    }

    return wrapper.clientWidth;
  };

  const tickToPlaybackBarX = (tick: number) => {
    const { startTick, endOfficiallyTick } = round;
    const elapsedPercent = (tick - startTick) / (endOfficiallyTick - startTick);
    const x = getTimelineWidth() * elapsedPercent;

    return x;
  };

  const getPlayBarElapsedWidth = () => {
    const { startTick, endOfficiallyTick } = round;
    const elapsedPercent = (currentTick - startTick) / (endOfficiallyTick - startTick);
    const width = getTimelineWidth() * elapsedPercent;
    return width;
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (wrapperRef.current === null) {
      return;
    }
    const rectangle = wrapperRef.current.getBoundingClientRect();
    const xCoordinate = event.clientX - rectangle.left;
    const playbackPercent = (xCoordinate * 100) / getTimelineWidth();
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
