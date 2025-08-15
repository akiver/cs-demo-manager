import { useLingui } from '@lingui/react/macro';
import { KillDeathDiffCell } from 'csdm/ui/components/table/cells/kill-death-diff-cell';
import { RankCell } from 'csdm/ui/components/table/cells/rank-cell';
import type { Column } from 'csdm/ui/components/table/table-types';
import { getTableRowHeight } from 'csdm/ui/components/table/get-table-row-height';
import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { ScoreboardAvatarCell } from './scoreboard-avatar-cell';
import { BansCell } from './bans-cell';
import { killDeathDiffSortFunction } from 'csdm/ui/components/table/kill-death-diff-sort-function';

export function useScoreboardColumns(isDefuseMap: boolean) {
  const { t } = useLingui();

  const columns: Column<MatchPlayer>[] = [
    {
      id: 'avatar',
      accessor: 'avatar',
      headerText: '',
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Avatar',
      }),
      width: getTableRowHeight(),
      Cell: ScoreboardAvatarCell,
      noPadding: true,
      allowHiding: false,
      allowResize: false,
      allowSort: false,
      allowMove: false,
    },
    {
      id: 'bans',
      accessor: 'lastBanDate',
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
      noPadding: true,
      Cell: RankCell,
      allowResize: false,
      allowSort: false,
      allowMove: false,
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
      allowHiding: false,
      width: 160,
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
      width: 40,
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
      width: 40,
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
      width: 40,
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
    },
    {
      id: 'damage-health',
      accessor: 'damageHealth',
      headerText: t({
        context: 'Table header damage health',
        message: 'DMG',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Damages',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Damages',
      }),
      width: 60,
      maxWidth: 100,
      textAlign: 'right',
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
      id: 'udr',
      accessor: 'averageUtilityDamagePerRound',
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
        message: 'Utility Damage per Round',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value, 1);
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
        message: 'Headshot percentage',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
      formatter: (value: number) => {
        return roundNumber(value);
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
      id: 'utility-damage',
      accessor: 'utilityDamage',
      headerText: t({
        context: 'Table header utility damage',
        message: 'UD',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Total Utility Damage Dealt',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Utility Damage',
      }),
      width: 50,
      maxWidth: 100,
      textAlign: 'right',
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
      id: 'trade-kill-count',
      accessor: 'tradeKillCount',
      headerText: t({
        context: 'Table header trade kill count',
        message: 'TK',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Trade Kills (Kill revenged within 5s after a teammate died)',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Trade Kills',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'trade-death-count',
      accessor: 'tradeDeathCount',
      headerText: t({
        context: 'Table header trade death count',
        message: 'TD',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Trade Deaths (Death revenged by a teammate within 5s after the player died)',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Trade Deaths',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'first-trade-kill-count',
      accessor: 'firstTradeKillCount',
      headerText: t({
        context: 'Table header first trade kill count',
        message: 'FTK',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'First Trade Kills (Kill revenged within 5s after a teammate died)',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'First Trade Kills',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'first-trade-death-count',
      accessor: 'firstTradeDeathCount',
      headerText: t({
        context: 'Table header first trade death count',
        message: 'FTD',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'First Trade Deaths (Death revenged by a teammate within 5s after the player died)',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'First Trade Deaths',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'wallbangKillCount',
      accessor: 'wallbangKillCount',
      headerText: t({
        context: 'Table header wallbang kill count',
        message: 'WB',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Wallbang Kill',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Wallbang Kills',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
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
        message: 'Collateral Kills',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: 'noScopeKillCount',
      accessor: 'noScopeKillCount',
      headerText: t({
        context: 'Table header no scope kill count',
        message: 'NS',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'No Scope Kill',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'No Scope Kills',
      }),
      width: 40,
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
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Score',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
  ];

  if (isDefuseMap) {
    columns.push(
      {
        id: 'bomb-planted-count',
        accessor: 'bombPlantedCount',
        headerText: t({
          context: 'Table header bomb planted count',
          message: 'BP',
        }),
        headerTooltip: t({
          context: 'Table header tooltip',
          message: 'Bomb Planted',
        }),
        visibilityText: t({
          context: 'Dropdown column visibility',
          message: 'Bomb Planted',
        }),
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
      {
        id: 'bomb-defused-count',
        accessor: 'bombDefusedCount',
        headerText: t({
          context: 'Table header bomb defused count',
          message: 'BD',
        }),
        headerTooltip: t({
          context: 'Table header tooltip',
          message: 'Bomb Defused',
        }),
        visibilityText: t({
          context: 'Dropdown column visibility',
          message: 'Bomb Defused',
        }),
        width: 40,
        maxWidth: 100,
        textAlign: 'right',
      },
    );
  } else {
    columns.push({
      id: 'hostage-rescued-count',
      accessor: 'hostageRescuedCount',
      headerText: t({
        context: 'Table header hostage rescued count',
        message: 'HR',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: 'Hostage Rescued',
      }),
      visibilityText: t({
        context: 'Dropdown column visibility',
        message: 'Hostage Rescued',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    });
  }

  columns.push(
    {
      id: 'five-kill-count',
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
      id: 'four-kill-count',
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
      id: 'three-kill-count',
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
      id: 'two-kill-count',
      accessor: 'twoKillCount',
      headerText: t({
        context: 'Table header',
        message: '2K',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '2-kill rounds',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '1-vs-five-won-count',
      accessor: 'vsFiveWonCount',
      headerText: t({
        context: 'Table header',
        message: '1v5',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '1 versus 5 won',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '1-vs-four-won-count',
      accessor: 'vsFourWonCount',
      headerText: t({
        context: 'Table header',
        message: '1v4',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '1 versus 4 won',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '1-vs-three-won-count',
      accessor: 'vsThreeWonCount',
      headerText: t({
        context: 'Table header',
        message: '1v3',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '1 versus 3 won',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '1-vs-two-won-count',
      accessor: 'vsTwoWonCount',
      headerText: t({
        context: 'Table header',
        message: '1v2',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '1 versus 2 won',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
    {
      id: '1-vs-one-won-count',
      accessor: 'vsOneWonCount',
      headerText: t({
        context: 'Table header',
        message: '1v1',
      }),
      headerTooltip: t({
        context: 'Table header tooltip',
        message: '1 versus 1 won',
      }),
      width: 40,
      maxWidth: 100,
      textAlign: 'right',
    },
  );

  return columns;
}
