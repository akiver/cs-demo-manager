import type { ReactElement } from 'react';
import React from 'react';
import { msg } from '@lingui/macro';
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
import { useI18n } from 'csdm/ui/hooks/use-i18n';

function useBuildRoundsGroup(match: Match, pixelsPerTick: number, ticksPerSecond: number): Group {
  const _ = useI18n();

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
    label: _(
      msg({
        message: 'Rounds',
        context: 'Timeline group label',
      }),
    ),
    height: itemHeight,
    items,
  };
}

function useBuildKillsGroup(match: Match, pixelsPerTick: number): Group {
  const _ = useI18n();

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
      element: <KillItem kill={kill} />,
    });
  }

  return {
    id: 'kills',
    label: _(
      msg({
        message: 'Kills',
        context: 'Timeline group label',
      }),
    ),
    height: groupHeight,
    items: items,
  };
}

function useBuildBombGroup(match: Match, pixelsPerTick: number): Group {
  const _ = useI18n();

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
    label: _(
      msg({
        message: 'Bomb',
        context: 'Timeline group label',
      }),
    ),
    height: iconSize * 2,
    items: items,
  };
}

export function MatchTimeline() {
  const match = useCurrentMatch();
  const { sequence } = useSequenceForm();
  const startTick = Number(sequence.startTick);
  const endTick = Number(sequence.endTick);
  const { showContextMenu } = useContextMenu();
  const _ = useI18n();

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
  const groups = [roundsGroup, killsGroup, bombGroup, timestampGroup];

  return (
    <div className="flex border border-gray-900">
      <div className="border-r border-r-gray-900 max-w-[200px]">
        {groups.map((group) => {
          return (
            <div
              key={group.id}
              className="flex items-center"
              style={{
                height: group.height,
              }}
            >
              {group.label && <p className="px-4 truncate">{group.label}</p>}
            </div>
          );
        })}
      </div>

      <div {...wrapperProps}>
        <div {...timelineProps}>
          {startTick > 0 && (
            <TimeMarker
              tick={startTick}
              pixelsPerTick={pixelsPerTick}
              text={_(
                msg({
                  message: 'Start tick',
                  context: 'Tooltip',
                }),
              )}
            />
          )}
          {endTick > 0 && (
            <TimeMarker
              tick={endTick}
              pixelsPerTick={pixelsPerTick}
              text={_(
                msg({
                  message: 'End tick',
                  context: 'Tooltip',
                }),
              )}
            />
          )}
          {render(groups)}
        </div>
      </div>
    </div>
  );
}
