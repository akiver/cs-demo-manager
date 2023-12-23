import React, { useState } from 'react';
import type { Map } from 'csdm/common/types/map';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import type { Kill } from 'csdm/common/types/kill';
import { PlayersSelect } from 'csdm/ui/components/inputs/select/players-select';
import { SideSelect } from 'csdm/ui/components/inputs/select/side-select';
import { OpeningDuelResultSelect } from 'csdm/ui/components/inputs/select/opening-duel-result-select';
import { OpeningDuelResult } from 'csdm/common/types/opening-duel-result';
import { useTooltip } from 'csdm/ui/components/tooltip';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { Table } from 'csdm/ui/components/table/table';
import { useTable } from 'csdm/ui/components/table/use-table';
import { useMapCanvas } from 'csdm/ui/hooks/use-map-canvas';
import { useDrawPlayerDeath } from 'csdm/ui/hooks/drawing/use-draw-player-death';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { useOpeningDuelsMapColumns } from './use-opening-duels-map-columns';
import { OpeningDuelContextMenu } from './opening-duel-context-menu';

function getRowId(kill: Kill): string {
  return String(kill.id);
}

type Props = {
  map: Map;
  radarFileSrc: string;
  kills: Kill[];
};

export function OpeningDuelsMap({ map, kills, radarFileSrc }: Props) {
  const match = useCurrentMatch();
  const { watchDemo, isKillCsRequired } = useCounterStrike();
  const { showDialog } = useDialog();
  const { showContextMenu } = useContextMenu();
  const drawPlayerDeath = useDrawPlayerDeath();
  const [hoveringKill, setHoveringKill] = useState<Kill | undefined>(undefined);
  const [selectedSteamIds, setSelectedSteamIds] = useState<string[]>([]);
  const [selectedSides, setSelectedSides] = useState<TeamNumber[]>([]);
  const [selectedResult, setSelectedResult] = useState<OpeningDuelResult | undefined>(undefined);
  const isTooltipVisible = hoveringKill !== undefined;

  const watchKill = (kill: Kill) => {
    watchDemo({
      demoPath: match.demoFilePath,
      startTick: kill.tick - match.tickrate * 5,
      focusSteamId: kill.killerSteamId,
    });
  };

  const onWatchClick = async (kill: Kill) => {
    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      showDialog(
        <CounterStrikeRunningDialog
          onConfirmClick={() => {
            watchKill(kill);
          }}
        />,
      );
    } else {
      watchKill(kill);
    }
  };

  const buildKills = () => {
    const tableKills: Kill[] = [];
    const wonKills: Kill[] = [];
    const lostKills: Kill[] = [];
    const includeWon = !selectedResult || selectedResult === OpeningDuelResult.Won;
    const includeLost = !selectedResult || selectedResult === OpeningDuelResult.Lost;

    const shouldIncludeSteamId = (steamId: string) => {
      return !selectedSteamIds.length || (selectedSteamIds.length > 0 && selectedSteamIds.includes(steamId));
    };

    const shouldIncludeSide = (side: TeamNumber) => {
      return !selectedSides.length || (selectedSides.length > 0 && selectedSides.includes(side));
    };

    for (const kill of kills) {
      const includeKiller =
        includeWon && shouldIncludeSteamId(kill.killerSteamId) && shouldIncludeSide(kill.killerSide);
      if (includeKiller) {
        wonKills.push(kill);
      }

      const includeVictim =
        includeLost && shouldIncludeSteamId(kill.victimSteamId) && shouldIncludeSide(kill.victimSide);
      if (includeVictim) {
        lostKills.push(kill);
      }

      if (includeVictim || includeKiller) {
        tableKills.push(kill);
      }
    }
    return { tableKills, wonKills, lostKills };
  };

  const { tableKills, wonKills, lostKills } = buildKills();

  const table = useTable<Kill>({
    data: tableKills,
    columns: useOpeningDuelsMapColumns(),
    getRowId,
    rowSelection: 'single',
    onContextMenu: (event, table) => {
      const kills = table.getSelectedRows();
      if (kills.length > 0) {
        showContextMenu(event, <OpeningDuelContextMenu kill={kills[0]} onWatchClick={onWatchClick} />);
      }
    },
  });
  const selectedKill = table.getSelectedRows()[0] ?? undefined;

  const { canvasRef, interactiveCanvas } = useMapCanvas({
    map,
    radarFileSrc,
    draw: (interactiveCanvas, context) => {
      const { zoomedToRadarX, zoomedToRadarY, zoomedSize, getMouseX, getMouseY } = interactiveCanvas;
      let hoveringKill: Kill | undefined = undefined;

      for (const kill of wonKills) {
        const scaledX = zoomedToRadarX(kill.killerX);
        const scaledY = zoomedToRadarY(kill.killerY);
        const playerRadius = zoomedSize(8);
        context.beginPath();
        context.arc(scaledX, scaledY, playerRadius, 0, 2 * Math.PI);
        context.strokeStyle = selectedKill?.id === kill.id ? 'red' : getTeamColor(kill.killerSide);
        context.fillStyle = 'transparent';
        context.lineWidth = zoomedSize(2);
        context.fill();
        context.stroke();

        if (!hoveringKill) {
          const mouseX = getMouseX();
          const mouseY = getMouseY();
          if (context.isPointInPath(mouseX, mouseY)) {
            hoveringKill = kill;
          }
        }

        const hasLostKill = lostKills.some((k) => k.id === kill.id);
        if (hasLostKill) {
          const scaledVictimX = zoomedToRadarX(kill.victimX);
          const scaledVictimY = zoomedToRadarY(kill.victimY);
          context.beginPath();
          context.moveTo(scaledX, scaledY);
          context.lineTo(scaledVictimX, scaledVictimY);
          context.strokeStyle = selectedKill?.id === kill.id ? 'red' : 'white';
          context.lineWidth = zoomedSize(1);
          context.stroke();
        }
      }

      for (const kill of lostKills) {
        const paths = drawPlayerDeath(
          context,
          interactiveCanvas,
          kill.victimX,
          kill.victimY,
          kill.victimSide,
          selectedKill?.id === kill.id ? 'red' : undefined,
        );
        if (!hoveringKill) {
          const mouseX = getMouseX();
          const mouseY = getMouseY();
          const isHoveringKill = paths.some((path) => {
            return context.isPointInStroke(path, mouseX, mouseY);
          });
          if (isHoveringKill) {
            hoveringKill = kill;
          }
        }
      }

      setHoveringKill(hoveringKill);
    },
    onClick: () => {
      if (hoveringKill) {
        const killId = String(hoveringKill.id);
        table.selectRow(killId);
        table.scrollToRow(killId);
      } else {
        table.deselectAll();
      }
    },
    onContextMenu: (event) => {
      if (!hoveringKill) {
        return;
      }

      const killId = String(hoveringKill.id);
      table.selectRow(killId);
      table.scrollToRow(killId);

      showContextMenu(event, <OpeningDuelContextMenu kill={hoveringKill} onWatchClick={onWatchClick} />);
    },
  });
  const { canvasSize, setWrapper } = interactiveCanvas;

  const renderTooltip = () => {
    if (!hoveringKill) {
      return null;
    }

    const round = match.rounds.find((round) => round.number === hoveringKill.roundNumber);
    return (
      <KillFeedEntry
        kill={hoveringKill}
        timeElapsedOption={{
          frameRate: match.frameRate,
          roundStartFrame: round?.startFrame ?? 0,
        }}
      />
    );
  };

  const { refs, getReferenceProps, node } = useTooltip({
    isVisible: isTooltipVisible,
    children: renderTooltip(),
  });

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 mr-12 max-w-[488px] gap-12">
        <PlayersSelect
          players={match.players}
          selectedSteamIds={selectedSteamIds}
          onChange={(steamIds) => {
            setSelectedSteamIds(steamIds);
          }}
        />
        <div className="flex gap-12">
          <SideSelect
            selectedSides={selectedSides}
            onChange={(selectedSide) => {
              setSelectedSides(selectedSide === undefined ? [] : [selectedSide]);
            }}
          />
          <OpeningDuelResultSelect
            selectedResult={selectedResult}
            onChange={(selectedResult) => {
              setSelectedResult(selectedResult);
            }}
          />
        </div>
        <Table<Kill> table={table} />
      </div>
      <div className="flex flex-1 relative bg-gray-50" ref={setWrapper}>
        <div className="absolute top-0 h-full w-full overflow-hidden">
          <canvas
            ref={(ref) => {
              canvasRef.current = ref;
              refs.setReference(ref);
            }}
            width={canvasSize.width}
            height={canvasSize.height}
            {...getReferenceProps()}
          />
          {isTooltipVisible && node}
        </div>
      </div>
    </div>
  );
}
