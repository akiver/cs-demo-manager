import { fetchPlayer } from 'csdm/node/database/player/fetch-player';
import type { Column } from '../column';
import { roundNumber } from 'csdm/common/math/round-number';
import type { Player } from 'csdm/common/types/player';
import { SinglePlayerExportSheet } from './single-player-export-sheet';

export class GeneralSheet extends SinglePlayerExportSheet<Player> {
  protected getName() {
    return 'General';
  }

  protected getColumns(): Column<Player>[] {
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
        name: 'match_won_count',
        cellFormatter: (row) => row.wonMatchCount,
      },
      {
        name: 'match_loss_count',
        cellFormatter: (row) => row.lostMatchCount,
      },
      {
        name: 'match_tied_count',
        cellFormatter: (row) => row.tiedMatchCount,
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
        name: 'competitive_rank',
        cellFormatter: (row) => row.competitiveRank,
      },
      {
        name: 'premier_rank',
        cellFormatter: (row) => row.premierRank,
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
        name: 'wallbang_kill_count',
        cellFormatter: (row) => row.wallbangKillCount,
      },
      {
        name: 'collateral_kill_count',
        cellFormatter: (row) => row.collateralKillCount,
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
        name: 'opening_duels_won_percentage',
        cellFormatter: (row) => row.openingDuelsStats.successPercentage,
      },
      {
        name: 'opening_duels_trade_percentage',
        cellFormatter: (row) => row.openingDuelsStats.tradePercentage,
      },
      {
        name: '1k',
        cellFormatter: (row) => row.oneKillCount,
      },
      {
        name: '2k',
        cellFormatter: (row) => row.twoKillCount,
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
        name: 'round_count',
        cellFormatter: (row) => row.roundCount,
      },
      {
        name: 'round_count_as_ct',
        cellFormatter: (row) => row.roundCountAsCt,
      },
      {
        name: 'round_count_as_t',
        cellFormatter: (row) => row.roundCountAsT,
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
    const player = await fetchPlayer(this.steamId, this.filters);
    this.writeRow(player);
  }
}
