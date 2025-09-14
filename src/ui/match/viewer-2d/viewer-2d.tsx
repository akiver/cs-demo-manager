import React, { useRef, useEffect, useLayoutEffect } from 'react';
import clsx from 'clsx';
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
import { useDrawableCanvas } from './drawing/use-drawable-canvas';
import { isCtrlOrCmdEvent } from 'csdm/ui/keyboard/keyboard';

export function Viewer2D() {
  const match = useCurrentMatch();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingCanvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastRenderTime = useRef(performance.now());
  const animationIdRef = useRef(0);
  const isHoldingSpace = useRef(false);
  const { drawPlayers } = useDrawPlayers();
  const { drawHostages } = useDrawHostages();
  const { drawShots } = useDrawShots();
  const { drawChickens } = useDrawChickens();
  const { drawInfernos } = useDrawInfernos();
  const { drawGrenades } = useDrawGrenades();
  const { drawMapRadar } = useDrawMapRadar();
  const { drawDeaths } = useDrawDeaths();
  const { drawBombs } = useDrawBombs();
  const {
    toggleMode,
    speed,
    isPlaying,
    playPause,
    pause,
    currentTick,
    tickrate,
    setCurrentTick,
    round,
    changeRound,
    map,
    shouldDrawBombs,
    lowerRadarOffsetX,
    lowerRadarOffsetY,
    drawingTool,
    drawingSize,
    drawingColor,
    isDrawingMode,
  } = useViewerContext();
  const interactiveCanvas = useInteractiveMapCanvas(canvasRef.current, map, lowerRadarOffsetX, lowerRadarOffsetY);
  const drawing = useDrawableCanvas({
    canvas: drawingCanvasRef.current,
    interactiveCanvas,
    isDrawingMode,
    tool: {
      type: drawingTool,
      color: drawingColor,
      size: drawingSize,
    },
  });
  const { undo, redo, clear, drawStrokes } = drawing;
  const { canvasSize, setWrapper } = interactiveCanvas;

  useEffect(() => {
    if (canvasRef.current === null) {
      throw new Error('Canvas not ready');
    }

    if (drawingCanvasRef.current === null) {
      throw new Error('Drawing canvas not ready');
    }

    canvasContextRef.current = canvasRef.current.getContext('2d');
    drawingCanvasContextRef.current = drawingCanvasRef.current.getContext('2d');
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
      if (shouldDrawBombs) {
        drawBombs(context, interactiveCanvas);
      }
      drawChickens(context, interactiveCanvas);

      if (drawingCanvasContextRef.current) {
        drawStrokes(drawingCanvasContextRef.current);
      }

      if (!isPlaying) {
        lastRenderTime.current = performance.now();
        return;
      }

      const now = performance.now();
      const elapsed = now - lastRenderTime.current;
      const ticksToAdvance = Math.floor((elapsed / 1000) * tickrate * speed);
      if (ticksToAdvance > 0) {
        setCurrentTick(currentTick + ticksToAdvance);
        lastRenderTime.current = performance.now() - (elapsed % (1000 / (tickrate * speed)));
      }

      if (currentTick >= round.endOfficiallyTick) {
        if (round.number < match.rounds.length) {
          changeRound(round.number + 1);
        } else {
          pause();
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
      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          if (isDrawingMode) {
            toggleMode();
            isHoldingSpace.current = true;
          } else if (!event.repeat) {
            playPause();
          }
          break;
        case 'escape':
          if (isDrawingMode) {
            event.preventDefault();
            toggleMode();
          }
          break;
        case 'd':
          event.preventDefault();
          toggleMode();
          break;
        case 'z':
          if (isCtrlOrCmdEvent(event)) {
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case 'x':
          if (isCtrlOrCmdEvent(event)) {
            event.preventDefault();
            clear();
          }
          break;
        default:
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
          if (isHoldingSpace.current) {
            event.preventDefault();
            toggleMode();
            isHoldingSpace.current = false;
          }
          break;
        default:
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [playPause, isDrawingMode, undo, redo, clear, toggleMode]);

  return (
    <FullscreenProvider>
      <div className="relative flex flex-1 justify-between overflow-y-auto bg-gray-50" ref={setWrapper}>
        <div
          className={clsx(
            'absolute inset-0 size-full overflow-hidden',
            isDrawingMode && (drawingTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair'),
          )}
        >
          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="absolute inset-0" />
          <canvas
            ref={drawingCanvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={clsx('absolute inset-0', {
              'pointer-events-none': !isDrawingMode,
            })}
          />
        </div>
        <Timer />
        <div className="absolute top-8 left-8 flex w-[352px] flex-col gap-y-8 overflow-auto">
          <TeamPanel teamNumber={round.teamASide} teamName={match.teamA.name} teamScore={round.teamAScore} />
          <TeamPanel teamNumber={round.teamBSide} teamName={match.teamB.name} teamScore={round.teamBScore} />
        </div>
        <KillsFeed />
      </div>
      <RoundsBar />
      <PlaybackBar drawing={drawing} />
    </FullscreenProvider>
  );
}
