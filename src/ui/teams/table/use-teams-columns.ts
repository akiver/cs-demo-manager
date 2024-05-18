import { useMemo } from 'react';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Column } from 'csdm/ui/components/table/table-types';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { msg } from '@lingui/macro';
import type { TeamTable } from 'csdm/common/types/team-table';

export function useTeamsColumns() {
  const formatDate = useFormatDate();
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
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
        width: 200,
        maxWidth: 500,
      },
      {
        id: 'match-count',
        accessor: 'matchCount',
        headerText: _(
          msg({
            context: 'Table header match count',
            message: 'Matches',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Number of matches played',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
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
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
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
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
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
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
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
        textAlign: 'right',
        Cell: KillDeathDiffCell,
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
        textAlign: 'right',
        formatter: (value: number) => {
          return roundNumber(value, 2);
        },
      },
      {
        id: 'hltv-rating-2',
        accessor: 'hltvRating2',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'HLTV 2.0',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Estimated HLTV 2.0 rating',
          }),
        ),
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
        headerText: _(
          msg({
            context: 'Table header',
            message: 'HLTV',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'HLTV 1.0 rating',
          }),
        ),
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
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
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
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Headshot %',
          }),
        ),
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
        headerText: _(
          msg({
            context: 'Table header kast',
            message: 'KAST',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Percentage of rounds in which the player either had a kill, assist, survived or was traded',
          }),
        ),
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
        id: 'fourKill',
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
        id: 'fiveKill',
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
      {
        id: 'adr',
        accessor: 'averageDamagePerRound',
        headerText: _(
          msg({
            context: 'Table header average damage per round',
            message: 'ADR',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Average Damage per Round',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Average Damage per Round',
          }),
        ),
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
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Last match date',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Last match date',
          }),
        ),
        width: 200,
        maxWidth: 250,
        sortFunction: dateSortFunction<TeamTable>,
        formatter: (date: string) => {
          return formatDate(date);
        },
      },
    ] as const satisfies readonly Column<TeamTable>[];
  }, [_, formatDate]);

  return columns;
}
