import { useMemo } from 'react';
import { msg } from '@lingui/macro';
import { KillDeathDiffCell } from '../table/cells/kill-death-diff-cell';
import { getTableRowHeight } from '../table/get-table-row-height';
import { ValveAvatarCell } from './avatar-cell';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import type { Column } from '../table/table-types';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function useValveScoreboardColumns() {
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
      {
        id: 'avatar',
        accessor: 'avatar',
        headerText: '',
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Avatar',
          }),
        ),
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
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Name',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Name',
          }),
        ),
        width: 300,
      },
      {
        id: 'kill-count',
        accessor: 'killCount',
        headerText: _(
          msg({
            context: 'Table header kill count',
            message: 'K',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Kills',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'assist-count',
        accessor: 'assistCount',
        headerText: _(
          msg({
            context: 'Table header assist count',
            message: 'A',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Assists',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'death-count',
        accessor: 'deathCount',
        headerText: _(
          msg({
            context: 'Table header death count',
            message: 'D',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Deaths',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'kill-death-diff',
        accessor: 'killCount',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'K/D diff',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Kill/Death difference',
          }),
        ),
        width: 50,
        maxWidth: 100,
        Cell: KillDeathDiffCell,
        sortFunction: killDeathDiffSortFunction,
        textAlign: 'right',
      },
      {
        id: 'mvp',
        accessor: 'mvp',
        headerText: _(
          msg({
            context: 'Table header mvp count',
            message: 'MVP',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Most Valuable Player',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'score',
        accessor: 'score',
        headerText: _(
          msg({
            context: 'Table header score',
            message: 'S',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Score',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
    ] as const satisfies readonly Column<ValvePlayer>[];
  }, [_]);

  return columns;
}
