import { useLingui } from '@lingui/react/macro';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Column } from 'csdm/ui/components/table/table-types';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import type { TeamTable } from 'csdm/common/types/team-table';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function useTeamsColumns() {
  const formatDate = useFormatDate();
  const { t } = useLingui();

  const columns: readonly Column<TeamTable>[] = [
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
      width: 200,
      maxWidth: 500,
    },
    {
      id: 'match-count',
      accessor: 'matchCount',
      headerText: t({
        context: 'Table header match count',
        message: 'Matches',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Number of matches played',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
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
      visibilityText: t({
        context: 'Dropdown column visibility',
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
      visibilityText: t({
        context: 'Dropdown column visibility',
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
      visibilityText: t({
        context: 'Dropdown column visibility',
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
      textAlign: 'right',
      Cell: KillDeathDiffCell,
      sortFunction: killDeathDiffSortFunction,
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
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value, 2);
      },
    },
    {
      id: 'hltv-rating-2',
      accessor: 'hltvRating2',
      headerText: t({
        context: 'Table header',
        message: 'HLTV 2.0',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Estimated HLTV 2.0 rating',
      }),
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value, 2);
      },
    },
    {
      id: 'hltv-rating',
      accessor: 'hltvRating',
      headerText: t({
        context: 'Table header',
        message: 'HLTV',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'HLTV 1.0 rating',
      }),
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value, 2);
      },
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
      visibilityText: t({
        context: 'Dropdown column visibility',
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
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Headshot %',
      }),
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value) => {
        return roundNumber(value);
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
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value) => {
        return roundNumber(value, 1);
      },
    },
    {
      id: 'threeKill',
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
      id: 'fourKill',
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
      id: 'fiveKill',
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
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value) => {
        return roundNumber(value, 1);
      },
    },
    {
      id: 'last-match-date',
      accessor: 'lastMatchDate',
      headerText: t({
        context: 'Table header',
        message: 'Last match date',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Last match date',
      }),
      width: 200,
      maxWidth: 250,
      sortFunction: dateSortFunction<TeamTable>,
      formatter: (date: string) => {
        return formatDate(date);
      },
    },
  ];

  return columns;
}
