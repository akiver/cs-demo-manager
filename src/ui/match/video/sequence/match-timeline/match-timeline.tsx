import type { ReactElement } from 'react';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import type { Group, Item } from 'csdm/ui/components/timeline/use-timeline';
import { useTimeline } from 'csdm/ui/components/timeline/use-timeline';
import type { Match } from 'csdm/common/types/match';
import { useCurrentMatch } from '../../../use-current-match';
import { BombDefusedItem } from './bomb-defused-item';
import { BombExplodedItem } from './bomb-exploded-item';
import { BombPlantedItem } from './bomb-planted-item';
import { KillItem } from './kill-item';
import { RoundItem } from './round-item';
import { TickContextMenu } from './tick-context-menu';
import { TimeMarker } from './time-marker';
import { useSequenceForm } from '../use-sequence-form';
import { CameraMarker } from './camera-marker';
import type { CameraFocus } from 'csdm/common/types/camera-focus';
import { CameraItem } from './camera-item';

function useBuildRoundsGroup(match: Match, pixelsPerTick: number, ticksPerSecond: number): Group {
  const { t } = useLingui();

  const itemHeight = 40;
  const items: Item[] = match.rounds.map((round) => {
    return {
      startTick: round.startTick,
      endTick: round.endTick,
      width: (round.endTick - round.startTick) * pixelsPerTick,
      height: itemHeight,
      x: round.startTick * pixelsPerTick,
      element: <RoundItem round={round} ticksPerSecond={ticksPerSecond} />,
    };
  });

  return {
    id: 'rounds',
    label: t({
      message: 'Rounds',
      context: 'Timeline group label',
    }),
    height: itemHeight,
    items,
  };
}

function useBuildKillsGroup(match: Match, pixelsPerTick: number): Group {
  const { t } = useLingui();

  const items: Item[] = [];
  let currentY = 0;
  const iconSize = 20;
  let groupHeight = iconSize;
  for (let index = 0; index < match.kills.length; index++) {
    const kill = match.kills[index];
    const x = kill.tick * pixelsPerTick - iconSize / 2;
    const previousKill = match.kills[index - 1];
    if (previousKill !== undefined) {
      const previousKillX = previousKill.tick * pixelsPerTick - iconSize / 2;
      if (x < previousKillX + iconSize) {
        currentY += iconSize;
        if (currentY >= groupHeight) {
          groupHeight = currentY + iconSize;
        }
      } else {
        currentY = 0;
      }
    }

    items.push({
      startTick: kill.tick,
      endTick: kill.tick + 1,
      width: iconSize,
      height: iconSize,
      x,
      y: currentY,
      element: <KillItem kill={kill} iconSize={iconSize} />,
    });
  }

  return {
    id: 'kills',
    label: t({
      message: 'Kills',
      context: 'Timeline group label',
    }),
    height: groupHeight,
    items: items,
  };
}

function useBuildBombGroup(match: Match, pixelsPerTick: number): Group {
  const { t } = useLingui();

  const items: Item[] = [];
  const iconSize = 20;

  function buildBombItem(tick: number, element: ReactElement): Item {
    const x = tick * pixelsPerTick - iconSize / 2;
    return {
      startTick: tick,
      endTick: tick + 1,
      width: iconSize,
      height: iconSize,
      x,
      y: iconSize / 2,
      element,
    };
  }

  for (const bombPlanted of match.bombsPlanted) {
    items.push(buildBombItem(bombPlanted.tick, <BombPlantedItem iconSize={iconSize} bombPlanted={bombPlanted} />));
  }

  for (const bombDefused of match.bombsDefused) {
    items.push(buildBombItem(bombDefused.tick, <BombDefusedItem iconSize={iconSize} bombDefused={bombDefused} />));
  }

  for (const bombExploded of match.bombsExploded) {
    items.push(buildBombItem(bombExploded.tick, <BombExplodedItem iconSize={iconSize} bombExploded={bombExploded} />));
  }

  return {
    id: 'bombs',
    label: t({
      message: 'Bomb',
      context: 'Timeline group label',
    }),
    height: iconSize * 2,
    items: items,
  };
}

