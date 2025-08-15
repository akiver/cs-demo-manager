import { useLingui } from '@lingui/react/macro';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { getTableRowHeight } from 'csdm/ui/components/table/get-table-row-height';
import { roundNumber } from 'csdm/common/math/round-number';
import { FaceitAvatarCell } from './avatar-cell';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { FaceitPlayer } from 'csdm/common/types/faceit-match';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function useFaceitScoreboardColumns() {
  const { t } = useLingui();

  const columns: readonly Column<FaceitPlayer>[] = [
    {
      id: 'avatar',
      accessor: 'avatarUrl',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Avatar',
      }),
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
      id: 'kill-death-ratio',
      accessor: 'killDeathRatio',
      headerText: t({
        context: 'Table header kill death ratio',
        message: 'K/D',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Kill-Death Ratio',
      }),
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
      headerText: t({
        context: 'Table header headshot count',
        message: 'HS',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Headshot',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'headshot-percent',
      accessor: 'headshotPercentage',
      headerText: t({
        context: 'Table header headshot percentage',
        message: 'HS%',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Headshot Percentage',
      }),
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
      id: '3k-count',
      accessor: 'threeKillCount',
      headerText: t({
        context: 'Table header',
        message: '3K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '3-kill rounds',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '4k-count',
      accessor: 'fourKillCount',
      headerText: t({
        context: 'Table header',
        message: '4K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '4-kill rounds',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '5k-count',
      accessor: 'fiveKillCount',
      headerText: t({
        context: 'Table header',
        message: '5K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '5-kill rounds',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
    },
  ];

  return columns;
}
