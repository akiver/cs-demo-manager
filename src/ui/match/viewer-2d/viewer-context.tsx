import type { ReactNode } from 'react';
import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router';
import type { BombDefused } from 'csdm/common/types/bomb-defused';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';
import type { BombExploded } from 'csdm/common/types/bomb-exploded';
import type { GrenadePosition } from 'csdm/common/types/grenade-position';
import type { HostagePosition } from 'csdm/common/types/hostage-position';
import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import type { Kill } from 'csdm/common/types/kill';
import type { Map } from 'csdm/common/types/map';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import type { Round } from 'csdm/common/types/round';
import type { Shot } from 'csdm/common/types/shot';
import { useCurrentMatch } from '../use-current-match';
import { buildMatch2dViewerRoundPath } from 'csdm/ui/routes-paths';
import type { BombPlantStart } from 'csdm/common/types/bomb-plant-start';
import type { BombDefuseStart } from 'csdm/common/types/bomb-defuse-start';
import type { HostagePickUpStart } from 'csdm/common/types/hostage-pick-up-start';
import type { HostagePickedUp } from 'csdm/common/types/hostage-picked-up';
import type { ChickenPosition } from 'csdm/common/types/chicken-position';
import type { DecoyStart } from 'csdm/common/types/decoy-start';
import type { SmokeStart } from 'csdm/common/types/smoke-start';
import type { HeGrenadeExplode } from 'csdm/common/types/he-grenade-explode';
import type { FlashbangExplode } from 'csdm/common/types/flashbang-explode';
import type { Game } from 'csdm/common/types/counter-strike';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import {
  audioOffsetChanged,
  focusedPlayerChanged,
  resetAudioOffset,
  speedChanged,
  volumeChanged,
} from './viewer-actions';
import { useViewer2DState } from './use-viewer-state';
import { deleteDemoAudioOffset, persistDemoAudioOffset } from './audio/audio-offset';
import type { DrawingTool } from './drawing/use-drawable-canvas';

type ViewerMode = 'drawing' | 'playback';

type ViewerContext = {
  mode: ViewerMode;
  setMode: (mode: ViewerMode) => void;
  toggleMode: () => void;
  isDrawingMode: boolean;
  tickrate: number;
  speed: number;
  setSpeed: (speed: number) => void;
  currentTick: number;
  setCurrentTick: (tick: number) => void;
  timeRemaining: number;
  play: (tick?: number) => void;
  pause: () => void;
  playPause: () => Promise<void>;
  isPlaying: boolean;
  changeRound: (roundNumber: number) => void;
  volume: number;
  updateVolume: (volume: number) => void;
  updateAudioOffset: (seconds: number) => void;
  resetAudioOffset: () => void;
  loadAudioFile: (audioFilePath: string) => Promise<void>;
  unloadAudioFile: () => void;
  audioBytes: Uint8Array<ArrayBuffer>;
  map: Map;
  game: Game;
  kills: Kill[];
  round: Round;
  shots: Shot[];
  playerPositions: PlayerPosition[];
  hostagesPickUpStart: HostagePickUpStart[];
  heGrenadesExplode: HeGrenadeExplode[];
  flashbangsExplode: FlashbangExplode[];
  smokesStart: SmokeStart[];
  decoysStart: DecoyStart[];
  hostagesPickedUp: HostagePickedUp[];
  hostagePositions: HostagePosition[];
  grenadePositions: GrenadePosition[];
  infernoPositions: InfernoPosition[];
  chickenPositions: ChickenPosition[];
  bombsPlantStart: BombPlantStart[];
  bombsDefuseStart: BombDefuseStart[];
  bombExploded: BombExploded | null;
  bombPlanted: BombPlanted | null;
  bombDefused: BombDefused | null;
  shouldDrawBombs: boolean;
  focusedPlayerId: string | undefined;
  updateFocusedPlayerId: (id: string) => void;
  lowerRadarOffsetX: number;
  setLowerRadarOffsetX: (offsetX: number) => void;
  lowerRadarOffsetY: number;
  setLowerRadarOffsetY: (offsetY: number) => void;
  lowerRadarOpacity: number;
  setLowerRadarOpacity: (opacity: number) => void;
  drawingTool: DrawingTool;
  setDrawingTool: (tool: DrawingTool) => void;
  drawingSize: number;
  setDrawingSize: (width: number) => void;
  drawingColor: string;
  setDrawingColor: (color: string) => void;
};

export const ViewerContext = createContext<ViewerContext | undefined>(undefined);

type Props = {
  children: ReactNode;
  map: Map;
  kills: Kill[];
  round: Round;
  shots: Shot[];
  playerPositions: PlayerPosition[];
  hostagesPickUpStart: HostagePickUpStart[];
  hostagesPickedUp: HostagePickedUp[];
  hostagePositions: HostagePosition[];
  grenadePositions: GrenadePosition[];
  infernoPositions: InfernoPosition[];
  chickenPositions: ChickenPosition[];
  heGrenadesExplode: HeGrenadeExplode[];
  flashbangsExplode: FlashbangExplode[];
  decoysStart: DecoyStart[];
  smokesStart: SmokeStart[];
  bombsPlantStart: BombPlantStart[];
  bombsDefuseStart: BombDefuseStart[];
  bombExploded: BombExploded | null;
  bombPlanted: BombPlanted | null;
  bombDefused: BombDefused | null;
  audio: HTMLAudioElement | null;
  audioBytes: Uint8Array<ArrayBuffer>;
  loadAudioFile: (audioFilePath: string) => Promise<void>;
  unloadAudioFile: () => void;
};

