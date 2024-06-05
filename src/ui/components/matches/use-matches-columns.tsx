import { useMemo } from 'react';
import { msg } from '@lingui/macro';
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
import { useI18n } from 'csdm/ui/hooks/use-i18n';
import { useGetGameModeTranslation } from 'csdm/ui/hooks/use-get-game-mode-translation';
import { type GameMode } from 'csdm/common/types/counter-strike';

export function useMatchesColumns() {
  const secondsToFormattedMinutes = useSecondsToFormattedMinutes();
  const formatDate = useFormatDate();
  const getGameModeTranslation = useGetGameModeTranslation();
  const _ = useI18n();

  const columns = useMemo(() => {
    return [
      {
        id: 'comment',
        accessor: 'comment',
        headerText: '',
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Comment',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Comment',
          }),
        ),
        Cell: CommentCell,
        width: 20,
        allowResize: false,
        allowMove: false,
        allowSort: false,
      },
      {
        id: 'tags',
        accessor: 'tagIds',
        headerText: '',
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Tags',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Tags',
          }),
        ),
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
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Bans',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Bans',
          }),
        ),
        Cell: BansCell,
        width: 20,
        allowResize: false,
        allowMove: false,
        allowSort: false,
      },
      {
        id: 'game',
        accessor: 'game',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Game',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Game',
          }),
        ),
        width: 50,
        maxWidth: 100,
      },
      {
        id: 'source',
        accessor: 'source',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Source',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Source',
          }),
        ),
        Cell: SourceCell,
        width: 75,
        allowResize: false,
      },
      {
        id: 'type',
        accessor: 'type',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Type',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Type',
          }),
        ),
        width: 60,
        maxWidth: 120,
      },
      {
        id: 'mapName',
        accessor: 'mapName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Map',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Map',
          }),
        ),
        width: 120,
        maxWidth: 200,
      },
      {
        id: 'teamNameA',
        accessor: 'teamAName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Team A',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Team A',
          }),
        ),
        width: 90,
        maxWidth: 200,
      },
      {
        id: 'teamNameB',
        accessor: 'teamBName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Team B',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Team B',
          }),
        ),
        width: 90,
        maxWidth: 200,
      },
      {
        id: 'scoreTeamA',
        accessor: 'teamAScore',
        headerText: _(
          msg({
            context: 'Table header score team A',
            message: 'STA',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Score Team A',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Score Team A',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
        Cell: TeamAScoreCell,
      },
      {
        id: 'scoreTeamB',
        accessor: 'teamBScore',
        headerText: _(
          msg({
            context: 'Table header score team B',
            message: 'STB',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Score Team B',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Score Team B',
          }),
        ),
        width: 50,
        maxWidth: 100,
        textAlign: 'right',
        Cell: TeamBScoreCell,
      },
      {
        id: 'killCount',
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
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'assistCount',
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
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'deathCount',
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
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'fiveKillCount',
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
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'fourKillCount',
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
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'threeKillCount',
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
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
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
      },
      {
        id: 'date',
        accessor: 'date',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Date',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Date',
          }),
        ),
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
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Mode',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Game mode',
          }),
        ),
        width: 70,
        maxWidth: 160,
        formatter: (gameMode: GameMode) => {
          return getGameModeTranslation(gameMode);
        },
      },
      {
        id: 'duration',
        accessor: 'duration',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Duration',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Duration',
          }),
        ),
        width: 70,
        maxWidth: 120,
        formatter: (seconds: number) => {
          return secondsToFormattedMinutes(seconds, 'short');
        },
      },
      {
        id: 'collateralKillCount',
        accessor: 'collateralKillCount',
        headerText: _(
          msg({
            context: 'Table header collateral kill count',
            message: 'CK',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Collateral Kill (two or more enemies killed with a single bullet)',
          }),
        ),
        visibilityText: _(
          msg({
            context: 'Dropdown column visibility',
            message: 'Collateral kill',
          }),
        ),
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'tickCount',
        accessor: 'tickCount',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Ticks',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Ticks',
          }),
        ),
        width: 80,
        maxWidth: 120,
        textAlign: 'right',
      },
      {
        id: 'tickrate',
        accessor: 'tickrate',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Tickrate',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Tickrate',
          }),
        ),
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
        width: 350,
        maxWidth: 500,
      },
      {
        id: 'path',
        accessor: 'demoFilePath',
        headerText: _(
          msg({
            message: 'Path',
            context: 'Table header',
          }),
        ),
        headerTooltip: _(
          msg({
            message: 'Path',
            context: 'Table header tooltip',
          }),
        ),
        width: 200,
        maxWidth: 1200,
        showTooltip: true,
      },
      {
        id: 'serverName',
        accessor: 'serverName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Server name',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Server name',
          }),
        ),
        width: 250,
      },
      {
        id: 'clientName',
        accessor: 'clientName',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Client name',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Client name',
          }),
        ),
        width: 140,
      },
      {
        id: 'analyzeDate',
        accessor: 'analyzeDate',
        headerText: _(
          msg({
            context: 'Table header',
            message: 'Analyze date',
          }),
        ),
        headerTooltip: _(
          msg({
            context: 'Table header tooltip',
            message: 'Analyze date',
          }),
        ),
        width: 180,
        maxWidth: 250,
        sortFunction: dateSortFunction<MatchTable>,
        formatter: (analyzeDate: string) => {
          return formatDate(analyzeDate);
        },
      },
    ] as const satisfies readonly Column<MatchTable>[];
  }, [secondsToFormattedMinutes, formatDate, getGameModeTranslation, _]);

  return columns;
}
