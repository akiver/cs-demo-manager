import { roundNumber } from 'csdm/common/math/round-number';
import type { Column } from '../column';
import { MultiplePlayerExportSheet } from './multiple-player-export-sheet';
import { fetchPlayersRows, type PlayerRow } from 'csdm/node/database/xlsx/fetch-players-rows';

export class PlayersSheet extends MultiplePlayerExportSheet<PlayerRow> {
  protected getName() {
    return 'Players';
  }

  protected getColumns(): Column<PlayerRow>[] {
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
        name: 'match_count',
        cellFormatter: (row) => row.matchCount,
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
        name: 'bomb_planted_count',
        cellFormatter: (row) => row.bombPlantedCount,
      },
      {
        name: 'bomb_defused_count',
        cellFormatter: (row) => row.bombDefusedCount,
      },
      {
        name: 'hostage_rescued_count',
        cellFormatter: (row) => row.hostageRescuedCount,
      },
      {
        name: 'kd',
        cellFormatter: (row) => roundNumber(row.killDeathRatio, 1),
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
        cellFormatter: (row) => roundNumber(row.headshotPercentage, 1),
      },
      {
        name: 'rank',
        cellFormatter: (row) => row.rank,
      },
      {
        name: 'HLTV',
        cellFormatter: (row) => roundNumber(row.hltvRating, 2),
      },
      {
        name: 'HLTV 2.0',
        cellFormatter: (row) => roundNumber(row.hltvRating2, 2),
      },
      {
        name: 'kast',
        cellFormatter: (row) => roundNumber(row.kast, 1),
      },
      {
        name: 'adr',
        cellFormatter: (row) => roundNumber(row.averageDamagePerRound, 1),
      },
      {
        name: 'utility_damage',
        cellFormatter: (row) => row.utilityDamage,
      },
      {
        name: 'udr',
        cellFormatter: (row) => roundNumber(row.averageUtilityDamagePerRound, 1),
      },
      {
        name: 'avg_kills_per_round',
        cellFormatter: (row) => roundNumber(row.averageKillsPerRound, 1),
      },
      {
        name: 'avg_deaths_per_round',
        cellFormatter: (row) => roundNumber(row.averageDeathsPerRound, 1),
      },
      {
        name: '3k',
        cellFormatter: (row) => row.threeKillCount,
      },
      {
        name: '4k',
        cellFormatter: (row) => row.fourKillCount,
      },
      {
        name: '5k',
        cellFormatter: (row) => row.fiveKillCount,
      },
      {
        name: 'game_ban_count',
        cellFormatter: (row) => row.gameBanCount,
      },
      {
        name: 'community_banned',
        cellFormatter: (row) => row.isCommunityBanned,
      },
      {
        name: 'vac_ban_count',
        cellFormatter: (row) => row.vacBanCount,
      },
      {
        name: 'last_ban_date',
        cellFormatter: (row) => row.lastBanDate ?? '',
      },
    ];
  }

  public async generate() {
    const rows = await fetchPlayersRows({ steamIds: this.steamIds });
    for (const row of rows) {
      this.writeRow(row);
    }
  }
}