export function ViewerProvider({
  children,
  map,
  round,
  kills,
  shots,
  playerPositions,
  hostagesPickUpStart,
  hostagesPickedUp,
  hostagePositions,
  grenadePositions,
  infernoPositions,
  chickenPositions,
  bombsPlantStart,
  bombsDefuseStart,
  bombExploded,
  bombPlanted,
  bombDefused,
  decoysStart,
  heGrenadesExplode,
  smokesStart,
  flashbangsExplode,
  audio,
  audioBytes,
  loadAudioFile,
  unloadAudioFile,
}: Props) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const viewerState = useViewer2DState();
  const [mode, setMode] = useState<ViewerMode>('playback');
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('pen');
  const [drawingSize, setDrawingSize] = useState(2);
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [currentTick, setCurrentTick] = useState(round.freezetimeEndTick);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lowerRadarOffsetX, setLowerRadarOffsetX] = useState(() => {
    const value = window.localStorage.getItem(`${match.game}_${match.mapName}_lower_radar_offset_x`);
    return value ? Number.parseInt(value) : 0;
  });
  const [lowerRadarOffsetY, setLowerRadarOffsetY] = useState(() => {
    const value = window.localStorage.getItem(`${match.game}_${match.mapName}_lower_radar_offset_y`);
    return value ? Number.parseInt(value) : 0;
  });
  const [lowerRadarOpacity, setLowerRadarOpacity] = useState(() => {
    const value = window.localStorage.getItem(`${match.game}_${match.mapName}_lower_radar_opacity`);
    return value ? Number.parseFloat(value) : 1;
  });
  const remainingTickCount = round.endOfficiallyTick - currentTick;
  const tickrate = match.tickrate > 0 ? match.tickrate : 64;
  const timeRemaining = (remainingTickCount / tickrate) * 1000;
  const shouldDrawBombs = match.mapName.startsWith('de_');
  const navigate = useNavigate();
  const { audioOffsetSeconds, volume } = viewerState;

  const clampAudioTime = (seconds: number): number => {
    if (!audio || isNaN(audio.duration)) {
      return 0;
    }

    return Math.max(0, Math.min(seconds, audio.duration));
  };

  const play = async (tick?: number) => {
    setIsPlaying(true);
    if (tick) {
      setCurrentTick(tick);
    }
    if (audio) {
      // eslint-disable-next-line react-hooks/react-compiler
      audio.currentTime = clampAudioTime((tick ?? currentTick) / tickrate + audioOffsetSeconds);
      try {
        await audio.play();
      } catch (error) {
        // noop
      }
    }
  };

  const pause = () => {
    setIsPlaying(false);
    audio?.pause();
  };

  return (
    <ViewerContext.Provider
      value={{
        mode,
        setMode,
        isDrawingMode: mode === 'drawing',
        toggleMode: () =>
          setMode((mode) => {
            return mode === 'drawing' ? 'playback' : 'drawing';
          }),
        tickrate,
        map,
        currentTick,
        setCurrentTick,
        timeRemaining,
        isPlaying,
        volume,
        audioBytes,
        play,
        pause,
        playPause: async () => {
          if (isPlaying) {
            pause();
          } else {
            await play();
          }
        },
        updateVolume: (volume) => {
          if (!audio) {
            return;
          }
          audio.volume = volume;
          dispatch(volumeChanged({ volume }));
        },
        updateAudioOffset: (seconds: number) => {
          if (!audio) {
            return;
          }

          audio.currentTime = clampAudioTime(currentTick / tickrate + seconds);
          dispatch(audioOffsetChanged({ seconds }));
          persistDemoAudioOffset(match.checksum, seconds);
        },
        resetAudioOffset: () => {
          dispatch(resetAudioOffset());
          deleteDemoAudioOffset(match.checksum);
        },
        loadAudioFile,
        unloadAudioFile,
        game: match.game,
        shouldDrawBombs,
        playerPositions,
        heGrenadesExplode,
        smokesStart,
        decoysStart,
        flashbangsExplode,
        hostagesPickUpStart,
        hostagesPickedUp,
        hostagePositions,
        grenadePositions,
        infernoPositions,
        chickenPositions,
        bombsPlantStart,
        bombsDefuseStart,
        bombExploded,
        bombPlanted,
        bombDefused,
        kills,
        shots,
        round,
        drawingTool,
        setDrawingTool,
        drawingColor,
        setDrawingColor,
        drawingSize,
        setDrawingSize,
        changeRound: (roundNumber: number) => {
          audio?.pause();
          navigate(buildMatch2dViewerRoundPath(match.checksum, roundNumber));
        },
        speed: viewerState.speed,
        setSpeed: (speed: number) => {
          dispatch(speedChanged({ speed }));
          if (audio) {
            audio.playbackRate = speed;
          }
        },
        focusedPlayerId: viewerState.focusedPlayerId,
        updateFocusedPlayerId: (id: string) => {
          const newId = id === viewerState.focusedPlayerId ? undefined : id;
          dispatch(focusedPlayerChanged({ focusedPlayerId: newId }));
        },
        lowerRadarOffsetX,
        setLowerRadarOffsetX: (offsetX: number) => {
          window.localStorage.setItem(`${match.game}_${match.mapName}_lower_radar_offset_x`, String(offsetX));
          setLowerRadarOffsetX(offsetX);
        },
        lowerRadarOffsetY,
        setLowerRadarOffsetY: (offsetY: number) => {
          window.localStorage.setItem(`${match.game}_${match.mapName}_lower_radar_offset_y`, String(offsetY));
          setLowerRadarOffsetY(offsetY);
        },
        lowerRadarOpacity,
        setLowerRadarOpacity: (opacity: number) => {
          window.localStorage.setItem(`${match.game}_${match.mapName}_lower_radar_opacity`, String(opacity));
          setLowerRadarOpacity(opacity);
        },
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}
