import { useLingui } from '@lingui/react/macro';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { getTableRowHeight } from 'csdm/ui/components/table/get-table-row-height';
import { roundNumber } from 'csdm/common/math/round-number';
import { FiveEPlayAvatarCell } from './5eplay-avatar-cell';
import type { Column } from 'csdm/ui/components/table/table-types';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';
import type { FiveEPlayPlayer } from 'csdm/common/types/5eplay-match';

export function use5EPlayScoreboardColumns() {
  const { t } = useLingui();

  const columns: readonly Column<FiveEPlayPlayer>[] = [
    {
      id: 'avatar',
      accessor: 'avatarUrl',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Avatar',
      }),
      width: getTableRowHeight(),
      Cell: FiveEPlayAvatarCell,
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
      id: 'kast',
      accessor: 'kast',
      headerText: t({
        context: 'Table header kast',
        message: 'KAST',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Percentage of rounds in which the player either had a kill, assist, survived or was traded',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value, 1);
      },
    },
    {
      id: 'adr',
      accessor: 'averageDamagePerRound',
      headerText: t({
        context: 'Table header average damage per round',
        message: 'ADR',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Average Damage per Round',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Average Damage per Round',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value, 1);
      },
    },
    {
      id: 'first-kill-count',
      accessor: 'firstKillCount',
      headerText: t({
        context: 'Table header first kill count',
        message: 'FK',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'First kills of a round',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'First Kills',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'first-death-count',
      accessor: 'firstDeathCount',
      headerText: t({
        context: 'Table header first death count',
        message: 'FD',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'First deaths of a round',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'First Deaths',
      }),
      width: 40,
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