function useBuildCamerasGroup(match: Match, cameras: CameraFocus[], pixelsPerTick: number): Group {
  const { t } = useLingui();

  const items: Item[] = [];
  let currentY = 0;
  const iconSize = 12;
  let groupHeight = iconSize;
  for (let index = 0; index < cameras.length; index++) {
    const camera = cameras[index];
    const x = camera.tick * pixelsPerTick - iconSize / 2;
    const previousCamera = cameras[index - 1];
    if (previousCamera !== undefined) {
      const previousCameraX = previousCamera.tick * pixelsPerTick - iconSize / 2;
      if (x < previousCameraX + iconSize) {
        currentY += iconSize;
        if (currentY >= groupHeight) {
          groupHeight = currentY + iconSize;
        }
      } else {
        currentY = 0;
      }
    }

    items.push({
      startTick: camera.tick,
      endTick: camera.tick + 1,
      width: iconSize,
      height: iconSize,
      x,
      y: currentY,
      element: <CameraItem camera={camera} />,
    });
  }

  return {
    id: 'cameras',
    label: t({
      message: 'Cameras',
      context: 'Timeline group label',
    }),
    height: groupHeight,
    items: items,
  };
}

export function MatchTimeline() {
  const match = useCurrentMatch();
  const { sequence } = useSequenceForm();
  const startTick = Number(sequence.startTick);
  const endTick = Number(sequence.endTick);
  const { showContextMenu } = useContextMenu();
  const { t } = useLingui();

  const onContextMenu = (event: MouseEvent, tick: number) => {
    showContextMenu(event, <TickContextMenu tick={tick} />);
  };

  const { wrapperProps, timelineProps, pixelsPerTick, ticksPerSecond, timestampGroup, render } = useTimeline({
    tickCount: match.tickCount,
    ticksPerSecond: match.tickrate,
    onContextMenu,
  });
  const roundsGroup = useBuildRoundsGroup(match, pixelsPerTick, ticksPerSecond);
  const killsGroup = useBuildKillsGroup(match, pixelsPerTick);
  const bombGroup = useBuildBombGroup(match, pixelsPerTick);
  const camerasGroup = useBuildCamerasGroup(match, sequence.cameras, pixelsPerTick);
  const groups = [roundsGroup, killsGroup, bombGroup, camerasGroup, timestampGroup];

  const cameraMarkers: { [tick: number]: number } = {}; // tick -> playerIndex
  for (const camera of sequence.cameras) {
    if (cameraMarkers[camera.tick] !== undefined) {
      continue;
    }

    const playerIndex = match.players.findIndex((player) => player.steamId === camera.playerSteamId);
    if (playerIndex === -1) {
      continue;
    }

    cameraMarkers[camera.tick] = playerIndex;
  }

  return (
    <div className="flex border border-gray-900">
      <div className="border-r border-r-gray-900 max-w-[200px]">
        {groups.map((group) => {
          return (
            <div
              key={group.id}
              className="flex items-center"
              style={{
                height: group.height + 8, // add 4px vertical padding
              }}
            >
              {group.label && <p className="px-4 truncate">{group.label}</p>}
            </div>
          );
        })}
      </div>

      <div {...wrapperProps}>
        <div {...timelineProps}>
          {Object.entries(cameraMarkers).map(([tick, playerIndex]) => {
            return (
              <CameraMarker key={tick} tick={Number(tick)} pixelsPerTick={pixelsPerTick} playerIndex={playerIndex} />
            );
          })}
          {startTick > 0 && (
            <TimeMarker
              tick={startTick}
              pixelsPerTick={pixelsPerTick}
              text={t({
                message: 'Start tick',
                context: 'Tooltip',
              })}
            />
          )}
          {endTick > 0 && (
            <TimeMarker
              tick={endTick}
              pixelsPerTick={pixelsPerTick}
              text={t({
                message: 'End tick',
                context: 'Tooltip',
              })}
            />
          )}
          {render(groups)}
        </div>
      </div>
    </div>
  );
}
