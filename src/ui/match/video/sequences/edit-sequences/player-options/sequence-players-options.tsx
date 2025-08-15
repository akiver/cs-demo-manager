import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { useTable } from 'csdm/ui/components/table/use-table';
import { Table } from 'csdm/ui/components/table/table';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import { usePlayersOptions } from './use-players-options';
import { PlayerNameInput } from './player-name-input';
import { ShowPlayerKillsCheckbox } from './show-player-kills-checkbox';
import { HighlightPlayerKillsCheckbox } from './highlight-player-kills-checkbox';
import { EnablePlayerVoicesCheckbox } from './enable-player-voices-checkbox';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Game } from 'csdm/common/types/counter-strike';

function getRowId(row: SequencePlayerOptions) {
  return row.steamId;
}

export function SequencePlayersOptions() {
  const match = useCurrentMatch();
  const { t } = useLingui();
  const { options } = usePlayersOptions();

  const columns: Column<SequencePlayerOptions>[] = [
    {
      id: 'player-name',
      accessor: 'playerName',
      headerText: t({
        context: 'Table header',
        message: 'Player',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: `Player's name`,
      }),
      width: 350,
      Cell: PlayerNameInput,
      allowSort: false,
      allowResize: false,
      allowMove: false,
    },
  ];

  // Death notices edition is available only on Windows
  if (window.csdm.isWindows) {
    columns.push(
      {
        id: 'show-kills',
        accessor: 'showKill',
        headerText: t({
          context: 'Table header show kills',
          message: 'K',
        }),
        headerTooltip: t({
          context: 'Table header tooltip',
          message: 'Show kills',
        }),
        width: 40,
        Cell: ShowPlayerKillsCheckbox,
        allowSort: false,
        allowResize: false,
        allowMove: false,
      },
      {
        id: 'highlight-kills',
        accessor: 'highlightKill',
        headerText: t({
          context: 'Table header highlight kills',
          message: 'H',
        }),
        headerTooltip: t({
          context: 'Table header tooltip',
          message: 'Highlight kills',
        }),
        width: 40,
        Cell: HighlightPlayerKillsCheckbox,
        allowSort: false,
        allowResize: false,
        allowMove: false,
      },
    );

    if (match.game !== Game.CSGO) {
      columns.push({
        id: 'voice',
        accessor: 'isVoiceEnabled',
        headerText: t({
          context: 'Table header enable voices',
          message: 'V',
        }),
        headerTooltip: t({
          context: 'Table header tooltip',
          message: 'Voice',
        }),
        width: 40,
        Cell: EnablePlayerVoicesCheckbox,
        allowSort: false,
        allowResize: false,
        allowMove: false,
      });
    }
  }

  const table = useTable({
    columns,
    data: options,
    getRowId,
    rowSelection: 'none',
  });

  return <Table<SequencePlayerOptions> table={table} />;
}
