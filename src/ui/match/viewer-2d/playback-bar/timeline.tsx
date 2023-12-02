import React, { useRef } from 'react';
import { KillIndicator } from './kill-indicator';
import { FreezetimeEndIndicator } from './freezetime-end-indicator';
import { useViewerContext } from '../use-viewer-context';
import { BombExplodedIndicator } from './bomb-exploded-indicator';
import { BombPlantedIndicator } from './bomb-planted-indicator';

export function Timeline() {
  const { setIsPlaying, setCurrentFrame, currentFrame, round, kills, isPlaying, bombExploded, bombPlanted } =
    useViewerContext();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const getTimelineWidth = () => {
    const wrapper = wrapperRef.current;
    if (wrapper === null) {
      return 0;
    }

    return wrapper.clientWidth;
  };

  const frameToPlaybackBarX = (frame: number) => {
    const { startFrame, endOfficiallyFrame } = round;
    const elapsedPercent = (frame - startFrame) / (endOfficiallyFrame - startFrame);
    const x = getTimelineWidth() * elapsedPercent;

    return x;
  };

  const getPlayBarElapsedWidth = () => {
    const { startFrame, endOfficiallyFrame } = round;
    const elapsedPercent = (currentFrame - startFrame) / (endOfficiallyFrame - startFrame);
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
    const { startFrame, endOfficiallyFrame } = round;
    setCurrentFrame(Math.floor((playbackPercent * (endOfficiallyFrame - startFrame)) / 100 + startFrame));

    if (!isPlaying) {
      setIsPlaying(true);
    }
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
      <FreezetimeEndIndicator leftX={frameToPlaybackBarX(round.freezetimeEndFrame)} />
      {kills.map((kill) => {
        const leftX = frameToPlaybackBarX(kill.frame);
        return (
          <KillIndicator
            key={`playback-kill-${kill.victimSide}-${kill.frame}-${kill.victimSteamId}`}
            leftX={leftX}
            kill={kill}
          />
        );
      })}
      {bombExploded !== null && (
        <BombExplodedIndicator
          key={`playback-bomb-exploded-${bombExploded.frame}-${bombExploded.site}`}
          leftX={frameToPlaybackBarX(bombExploded.frame)}
          planterName={bombExploded.planterName}
          site={bombExploded.site}
          frame={bombExploded.frame}
        />
      )}
      {bombPlanted !== null && (
        <BombPlantedIndicator
          key={`playback-bomb-planted-${bombPlanted.frame}-${bombPlanted.site}`}
          leftX={frameToPlaybackBarX(bombPlanted.frame)}
          planterName={bombPlanted.planterName}
          site={bombPlanted.site}
          frame={bombPlanted.frame}
        />
      )}
    </div>
  );
}
