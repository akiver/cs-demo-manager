import type { ReactNode } from 'react';
import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import type { BombPlantStart } from 'csdm/common/types/bomb-plant-start';
import type { BombDefuseStart } from 'csdm/common/types/bomb-defuse-start';
import type { HostagePickUpStart } from 'csdm/common/types/hostage-pick-up-start';
import type { HostagePickedUp } from 'csdm/common/types/hostage-picked-up';
import type { ChickenPosition } from 'csdm/common/types/chicken-position';
import type { DecoyStart } from 'csdm/common/types/decoy-start';
import type { SmokeStart } from 'csdm/common/types/smoke-start';
import type { HeGrenadeExplode } from 'csdm/common/types/he-grenade-explode';
import type { FlashbangExplode } from 'csdm/common/types/flashbang-explode';

type ViewerContext = {
  framerate: number;
  speed: number;
  setSpeed: (speed: number) => void;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  timeRemaining: number;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  changeRound: (roundNumber: number) => void;
  map: Map;
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
  radarFilePath: string;
  lowerRadarFilePath: string | undefined;
  radarLevel: RadarLevel;
  setRadarLevel: (radarLevel: RadarLevel) => void;
  focusedPlayerId: string | undefined;
  updateFocusedPlayerId: (id: string) => void;
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
  radarFilePath: string;
  lowerRadarFilePath: string | undefined;
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
  radarFilePath,
  lowerRadarFilePath,
  bombsPlantStart,
  bombsDefuseStart,
  bombExploded,
  bombPlanted,
  bombDefused,
  decoysStart,
  heGrenadesExplode,
  smokesStart,
  flashbangsExplode,
}: Props) {
  const match = useCurrentMatch();
  const [speed, setSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(round.freezetimeEndFrame);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | undefined>(undefined);
  const [radarLevel, setRadarLevel] = useState<RadarLevel>(RadarLevel.Upper);
  const remainingFrameCount = round.endOfficiallyFrame - currentFrame;
  const frameRate = match.frameRate > 0 ? match.frameRate : match.tickrate / 2;
  const timeRemaining = (remainingFrameCount / frameRate) * 1000;
  const navigate = useNavigate();

  return (
    <ViewerContext.Provider
      value={{
        framerate: frameRate,
        focusedPlayerId,
        updateFocusedPlayerId: (id: string) => {
          const newId = id === focusedPlayerId ? undefined : id;
          setFocusedPlayerId(newId);
        },
        radarFilePath,
        setRadarLevel,
        lowerRadarFilePath,
        radarLevel,
        map,
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
        currentFrame,
        setCurrentFrame,
        timeRemaining,
        speed,
        isPlaying,
        setSpeed,
        setIsPlaying,
        kills,
        shots,
        round,
        changeRound: (roundNumber: number) => {
          navigate(buildMatch2dViewerRoundPath(match.checksum, roundNumber));
        },
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}
