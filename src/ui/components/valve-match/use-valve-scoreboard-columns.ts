import { useLingui } from '@lingui/react/macro';
import { KillDeathDiffCell } from '../table/cells/kill-death-diff-cell';
import { getTableRowHeight } from '../table/get-table-row-height';
import { ValveAvatarCell } from './avatar-cell';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import type { Column } from '../table/table-types';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function useValveScoreboardColumns() {
  const { t } = useLingui();

  const columns: readonly Column<ValvePlayer>[] = [
    {
      id: 'avatar',
      accessor: 'avatar',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Avatar',
      }),
      width: getTableRowHeight(),
      Cell: ValveAvatarCell,
      noPadding: true,
      allowMove: false,
      allowResize: false,
      allowSort: false,
    },
    {
      id: 'name',
      accessor: 'name',
      headerText: t({
        context: 'Table header',
        message: 'Name',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Name',
      }),
      width: 300,
    },
    {
      id: 'kill-count',
      accessor: 'killCount',
      headerText: t({
        context: 'Table header kill count',
        message: 'K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Kills',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'assist-count',
      accessor: 'assistCount',
      headerText: t({
        context: 'Table header assist count',
        message: 'A',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Assists',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'death-count',
      accessor: 'deathCount',
      headerText: t({
        context: 'Table header death count',
        message: 'D',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Deaths',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'kill-death-diff',
      accessor: 'killCount',
      headerText: t({
        context: 'Table header',
        message: 'K/D diff',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Kill/Death difference',
      }),
      width: 50,
      maxWidth: 100,
      Cell: KillDeathDiffCell,
      sortFunction: killDeathDiffSortFunction,
      textAlign: 'right',
    },
    {
      id: 'mvp',
      accessor: 'mvp',
      headerText: t({
        context: 'Table header mvp count',
        message: 'MVP',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Most Valuable Player',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'score',
      accessor: 'score',
      headerText: t({
        context: 'Table header score',
        message: 'S',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Score',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
  ];

  return columns;
}
