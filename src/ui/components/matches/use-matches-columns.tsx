import { useLingui } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { useSecondsToFormattedMinutes } from 'csdm/ui/hooks/use-seconds-to-formatted-minutes';
import { CommentCell } from 'csdm/ui/components/table/cells/comment-cell';
import { TagsCell } from 'csdm/ui/components/table/cells/tags-cell';
import { SourceCell } from 'csdm/ui/components/table/cells/source-cell';
import { TeamAScoreCell } from 'csdm/ui/components/matches/team-a-score-cell';
import { TeamBScoreCell } from 'csdm/ui/components/matches/team-b-score-cell';
import type { Column } from 'csdm/ui/components/table/table-types';
import type { MatchTable } from 'csdm/common/types/match-table';
import { dateSortFunction } from 'csdm/ui/components/table/date-sort-function';
import { useFormatDate } from 'csdm/ui/hooks/use-format-date';
import { BansCell } from 'csdm/ui/components/matches/bans-cell';
import { useGetGameModeTranslation } from 'csdm/ui/hooks/use-get-game-mode-translation';
import { type GameMode } from 'csdm/common/types/counter-strike';

export function useMatchesColumns() {
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();
  const formatDate = useFormatDate();
  const getGameModeTranslation = useGetGameModeTranslation();
  const { t } = useLingui();

  const columns: readonly Column<MatchTable>[] = [
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
      id: 'bans',
      accessor: 'bannedPlayerCount',
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
      id: 'game',
      accessor: 'game',
      headerText: t({
        context: 'Table header',
        message: 'Game',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Game',
      }),
      width: 50,
      maxWidth: 100,
    },
    {
      id: 'source',
      accessor: 'source',
      headerText: t({
        context: 'Table header',
        message: 'Source',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Source',
      }),
      Cell: SourceCell,
      width: 75,
      allowResize: false,
    },
    {
      id: 'type',
      accessor: 'type',
      headerText: t({
        context: 'Table header',
        message: 'Type',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Type',
      }),
      width: 60,
      maxWidth: 120,
    },
    {
      id: 'mapName',
      accessor: 'mapName',
      headerText: t({
        context: 'Table header',
        message: 'Map',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Map',
      }),
      width: 120,
      maxWidth: 200,
    },
    {
      id: 'teamNameA',
      accessor: 'teamAName',
      headerText: t({
        context: 'Table header',
        message: 'Team A',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Team A',
      }),
      width: 90,
      maxWidth: 200,
    },
    {
      id: 'teamNameB',
      accessor: 'teamBName',
      headerText: t({
        context: 'Table header',
        message: 'Team B',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Team B',
      }),
      width: 90,
      maxWidth: 200,
    },
    {
      id: 'scoreTeamA',
      accessor: 'teamAScore',
      headerText: t({
        context: 'Table header score team A',
        message: 'STA',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Score Team A',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Score Team A',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      Cell: TeamAScoreCell,
    },
    {
      id: 'scoreTeamB',
      accessor: 'teamBScore',
      headerText: t({
        context: 'Table header score team B',
        message: 'STB',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Score Team B',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Score Team B',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      Cell: TeamBScoreCell,
    },
    {
      id: 'killCount',
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
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'assistCount',
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
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'deathCount',
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
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'fiveKillCount',
      accessor: 'fiveKillCount',
      headerText: t({
        context: 'Table header',
        message: '5K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '5-kill rounds',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'fourKillCount',
      accessor: 'fourKillCount',
      headerText: t({
        context: 'Table header',
        message: '4K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '4-kill rounds',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'threeKillCount',
      accessor: 'threeKillCount',
      headerText: t({
        context: 'Table header',
        message: '3K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '3-kill rounds',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
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
    },
    {
      id: 'date',
      accessor: 'date',
      headerText: t({
        context: 'Table header',
        message: 'Date',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Date',
      }),
      width: 150,
      maxWidth: 200,
      sortFunction: dateSortFunction<MatchTable>,
      formatter: (date: string) => {
        return formatDate(date);
      },
    },
    {
      id: 'gameMode',
      accessor: 'gameMode',
      headerText: t({
        context: 'Table header',
        message: 'Mode',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Game mode',
      }),
      width: 70,
      maxWidth: 160,
      formatter: (gameMode: GameMode) => {
        return getGameModeTranslation(gameMode);
      },
    },
    {
      id: 'duration',
      accessor: 'duration',
      headerText: t({
        context: 'Table header',
        message: 'Duration',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Duration',
      }),
      width: 70,
      maxWidth: 120,
      formatter: (seconds: number) => {
        return secondsToFormattedMinutes(seconds, 'short');
      },
    },
    {
      id: 'collateralKillCount',
      accessor: 'collateralKillCount',
      headerText: t({
        context: 'Table header collateral kill count',
        message: 'CK',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Collateral Kill (two or more enemies killed with a single bullet)',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Collateral kill',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'tickCount',
      accessor: 'tickCount',
      headerText: t({
        context: 'Table header',
        message: 'Ticks',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Ticks',
      }),
      width: 80,
      maxWidth: 120,
      textAlign: 'right',
    },
    {
      id: 'tickrate',
      accessor: 'tickrate',
      headerText: t({
        context: 'Table header',
        message: 'Tickrate',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Tickrate',
      }),
      width: 40,
      maxWidth: 100,
      formatter: (tickrate: number) => {
        return roundNumber(tickrate);
      },
      textAlign: 'right',
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
      width: 350,
      maxWidth: 500,
    },
    {
      id: 'path',
      accessor: 'demoFilePath',
      headerText: t({
        message: 'Path',
        context: 'Table header',
      }),
      headerTooltip: t({
        message: 'Path',
        context: 'Table header tooltip',
      }),
      width: 200,
      maxWidth: 1200,
      showTooltip: true,
    },
    {
      id: 'serverName',
      accessor: 'serverName',
      headerText: t({
        context: 'Table header',
        message: 'Server name',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Server name',
      }),
      width: 250,
    },
    {
      id: 'clientName',
      accessor: 'clientName',
      headerText: t({
        context: 'Table header',
        message: 'Client name',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Client name',
      }),
      width: 140,
    },
    {
      id: 'analyzeDate',
      accessor: 'analyzeDate',
      headerText: t({
        context: 'Table header',
        message: 'Analyze date',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Analyze date',
      }),
      width: 180,
      maxWidth: 250,
      sortFunction: dateSortFunction<MatchTable>,
      formatter: (analyzeDate: string) => {
        return formatDate(analyzeDate);
      },
    },
  ];

  return columns;
}
