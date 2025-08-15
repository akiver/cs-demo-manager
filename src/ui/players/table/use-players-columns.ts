import { useLingui } from '@lingui/react/macro';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { RankCell } from 'csdm/ui/components/table/cells/rank-cell';
import { getTableRowHeight } from 'csdm/ui/components/table/get-table-row-height';
import { roundNumber } from 'csdm/common/math/round-number';
import { PlayerAvatarCell } from './player-avatar-cell';
import type { PlayerTable } from 'csdm/common/types/player-table';
import type { Column } from 'csdm/ui/components/table/table-types';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { BansCell } from './bans-cell';
import { CommentCell } from 'csdm/ui/components/table/cells/comment-cell';
import { TagsCell } from 'csdm/ui/components/table/cells/tags-cell';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function usePlayersColumns() {
  const formatDate = useFormatDate();
  const { t } = useLingui();

  const columns: readonly Column<PlayerTable>[] = [
    {
      id: 'comment',
      accessor: 'comment',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Comment',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Comment',
      }),
      Cell: CommentCell,
      width: 20,
      allowResize: false,
      allowMove: false,
    },
    {
      id: 'tags',
      accessor: 'tagIds',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Tags',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Tags',
      }),
      Cell: TagsCell,
      width: 20,
      allowResize: false,
      allowMove: false,
      allowSort: false,
    },
    {
      id: 'avatar',
      accessor: 'avatar',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Avatar',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Avatar',
      }),
      width: getTableRowHeight(),
      allowResize: false,
      allowSort: false,
      allowMove: false,
      Cell: PlayerAvatarCell,
      noPadding: true,
    },
    {
      id: 'rank',
      accessor: 'rank',
      headerText: t({
        context: 'Table header',
        message: 'Rank',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Rank',
      }),
      width: 65,
      Cell: RankCell,
      noPadding: true,
      allowResize: false,
    },
    {
      id: 'bans',
      accessor: 'isVacBanned',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Bans',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Bans',
      }),
      Cell: BansCell,
      width: 20,
      allowResize: false,
      allowMove: false,
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
      id: 'udr',
      accessor: 'utilityDamagePerRound',
      headerText: t({
        context: 'Table header utility damage per round',
        message: 'UDR',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Utility damage per round',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Utility damage per round',
      }),
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value) => {
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
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value) => {
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
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'last-match-ban',
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
      sortFunction: dateSortFunction<PlayerTable>,
      formatter: (date: string) => {
        return formatDate(date);
      },
    },
    {
      id: 'last-ban-date',
      accessor: 'lastBanDate',
      headerText: t({
        context: 'Table header',
        message: 'Last ban date',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Last ban date',
      }),
      width: 200,
      maxWidth: 250,
      sortFunction: dateSortFunction<PlayerTable>,
      formatter: (date: string | null) => {
        if (date === null) {
          return;
        }
        return formatDate(date);
      },
    },
  ];

  return columns;
}
