import React, { useRef } from 'react';
import type { Map } from 'csdm/common/types/map';
import { GrenadeNameSelect } from './grenade-name-select';
import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import { useFilteredGrenadesThrow } from './use-filtered-grenades-throw';
import { FinderRoundsSelect } from './rounds-select';
import { FinderPlayerSelect } from './players-select';
import { FinderRadarLevelSelect } from './radar-level-select';
import { useBuildGrenadeDrawings } from './drawing/build-grenade-drawings';
import { drawGrenadeDrawings } from './drawing/draw-grenade-drawings';
import { GrenadesFinderContextMenu } from './context-menu';
import { FinderSideSelect } from './side-select';
import { useCounterStrike } from 'csdm/ui/hooks/use-counter-strike';
import { CounterStrikeRunningDialog } from 'csdm/ui/components/dialogs/counter-strike-running-dialog';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import type { TableInstance } from 'csdm/ui/components/table/table-types';
import { Table } from 'csdm/ui/components/table/table';
import { useTable } from 'csdm/ui/components/table/use-table';
import { useGrenadesFinderColumns } from './use-grenades-finder-columns';
import { useMapCanvas } from 'csdm/ui/hooks/use-map-canvas';

function getRowId(grenadeThrow: GrenadeThrow): string {
  return grenadeThrow.id;
}

type Props = {
  map: Map;
  grenadesThrow: GrenadeThrow[];
  radarFileSrc: string;
};

export function GrenadesFinder({ map, grenadesThrow, radarFileSrc }: Props) {
  const match = useCurrentMatch();
  const { watchDemo, isKillCsRequired } = useCounterStrike();
  const { showDialog } = useDialog();
  const { showContextMenu } = useContextMenu();
  const hoveredIdRef = useRef<string | undefined>(undefined);
  const filteredGrenadesThrow = useFilteredGrenadesThrow(grenadesThrow);
  const buildGrenadeDrawings = useBuildGrenadeDrawings();
  const { canvasRef, interactiveCanvas } = useMapCanvas({
    map,
    radarFileSrc,
    draw: async (interactiveCanvas, context) => {
      const drawings = await buildGrenadeDrawings(filteredGrenadesThrow, selectedGrenadeThrow?.id, interactiveCanvas);
      drawGrenadeDrawings(drawings, context, interactiveCanvas, hoveredIdRef);
    },
    onClick: () => {
      if (hoveredIdRef.current) {
        table.selectRow(hoveredIdRef.current);
        table.scrollToRow(hoveredIdRef.current);
      } else {
        table.deselectAll();
      }
    },
    onContextMenu: (event) => {
      if (hoveredIdRef.current === undefined) {
        return;
      }

      table.selectRow(hoveredIdRef.current);
      table.scrollToRow(hoveredIdRef.current);
      const grenadeThrow = filteredGrenadesThrow.find((grenade) => {
        return grenade.id === hoveredIdRef.current;
      });

      showContextMenu(event, <GrenadesFinderContextMenu grenadeThrow={grenadeThrow} onWatchClick={onWatchClick} />);
    },
  });
  const { canvasSize, setWrapper } = interactiveCanvas;

  const watchGrenadeThrow = () => {
    if (selectedGrenadeThrow === undefined) {
      return;
    }

    watchDemo({
      demoPath: match.demoFilePath,
      startTick: selectedGrenadeThrow.tick - match.tickrate * 5,
      focusSteamId: selectedGrenadeThrow.throwerSteamId,
    });
  };

  const onWatchClick = async () => {
    const shouldKillCs = await isKillCsRequired();
    if (shouldKillCs) {
      showDialog(<CounterStrikeRunningDialog onConfirmClick={watchGrenadeThrow} />);
    } else {
      watchGrenadeThrow();
    }
  };

  const onContextMenu = (event: MouseEvent, table: TableInstance<GrenadeThrow>) => {
    const grenadesThrow = table.getSelectedRows();
    if (grenadesThrow.length > 0) {
      showContextMenu(event, <GrenadesFinderContextMenu grenadeThrow={grenadesThrow[0]} onWatchClick={onWatchClick} />);
    }
  };

  const columns = useGrenadesFinderColumns();
  const table = useTable<GrenadeThrow>({
    data: filteredGrenadesThrow,
    columns,
    getRowId,
    rowSelection: 'single',
    onContextMenu,
  });
  const selectedGrenadeThrow = table.getSelectedRows()[0] ?? undefined;

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 mr-12 max-w-[488px] gap-y-12">
        <GrenadeNameSelect />
        <FinderRoundsSelect />
        <FinderPlayerSelect />
        <FinderSideSelect />
        <FinderRadarLevelSelect />
        <Table<GrenadeThrow> table={table} />
      </div>
      <div className="flex flex-1 relative bg-gray-50" ref={setWrapper}>
        <div className="absolute top-0 size-full overflow-hidden">
          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} />
        </div>
      </div>
    </div>
  );
}
