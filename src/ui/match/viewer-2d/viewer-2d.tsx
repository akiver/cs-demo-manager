import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { PlaybackBar } from 'csdm/ui/match/viewer-2d/playback-bar/playback-bar';
import { TeamPanel } from 'csdm/ui/match/viewer-2d/teams-panel/team-panel';
import { Timer } from './timer';
import { KillsFeed } from './kills-feed';
import { RoundsBar } from './rounds-bar/rounds-bar';
import { useDrawPlayers } from './drawing/use-draw-players';
import { useDrawHostages } from './drawing/use-draw-hostages';
import { useDrawShots } from './drawing/use-draw-shots';
import { useDrawInfernos } from './drawing/use-draw-infernos';
import { useDrawGrenades } from './drawing/use-draw-grenades';
import { useViewerContext } from './use-viewer-context';
import { useCurrentMatch } from '../use-current-match';
import { useInteractiveMapCanvas } from '../../hooks/use-interactive-map-canvas';
import { useDrawMapRadar } from './drawing/use-draw-map-radar';
import { FullscreenProvider } from './fullscreen-provider';
import { useDrawDeaths } from './drawing/use-draw-deaths';
import { useDrawBombs } from './drawing/use-draw-bombs';
import { useDrawChickens } from './drawing/use-draw-chickens';

export function Viewer2D() {
  const match = useCurrentMatch();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrame = useRef(new Date());
  const animationIdRef = useRef(0);
  const { drawPlayers } = useDrawPlayers();
  const { drawHostages } = useDrawHostages();
  const { drawShots } = useDrawShots();
  const { drawChickens } = useDrawChickens();
  const { drawInfernos } = useDrawInfernos();
  const { drawGrenades } = useDrawGrenades();
  const { drawMapRadar } = useDrawMapRadar();
  const { drawDeaths } = useDrawDeaths();
  const { drawBombs } = useDrawBombs();
  const { speed, isPlaying, setIsPlaying, currentFrame, setCurrentFrame, round, changeRound, map, framerate } =
    useViewerContext();
  const interactiveCanvas = useInteractiveMapCanvas(canvasRef.current, map);
  const { canvasSize, setWrapper } = interactiveCanvas;

  useEffect(() => {
    if (canvasRef.current === null) {
      throw new Error('Canvas not ready');
    }

    canvasContextRef.current = canvasRef.current.getContext('2d');
  }, []);

  useLayoutEffect(() => {
    const animate = () => {
      animationIdRef.current = window.requestAnimationFrame(animate);

      const context = canvasContextRef.current;
      if (context === null) {
        return;
      }

      context.clearRect(0, 0, canvasSize.width, canvasSize.height);
      drawMapRadar(context, interactiveCanvas);
      drawPlayers(context, interactiveCanvas);
      drawHostages(context, interactiveCanvas);
      drawShots(context, interactiveCanvas);
      drawInfernos(context, interactiveCanvas);
      drawGrenades(context, interactiveCanvas);
      drawDeaths(context, interactiveCanvas);
      drawBombs(context, interactiveCanvas);
      drawChickens(context, interactiveCanvas);

      if (!isPlaying) {
        return;
      }

      const now = new Date();
      const elapsed = now.getTime() - lastFrame.current.getTime();
      if (elapsed >= 1000 / framerate / speed) {
        setCurrentFrame(currentFrame + Math.max(1, Math.floor(speed)));
        lastFrame.current = now;
      }

      if (currentFrame >= round.endOfficiallyFrame) {
        if (round.number < match.rounds.length) {
          changeRound(round.number + 1);
        } else {
          setIsPlaying(false);
        }
      }
    };

    animationIdRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationIdRef.current);
    };
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        default:
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isPlaying, setIsPlaying]);

  return (
    <FullscreenProvider>
      <div className="flex flex-1 justify-between relative overflow-y-auto bg-gray-50" ref={setWrapper}>
        <div className="absolute inset-0 size-full overflow-hidden">
          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} />
        </div>
        <Timer />
        <div className="absolute left-8 top-8 flex flex-col w-[352px] gap-y-8 overflow-auto">
          <TeamPanel teamNumber={round.teamASide} teamName={match.teamA.name} teamScore={round.teamAScore} />
          <TeamPanel teamNumber={round.teamBSide} teamName={match.teamB.name} teamScore={round.teamBScore} />
        </div>
        <KillsFeed />
      </div>
      <RoundsBar />
      <PlaybackBar />
    </FullscreenProvider>
  );
}
