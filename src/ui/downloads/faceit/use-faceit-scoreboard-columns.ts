import { useMemo } from 'react';
import { msg } from '@lingui/macro';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { getTableRowHeight } from 'csdm/ui/components/table/get-table-row-height';
import { roundNumber } from 'csdm/common/math/round-number';
import { FaceitAvatarCell } from './avatar-cell';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { FaceitPlayer } from 'csdm/common/types/faceit-match';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function useFaceitScoreboardColumns() {
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
      {
        id: 'avatar',
        accessor: 'avatarUrl',
        headerText: '',
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Avatar',
          }),
        ),
        width: getTableRowHeight(),
        Cell: FaceitAvatarCell,
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
        id: 'kill-death-ratio',
        accessor: 'killDeathRatio',
        headerText: _(
          msg({
            context: 'Table header kill death ratio',
            message: 'K/D',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Kill-Death Ratio',
          }),
        ),
        width: 50,
        maxWidth: 100,
        formatter: (value: number) => {
          return roundNumber(value, 1);
        },
        textAlign: 'right',
      },
      {
        id: 'headshot-count',
        accessor: 'headshotCount',
        headerText: _(
          msg({
            context: 'Table header headshot count',
            message: 'HS',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Headshot',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'headshot-percent',
        accessor: 'headshotPercentage',
        headerText: _(
          msg({
            context: 'Table header headshot percentage',
            message: 'HS%',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Headshot Percentage',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
        formatter: (value: number) => {
          return roundNumber(value, 1);
        },
      },
      {
        id: 'mvp',
        accessor: 'mvpCount',
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
        id: '3k-count',
        accessor: 'threeKillCount',
        headerText: _(
          msg({
            context: 'Table header',
            message: '3K',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: '3-kill rounds',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: '4k-count',
        accessor: 'fourKillCount',
        headerText: _(
          msg({
            context: 'Table header',
            message: '4K',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: '4-kill rounds',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: '5k-count',
        accessor: 'fiveKillCount',
        headerText: _(
          msg({
            context: 'Table header',
            message: '5K',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: '5-kill rounds',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
      },
    ] as const satisfies readonly Column<FaceitPlayer>[];
  }, [_]);

  return columns;
}
