import React, { useMemo } from 'react';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import { useDeathNotices } from './use-death-notices';
import { PlayerNameInput } from './player-name-input';
import { ShowPlayerKillsCheckbox } from './show-player-kills-checkbox';
import { HighlightPlayerKillsCheckbox } from './highlight-player-kills-checkbox';

function getRowId(row: DeathNoticesPlayerOptions) {
  return row.steamId;
}

export function DeathNotices() {
  const { deathNotices } = useDeathNotices();

  const columns = useMemo(() => {
    return [
      {
        id: 'player-name',
        accessor: 'playerName',
        headerText: 'Player',
        headerTooltip: `Player's name`,
        width: 350,
        Cell: PlayerNameInput,
        allowSort: false,
        allowResize: false,
        allowMove: false,
      },
      {
        id: 'show-kills',
        accessor: 'showKill',
        headerText: 'S',
        headerTooltip: 'Show kills',
        width: 40,
        Cell: ShowPlayerKillsCheckbox,
        allowSort: false,
        allowResize: false,
        allowMove: false,
      },
      {
        id: 'highlight-kills',
        accessor: 'highlightKill',
        headerText: 'H',
        headerTooltip: 'Highlight kills',
        width: 40,
        Cell: HighlightPlayerKillsCheckbox,
        allowSort: false,
        allowResize: false,
        allowMove: false,
      },
    ] as const satisfies readonly Column<DeathNoticesPlayerOptions>[];
  }, []);

  const table = useTable({
    columns,
    data: deathNotices,
    getRowId,
    rowSelection: 'none',
  });

  return <Table<DeathNoticesPlayerOptions> table={table} />;
}
