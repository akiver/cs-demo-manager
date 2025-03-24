import type { MatchPlayer } from 'csdm/common/types/match-player';
import { playerColorToString } from 'csdm/node/demo-analyzer/player-color-to-string';
import type { Column } from '../column';
import { SingleMatchExportSheet } from './single-match-export-sheet';

export class PlayersSheet extends SingleMatchExportSheet<MatchPlayer> {
  protected getName() {
    return 'Players';
  }

  protected getColumns(): Column<MatchPlayer>[] {
    return [
      {
        name: 'steam_id',
        cellFormatter: (row) => row.steamId,
      },
      {
        name: 'name',
        cellFormatter: (row) => row.name,
      },
      {
        name: 'team_name',
        cellFormatter: (row) => row.teamName,
      },
      {
        name: 'kill_count',
        cellFormatter: (row) => row.killCount,
      },
      {
        name: 'assist_count',
        cellFormatter: (row) => row.assistCount,
      },
      {
        name: 'death_count',
        cellFormatter: (row) => row.deathCount,
      },
      {
        name: 'kd',
        cellFormatter: (row) => row.killDeathRatio,
      },
      {
        name: 'score',
        cellFormatter: (row) => row.score,
      },
      {
        name: 'mvp',
        cellFormatter: (row) => row.mvpCount,
      },
      {
        name: 'headshot_count',
        cellFormatter: (row) => row.headshotCount,
      },
      {
        name: 'headshot_percentage',
        cellFormatter: (row) => row.headshotPercentage,
      },
      {
        name: 'HLTV',
        cellFormatter: (row) => row.hltvRating,
      },
      {
        name: 'HLTV 2.0',
        cellFormatter: (row) => row.hltvRating2,
      },
      {
        name: 'kast',
        cellFormatter: (row) => row.kast,
      },
      {
        name: 'damage_health',
        cellFormatter: (row) => row.damageHealth,
      },
      {
        name: 'damage_armor',
        cellFormatter: (row) => row.damageArmor,
      },
      {
        name: 'first_kill_count',
        cellFormatter: (row) => row.firstKillCount,
      },
      {
        name: 'first_death_count',
        cellFormatter: (row) => row.firstDeathCount,
      },
      {
        name: 'adr',
        cellFormatter: (row) => row.averageDamagePerRound,
      },
      {
        name: 'rank',
        cellFormatter: (row) => row.rank,
      },
      {
        name: 'old_rank',
        cellFormatter: (row) => row.oldRank,
      },
      {
        name: 'wins_count',
        cellFormatter: (row) => row.winsCount,
      },
      {
        name: '1v1',
        cellFormatter: (row) => row.vsOneCount,
      },
      {
        name: '1v2',
        cellFormatter: (row) => row.vsTwoCount,
      },
      {
        name: '1v3',
        cellFormatter: (row) => row.vsThreeCount,
      },
      {
        name: '1v4',
        cellFormatter: (row) => row.vsFourCount,
      },
      {
        name: '1v5',
        cellFormatter: (row) => row.vsFiveCount,
      },
      {
        name: '1v1_won',
        cellFormatter: (row) => row.vsOneWonCount,
      },
      {
        name: '1v2_won',
        cellFormatter: (row) => row.vsTwoWonCount,
      },
      {
        name: '1v3_won',
        cellFormatter: (row) => row.vsThreeWonCount,
      },
      {
        name: '1v4_won',
        cellFormatter: (row) => row.vsFourWonCount,
      },
      {
        name: '1v5_won',
        cellFormatter: (row) => row.vsFiveWonCount,
      },
      {
        name: '1v1_lost',
        cellFormatter: (row) => row.vsOneLostCount,
      },
      {
        name: '1v2_lost',
        cellFormatter: (row) => row.vsTwoLostCount,
      },
      {
        name: '1v3_lost',
        cellFormatter: (row) => row.vsThreeLostCount,
      },
      {
        name: '1v4_lost',
        cellFormatter: (row) => row.vsFourLostCount,
      },
      {
        name: '1v5_lost',
        cellFormatter: (row) => row.vsFiveLostCount,
      },
      {
        name: 'bomb_planted_count',
        cellFormatter: (row) => row.bombPlantedCount,
      },
      {
        name: 'bomb_defused_count',
        cellFormatter: (row) => row.bombDefusedCount,
      },
      {
        name: 'color',
        cellFormatter: (row) => {
          return playerColorToString(row.color);
        },
      },
    ];
  }

  public generate() {
    for (const player of this.match.players) {
      this.writeRow(player);
    }
  }
}
